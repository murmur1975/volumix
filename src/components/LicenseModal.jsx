import { useState } from 'react';

function LicenseModal({ isOpen, onClose, isPro, onStatusChange }) {
    const [licenseKey, setLicenseKey] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [message, setMessage] = useState({ text: '', type: '' });

    if (!isOpen) return null;

    const handleActivate = async () => {
        if (!licenseKey.trim()) {
            setMessage({ text: 'ライセンスキーを入力してください', type: 'error' });
            return;
        }

        setIsLoading(true);
        setMessage({ text: '', type: '' });

        try {
            const result = await window.electronAPI.activateLicense(licenseKey.trim());
            if (result.success) {
                setMessage({ text: result.message, type: 'success' });
                onStatusChange(true);
                setTimeout(() => {
                    onClose();
                }, 1500);
            } else {
                setMessage({ text: result.message, type: 'error' });
            }
        } catch {
            setMessage({ text: 'エラーが発生しました', type: 'error' });
        } finally {
            setIsLoading(false);
        }
    };

    const handleDeactivate = async () => {
        setIsLoading(true);
        try {
            const result = await window.electronAPI.deactivateLicense();
            setMessage({ text: result.message, type: 'success' });
            onStatusChange(false);
            setLicenseKey('');
        } catch {
            setMessage({ text: 'エラーが発生しました', type: 'error' });
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.8)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000
        }}>
            <div style={{
                background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)',
                borderRadius: '16px',
                padding: '2rem',
                width: '90%',
                maxWidth: '450px',
                border: '1px solid rgba(0, 229, 255, 0.3)',
                boxShadow: '0 20px 60px rgba(0, 0, 0, 0.5)'
            }}>
                <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    marginBottom: '1.5rem'
                }}>
                    <h2 style={{
                        margin: 0,
                        fontSize: '1.5rem',
                        background: 'linear-gradient(to right, #00e5ff, #2979ff)',
                        WebkitBackgroundClip: 'text',
                        WebkitTextFillColor: 'transparent'
                    }}>
                        ライセンス管理
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
                    >
                        ✕
                    </button>
                </div>

                {/* Current Status */}
                <div style={{
                    padding: '1rem',
                    borderRadius: '8px',
                    background: isPro
                        ? 'linear-gradient(135deg, rgba(0, 200, 83, 0.2) 0%, rgba(0, 150, 136, 0.2) 100%)'
                        : 'rgba(255, 255, 255, 0.05)',
                    border: isPro
                        ? '1px solid rgba(0, 200, 83, 0.5)'
                        : '1px solid rgba(255, 255, 255, 0.1)',
                    marginBottom: '1.5rem',
                    textAlign: 'center'
                }}>
                    <div style={{
                        fontSize: '0.9rem',
                        color: 'rgba(255,255,255,0.7)',
                        marginBottom: '0.5rem'
                    }}>
                        現在のプラン
                    </div>
                    <div style={{
                        fontSize: '1.5rem',
                        fontWeight: 'bold',
                        color: isPro ? '#00c853' : '#ff9800'
                    }}>
                        {isPro ? '🎉 Pro 版' : '🆓 Free 版'}
                    </div>
                    {!isPro && (
                        <div style={{
                            fontSize: '0.8rem',
                            color: 'rgba(255,255,255,0.5)',
                            marginTop: '0.5rem'
                        }}>
                            ※ 一度に1ファイル、30分間に10ファイルまで
                        </div>
                    )}
                </div>

                {/* License Input (only show if not Pro) */}
                {!isPro && (
                    <>
                        <div style={{ marginBottom: '1rem' }}>
                            <label style={{
                                display: 'block',
                                marginBottom: '0.5rem',
                                fontSize: '0.9rem',
                                color: 'rgba(255,255,255,0.8)'
                            }}>
                                ライセンスキー
                            </label>
                            <input
                                type="text"
                                value={licenseKey}
                                onChange={(e) => setLicenseKey(e.target.value)}
                                placeholder="XXXX-XXXX-XXXX-XXXX"
                                disabled={isLoading}
                                style={{
                                    width: '100%',
                                    padding: '0.75rem 1rem',
                                    borderRadius: '8px',
                                    border: '1px solid rgba(255,255,255,0.2)',
                                    background: 'rgba(255,255,255,0.05)',
                                    color: 'white',
                                    fontSize: '1rem',
                                    fontFamily: 'monospace',
                                    textTransform: 'uppercase',
                                    boxSizing: 'border-box'
                                }}
                            />
                        </div>

                        <button
                            onClick={handleActivate}
                            disabled={isLoading || !licenseKey.trim()}
                            style={{
                                width: '100%',
                                padding: '0.75rem',
                                borderRadius: '8px',
                                border: 'none',
                                background: 'linear-gradient(135deg, #00e5ff 0%, #2979ff 100%)',
                                color: 'white',
                                fontSize: '1rem',
                                fontWeight: 'bold',
                                cursor: isLoading ? 'wait' : 'pointer',
                                opacity: (isLoading || !licenseKey.trim()) ? 0.5 : 1,
                                transition: 'opacity 0.2s'
                            }}
                        >
                            {isLoading ? '確認中...' : 'ライセンスを有効化'}
                        </button>
                    </>
                )}

                {/* Deactivate button (only show if Pro) */}
                {isPro && (
                    <button
                        onClick={handleDeactivate}
                        disabled={isLoading}
                        style={{
                            width: '100%',
                            padding: '0.75rem',
                            borderRadius: '8px',
                            border: '1px solid rgba(255, 82, 82, 0.5)',
                            background: 'rgba(255, 82, 82, 0.1)',
                            color: '#ff5252',
                            fontSize: '1rem',
                            cursor: isLoading ? 'wait' : 'pointer',
                            opacity: isLoading ? 0.5 : 1
                        }}
                    >
                        {isLoading ? '処理中...' : 'ライセンスを解除'}
                    </button>
                )}

                {/* Message */}
                {message.text && (
                    <div style={{
                        marginTop: '1rem',
                        padding: '0.75rem',
                        borderRadius: '8px',
                        background: message.type === 'error'
                            ? 'rgba(255, 82, 82, 0.2)'
                            : 'rgba(0, 200, 83, 0.2)',
                        border: `1px solid ${message.type === 'error' ? '#ff5252' : '#00c853'}`,
                        color: message.type === 'error' ? '#ff5252' : '#00c853',
                        textAlign: 'center',
                        fontSize: '0.9rem'
                    }}>
                        {message.text}
                    </div>
                )}

                {/* Purchase link */}
                {!isPro && (
                    <div style={{
                        marginTop: '1.5rem',
                        textAlign: 'center',
                        fontSize: '0.85rem',
                        color: 'rgba(255,255,255,0.6)'
                    }}>
                        ライセンスをお持ちでない方は
                        <br />
                        <a
                            href="https://volumix.lemonsqueezy.com"
                            target="_blank"
                            rel="noopener noreferrer"
                            style={{
                                color: '#00e5ff',
                                textDecoration: 'none'
                            }}
                        >
                            こちらから購入 →
                        </a>
                    </div>
                )}
            </div>
        </div>
    );
}

export default LicenseModal;
