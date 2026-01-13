import { useState } from 'react';

/**
 * ライセンス管理モーダル
 * Pro版へのアップグレード、ライセンス認証、解除を行う
 */
export default function LicenseModal({ isOpen, onClose, licenseStatus, onStatusChange }) {
    const [licenseKey, setLicenseKey] = useState('');
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState(null);
    const [messageType, setMessageType] = useState('info'); // 'success', 'error', 'info'

    if (!isOpen) return null;

    const handleActivate = async () => {
        if (!licenseKey.trim()) {
            setMessage('ライセンスキーを入力してください');
            setMessageType('error');
            return;
        }

        setLoading(true);
        setMessage(null);

        try {
            const result = await window.electronAPI.activateLicense(licenseKey.trim());

            if (result.success) {
                setMessage(result.message);
                setMessageType('success');
                setLicenseKey('');
                // ステータスを更新
                if (onStatusChange) {
                    const newStatus = await window.electronAPI.getLicenseStatus();
                    onStatusChange(newStatus);
                }
            } else {
                setMessage(result.message || '認証に失敗しました');
                setMessageType('error');
            }
        } catch (error) {
            setMessage(`エラー: ${error.message}`);
            setMessageType('error');
        } finally {
            setLoading(false);
        }
    };

    const handleDeactivate = async () => {
        if (!confirm('ライセンスを解除しますか？\nこのPCでの認証が解除され、Free版に戻ります。')) {
            return;
        }

        setLoading(true);
        setMessage(null);

        try {
            const result = await window.electronAPI.deactivateLicense();

            if (result.success) {
                setMessage('ライセンスが解除されました');
                setMessageType('info');
                if (onStatusChange) {
                    const newStatus = await window.electronAPI.getLicenseStatus();
                    onStatusChange(newStatus);
                }
            } else {
                setMessage(result.message || '解除に失敗しました');
                setMessageType('error');
            }
        } catch (error) {
            setMessage(`エラー: ${error.message}`);
            setMessageType('error');
        } finally {
            setLoading(false);
        }
    };

    const isPro = licenseStatus?.isPro;

    return (
        <div style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0,0,0,0.8)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000
        }} onClick={onClose}>
            <div style={{
                background: 'linear-gradient(145deg, #1a1a2e, #16213e)',
                borderRadius: '16px',
                padding: '2rem',
                width: '90%',
                maxWidth: '500px',
                border: '1px solid rgba(255,255,255,0.1)',
                boxShadow: '0 8px 32px rgba(0,0,0,0.5)'
            }} onClick={e => e.stopPropagation()}>
                {/* ヘッダー */}
                <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    marginBottom: '1.5rem'
                }}>
                    <h2 style={{
                        margin: 0,
                        fontSize: '1.5rem',
                        background: isPro
                            ? 'linear-gradient(to right, #ffd700, #ff8c00)'
                            : 'linear-gradient(to right, #00e5ff, #2979ff)',
                        WebkitBackgroundClip: 'text',
                        WebkitTextFillColor: 'transparent'
                    }}>
                        {isPro ? '✨ Pro版' : 'ライセンス'}
                    </h2>
                    <button
                        onClick={onClose}
                        style={{
                            background: 'none',
                            border: 'none',
                            fontSize: '1.5rem',
                            cursor: 'pointer',
                            color: 'white',
                            opacity: 0.7
                        }}
                    >✕</button>
                </div>

                {/* ステータス表示 */}
                <div style={{
                    padding: '1rem',
                    borderRadius: '8px',
                    background: isPro
                        ? 'rgba(255,215,0,0.1)'
                        : 'rgba(100,100,100,0.2)',
                    border: `1px solid ${isPro ? 'rgba(255,215,0,0.3)' : 'rgba(255,255,255,0.1)'}`,
                    marginBottom: '1.5rem'
                }}>
                    <div style={{
                        fontSize: '0.9rem',
                        color: 'rgba(255,255,255,0.7)',
                        marginBottom: '0.5rem'
                    }}>
                        現在のプラン
                    </div>
                    <div style={{
                        fontSize: '1.2rem',
                        fontWeight: 'bold',
                        color: isPro ? '#ffd700' : 'white'
                    }}>
                        {isPro ? 'Pro版（ライセンス認証済み）' : 'Free版'}
                    </div>

                    {!isPro && licenseStatus?.rateLimit && (
                        <div style={{
                            marginTop: '0.5rem',
                            fontSize: '0.85rem',
                            color: 'rgba(255,255,255,0.6)'
                        }}>
                            本日の処理: {licenseStatus.rateLimit.used} / {licenseStatus.rateLimit.limit} ファイル
                        </div>
                    )}
                </div>

                {/* Free版の機能比較 */}
                {!isPro && (
                    <div style={{
                        marginBottom: '1.5rem',
                        fontSize: '0.9rem'
                    }}>
                        <div style={{
                            fontWeight: 'bold',
                            marginBottom: '0.75rem',
                            color: 'rgba(255,255,255,0.9)'
                        }}>
                            🚀 Pro版にアップグレードすると:
                        </div>
                        <ul style={{
                            margin: 0,
                            paddingLeft: '1.5rem',
                            color: 'rgba(255,255,255,0.7)',
                            lineHeight: '1.8'
                        }}>
                            <li>複数ファイルの<strong style={{ color: '#00e5ff' }}>一括処理</strong>が可能</li>
                            <li>96kHz サンプリングレートに対応</li>
                            <li>Rate Limit なし</li>
                        </ul>
                    </div>
                )}

                {/* ライセンスキー入力 or 解除ボタン */}
                {isPro ? (
                    <div>
                        <div style={{
                            fontSize: '0.85rem',
                            color: 'rgba(255,255,255,0.5)',
                            marginBottom: '1rem'
                        }}>
                            このPCでライセンスが認証されています。
                        </div>
                        <button
                            onClick={handleDeactivate}
                            disabled={loading}
                            style={{
                                width: '100%',
                                padding: '0.75rem',
                                borderRadius: '8px',
                                border: '1px solid rgba(255,100,100,0.5)',
                                background: 'rgba(255,100,100,0.1)',
                                color: '#ff6b6b',
                                cursor: loading ? 'wait' : 'pointer',
                                fontSize: '0.9rem'
                            }}
                        >
                            {loading ? '処理中...' : 'ライセンスを解除する'}
                        </button>
                    </div>
                ) : (
                    <div>
                        <div style={{ marginBottom: '0.5rem' }}>
                            <label style={{
                                fontSize: '0.9rem',
                                color: 'rgba(255,255,255,0.8)'
                            }}>
                                ライセンスキー
                            </label>
                        </div>
                        <input
                            type="text"
                            value={licenseKey}
                            onChange={(e) => setLicenseKey(e.target.value)}
                            placeholder="XXXXXXXX-XXXX-XXXX-XXXX-XXXXXXXXXXXX"
                            disabled={loading}
                            style={{
                                width: '100%',
                                padding: '0.75rem',
                                borderRadius: '8px',
                                border: '1px solid rgba(255,255,255,0.2)',
                                background: 'rgba(255,255,255,0.05)',
                                color: 'white',
                                fontSize: '0.9rem',
                                marginBottom: '1rem',
                                boxSizing: 'border-box'
                            }}
                        />
                        <button
                            onClick={handleActivate}
                            disabled={loading || !licenseKey.trim()}
                            style={{
                                width: '100%',
                                padding: '0.75rem',
                                borderRadius: '8px',
                                border: 'none',
                                background: 'linear-gradient(135deg, #00e5ff, #2979ff)',
                                color: 'white',
                                cursor: loading ? 'wait' : 'pointer',
                                fontSize: '1rem',
                                fontWeight: 'bold',
                                opacity: loading || !licenseKey.trim() ? 0.5 : 1
                            }}
                        >
                            {loading ? '認証中...' : 'ライセンスを認証'}
                        </button>

                        <div style={{
                            marginTop: '1rem',
                            textAlign: 'center'
                        }}>
                            <a
                                href="https://techdesignlab.lemonsqueezy.com/checkout/buy/d24d927e-7186-493d-a7e2-2af0860f7918"
                                target="_blank"
                                rel="noopener noreferrer"
                                style={{
                                    color: '#00e5ff',
                                    fontSize: '0.85rem',
                                    textDecoration: 'none'
                                }}
                            >
                                ライセンスを購入する →
                            </a>
                        </div>
                    </div>
                )}

                {/* メッセージ */}
                {message && (
                    <div style={{
                        marginTop: '1rem',
                        padding: '0.75rem',
                        borderRadius: '8px',
                        background: messageType === 'success'
                            ? 'rgba(0,255,100,0.1)'
                            : messageType === 'error'
                                ? 'rgba(255,100,100,0.1)'
                                : 'rgba(100,100,255,0.1)',
                        border: `1px solid ${messageType === 'success'
                            ? 'rgba(0,255,100,0.3)'
                            : messageType === 'error'
                                ? 'rgba(255,100,100,0.3)'
                                : 'rgba(100,100,255,0.3)'
                            }`,
                        color: messageType === 'success'
                            ? '#00ff88'
                            : messageType === 'error'
                                ? '#ff6b6b'
                                : '#6b9fff',
                        fontSize: '0.9rem'
                    }}>
                        {message}
                    </div>
                )}
            </div>
        </div>
    );
}
