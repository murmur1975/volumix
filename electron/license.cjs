/**
 * Volumix License Manager
 * Lemon Squeezy API連携によるライセンス認証
 */

const Store = require('electron-store');

// セキュアなストレージ設定
const store = new Store({
    name: 'volumix-license',
    encryptionKey: 'volumix-secure-key-2024' // 本番環境では環境変数から取得推奨
});

// Lemon Squeezy API設定
const LEMON_SQUEEZY_API_URL = 'https://api.lemonsqueezy.com/v1';

// Rate Limit設定 (30分間に10ファイルまで)
const RATE_LIMIT_WINDOW_MS = 30 * 60 * 1000; // 30分
const RATE_LIMIT_MAX_FILES = 10;

/**
 * ライセンス状態を取得
 */
function getLicenseStatus() {
    const licenseData = store.get('license');
    const isValid = licenseData && licenseData.valid && licenseData.licenseKey;

    return {
        isPro: isValid,
        licenseKey: licenseData?.licenseKey || null,
        activatedAt: licenseData?.activatedAt || null,
        instanceId: licenseData?.instanceId || null
    };
}

/**
 * Rate Limit状態を取得・更新
 */
function getRateLimitStatus() {
    const now = Date.now();
    let history = store.get('processHistory', []);

    // 期限切れのエントリを削除
    history = history.filter(timestamp => now - timestamp < RATE_LIMIT_WINDOW_MS);
    store.set('processHistory', history);

    return {
        used: history.length,
        limit: RATE_LIMIT_MAX_FILES,
        remaining: Math.max(0, RATE_LIMIT_MAX_FILES - history.length),
        windowMs: RATE_LIMIT_WINDOW_MS,
        resetAt: history.length > 0 ? history[0] + RATE_LIMIT_WINDOW_MS : null
    };
}

/**
 * ファイル処理をRate Limitに記録
 * @param {number} fileCount 処理するファイル数
 * @returns {boolean} 処理可能かどうか
 */
function recordFileProcessing(fileCount = 1) {
    const status = getLicenseStatus();

    // Pro版はRate Limit適用外
    if (status.isPro) {
        return { allowed: true, remaining: Infinity };
    }

    const rateStatus = getRateLimitStatus();

    if (rateStatus.remaining < fileCount) {
        return {
            allowed: false,
            remaining: rateStatus.remaining,
            resetAt: rateStatus.resetAt
        };
    }

    // 処理を記録
    const now = Date.now();
    let history = store.get('processHistory', []);
    for (let i = 0; i < fileCount; i++) {
        history.push(now);
    }
    store.set('processHistory', history);

    return {
        allowed: true,
        remaining: rateStatus.remaining - fileCount
    };
}

/**
 * Lemon Squeezy APIでライセンスをアクティベート
 * @param {string} licenseKey ライセンスキー
 * @param {string} apiKey Lemon Squeezy APIキー
 * @returns {Promise<object>} 認証結果
 */
async function activateLicense(licenseKey, apiKey) {
    try {
        const instanceName = `Volumix-${require('os').hostname()}-${Date.now()}`;

        const response = await fetch(`${LEMON_SQUEEZY_API_URL}/licenses/activate`, {
            method: 'POST',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${apiKey}`
            },
            body: JSON.stringify({
                license_key: licenseKey,
                instance_name: instanceName
            })
        });

        const data = await response.json();

        if (data.activated || data.valid) {
            // ライセンス情報を保存
            store.set('license', {
                valid: true,
                licenseKey: licenseKey,
                instanceId: data.instance?.id || data.license_key?.id,
                activatedAt: new Date().toISOString(),
                meta: data.meta || data.license_key
            });

            return {
                success: true,
                message: 'ライセンスが正常にアクティベートされました！',
                data: data
            };
        } else {
            return {
                success: false,
                message: data.error || 'ライセンスの認証に失敗しました',
                data: data
            };
        }
    } catch (error) {
        console.error('[License] Activation error:', error);
        return {
            success: false,
            message: `認証エラー: ${error.message}`,
            error: error
        };
    }
}

/**
 * ライセンスを検証（オンライン）
 * @param {string} apiKey Lemon Squeezy APIキー
 * @returns {Promise<object>} 検証結果
 */
async function validateLicense(apiKey) {
    const licenseData = store.get('license');

    if (!licenseData || !licenseData.licenseKey) {
        return { valid: false, message: 'ライセンスが登録されていません' };
    }

    try {
        const response = await fetch(`${LEMON_SQUEEZY_API_URL}/licenses/validate`, {
            method: 'POST',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${apiKey}`
            },
            body: JSON.stringify({
                license_key: licenseData.licenseKey,
                instance_id: licenseData.instanceId
            })
        });

        const data = await response.json();

        if (data.valid) {
            return { valid: true, message: 'ライセンスは有効です', data };
        } else {
            // 無効な場合、ローカルデータをクリア
            store.delete('license');
            return { valid: false, message: 'ライセンスが無効です', data };
        }
    } catch (error) {
        // オフラインの場合はローカルデータを信頼
        console.warn('[License] Validation failed (offline?):', error.message);
        return { valid: licenseData.valid, message: 'オフライン検証', offline: true };
    }
}

/**
 * ライセンスをデアクティベート
 * @param {string} apiKey Lemon Squeezy APIキー
 * @returns {Promise<object>} 結果
 */
async function deactivateLicense(apiKey) {
    const licenseData = store.get('license');

    if (!licenseData || !licenseData.licenseKey) {
        return { success: false, message: 'ライセンスが登録されていません' };
    }

    try {
        const response = await fetch(`${LEMON_SQUEEZY_API_URL}/licenses/deactivate`, {
            method: 'POST',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${apiKey}`
            },
            body: JSON.stringify({
                license_key: licenseData.licenseKey,
                instance_id: licenseData.instanceId
            })
        });

        const data = await response.json();

        // ローカルデータをクリア
        store.delete('license');

        return {
            success: true,
            message: 'ライセンスが解除されました',
            data
        };
    } catch (error) {
        console.error('[License] Deactivation error:', error);
        return {
            success: false,
            message: `解除エラー: ${error.message}`,
            error
        };
    }
}

/**
 * Free版の制限を確認
 * @param {number} fileCount 処理しようとしているファイル数
 * @returns {object} 制限情報
 */
function checkFreeRestrictions(fileCount) {
    const status = getLicenseStatus();

    if (status.isPro) {
        return {
            allowed: true,
            maxFiles: Infinity,
            maxSampleRate: 96000,
            message: null
        };
    }

    // Free版の制限
    const maxFilesPerBatch = 1;
    const maxSampleRate = 48000; // 48kHzまで

    return {
        allowed: fileCount <= maxFilesPerBatch,
        maxFiles: maxFilesPerBatch,
        maxSampleRate: maxSampleRate,
        message: fileCount > maxFilesPerBatch
            ? `Free版は一度に${maxFilesPerBatch}ファイルまでです。Pro版にアップグレードすると無制限になります。`
            : null
    };
}

module.exports = {
    getLicenseStatus,
    getRateLimitStatus,
    recordFileProcessing,
    activateLicense,
    validateLicense,
    deactivateLicense,
    checkFreeRestrictions,
    // 定数もエクスポート
    RATE_LIMIT_WINDOW_MS,
    RATE_LIMIT_MAX_FILES
};
