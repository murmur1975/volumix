// Volumix Localization Resources
// Add new languages by adding new keys (e.g., 'ko', 'zh')

export const resources = {
    ja: {
        // App header
        appTitle: 'Volumix',
        proBadge: '🌟 Pro',
        freeBadge: '🆓 Free',
        remainingFiles: '残り {count} ファイル',

        // File dropper
        dropHint: 'ここにMP4ファイルをドラッグ＆ドロップ',
        orClickToSelect: 'またはクリックしてファイルを選択',

        // Control panel
        targetLoudness: 'Target Loudness',
        samplingRate: 'Sampling Rate',
        bitrate: 'Bitrate',
        original: 'Original',
        vbrAuto: 'VBR (自動)',
        proOnly: 'Pro',
        proOnlyFull: 'Pro限定',
        samplingRateNote: '出力サンプリングレート',
        samplingRateProNote: 'Pro版で変更可能',
        bitrateNote: '音声ビットレート',
        bitrateProNote: 'Pro版でCBR選択可',

        // File table
        fileName: 'ファイル名',
        originalLkfs: '元LKFS',
        resultLkfs: '結果LKFS',
        status: 'ステータス',
        analyzing: '分析中...',
        ready: '準備完了',
        processing: '処理中...',
        done: '完了',
        error: 'エラー',

        // Buttons
        startProcessing: '処理開始',
        clear: 'クリア',
        settings: '設定',
        license: 'ライセンス',

        // Messages
        processingComplete: '処理が完了しました',
        processingFailed: '処理に失敗しました',
        rateLimitReached: 'レート制限に達しました。しばらくお待ちください。',
        freeVersionLimit: 'Free版では一度に1ファイルまでです',
        filesAddedLimit: 'Free版のため1ファイルのみ追加されました',

        // License modal
        licenseManagement: 'ライセンス管理',
        currentPlan: '現在のプラン',
        proPlan: '🎉 Pro 版',
        freePlan: '🆓 Free 版',
        freePlanNote: '※ 一度に1ファイル、30分間に10ファイルまで',
        licenseKey: 'ライセンスキー',
        activateLicense: 'ライセンスを有効化',
        deactivateLicense: 'ライセンスを解除',
        verifying: '確認中...',
        processingLicense: '処理中...',
        enterLicenseKey: 'ライセンスキーを入力してください',
        errorOccurred: 'エラーが発生しました',
        noLicenseYet: 'ライセンスをお持ちでない方は',
        purchaseHere: 'こちらから購入 →',

        // Settings modal
        outputSettings: 'Output Settings',
        filenameSuffix: 'FILENAME SUFFIX',
        targetLkfsOption: 'Target LKFS',
        targetLkfsDesc: 'Append target value (e.g. _-14.0LKFS)',
        customTextOption: 'Custom Text',
        customTextDesc: 'Append fixed text (e.g. _volumix)',
        timestampOption: 'Timestamp',
        timestampDesc: 'Append date & time (e.g. _250109-1230)',
        close: '閉じる',
    },

    en: {
        // App header
        appTitle: 'Volumix',
        proBadge: '🌟 Pro',
        freeBadge: '🆓 Free',
        remainingFiles: '{count} files remaining',

        // File dropper
        dropHint: 'Drag & drop MP4 files here',
        orClickToSelect: 'or click to select files',

        // Control panel
        targetLoudness: 'Target Loudness',
        samplingRate: 'Sampling Rate',
        bitrate: 'Bitrate',
        original: 'Original',
        vbrAuto: 'VBR (Auto)',
        proOnly: 'Pro',
        proOnlyFull: 'Pro Only',
        samplingRateNote: 'Output sample rate',
        samplingRateProNote: 'Available in Pro',
        bitrateNote: 'Audio bitrate',
        bitrateProNote: 'CBR available in Pro',

        // File table
        fileName: 'File Name',
        originalLkfs: 'Original LKFS',
        resultLkfs: 'Result LKFS',
        status: 'Status',
        analyzing: 'Analyzing...',
        ready: 'Ready',
        processing: 'Processing...',
        done: 'Done',
        error: 'Error',

        // Buttons
        startProcessing: 'Start Processing',
        clear: 'Clear',
        settings: 'Settings',
        license: 'License',

        // Messages
        processingComplete: 'Processing complete',
        processingFailed: 'Processing failed',
        rateLimitReached: 'Rate limit reached. Please wait.',
        freeVersionLimit: 'Free version: 1 file at a time',
        filesAddedLimit: 'Only 1 file added (Free version limit)',

        // License modal
        licenseManagement: 'License Management',
        currentPlan: 'Current Plan',
        proPlan: '🎉 Pro',
        freePlan: '🆓 Free',
        freePlanNote: '※ 1 file at a time, 10 files per 30 minutes',
        licenseKey: 'License Key',
        activateLicense: 'Activate License',
        deactivateLicense: 'Deactivate License',
        verifying: 'Verifying...',
        processingLicense: 'Processing...',
        enterLicenseKey: 'Please enter a license key',
        errorOccurred: 'An error occurred',
        noLicenseYet: "Don't have a license?",
        purchaseHere: 'Purchase here →',

        // Settings modal
        outputSettings: 'Output Settings',
        filenameSuffix: 'FILENAME SUFFIX',
        targetLkfsOption: 'Target LKFS',
        targetLkfsDesc: 'Append target value (e.g. _-14.0LKFS)',
        customTextOption: 'Custom Text',
        customTextDesc: 'Append fixed text (e.g. _volumix)',
        timestampOption: 'Timestamp',
        timestampDesc: 'Append date & time (e.g. _250109-1230)',
        close: 'Close',
    }
};

// Get browser language
export const detectLanguage = () => {
    const browserLang = navigator.language || navigator.userLanguage;
    return browserLang.startsWith('ja') ? 'ja' : 'en';
};

// Simple translation function factory
export const createT = (lang) => {
    return (key, replacements = {}) => {
        let text = resources[lang]?.[key] || resources['en'][key] || key;

        // Handle replacements like {count}
        Object.keys(replacements).forEach(k => {
            text = text.replace(`{${k}}`, replacements[k]);
        });

        return text;
    };
};
