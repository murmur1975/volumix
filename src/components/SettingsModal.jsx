import React from 'react';
import { useLanguage } from '../contexts/LanguageContext';

export default function SettingsModal({ isOpen, onClose, config, onConfigChange, onOpenLicense, licenseStatus }) {
    const { t, language, setLanguage } = useLanguage();

    if (!isOpen) return null;

    const modes = [
        { id: 'lkfs', label: t('settings.targetLkfs'), description: t('settings.targetLkfsDesc') },
        { id: 'custom', label: t('settings.customText'), description: t('settings.customTextDesc') },
        { id: 'timestamp', label: t('settings.timestamp'), description: t('settings.timestampDesc') },
    ];

    const languages = [
        { id: 'ja', label: '日本語' },
        { id: 'en', label: 'English' }
    ];

    return (
        <div style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(0, 0, 0, 0.7)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
            backdropFilter: 'blur(5px)'
        }} onClick={onClose}>
            <div
                className="glass-panel"
                style={{
                    width: '100%',
                    maxWidth: '500px',
                    padding: '2rem',
                    position: 'relative',
                    animation: 'fadeIn 0.2s ease-out'
                }}
                onClick={e => e.stopPropagation()}
            >
                <h2 style={{ marginTop: 0, marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <span>⚙️</span> {t('settings.outputSettings')}
                </h2>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    <label style={{ fontSize: '0.9rem', color: '#888', fontWeight: 'bold' }}>
                        {t('settings.filenameSuffix').toUpperCase()}
                    </label>

                    {modes.map(mode => (
                        <div
                            key={mode.id}
                            onClick={() => onConfigChange({ ...config, mode: mode.id })}
                            style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '12px',
                                padding: '12px',
                                background: config.mode === mode.id ? 'rgba(0, 229, 255, 0.1)' : 'rgba(255, 255, 255, 0.05)',
                                border: config.mode === mode.id ? '1px solid var(--primary-color)' : '1px solid transparent',
                                borderRadius: '8px',
                                cursor: 'pointer',
                                transition: 'all 0.2s'
                            }}
                        >
                            <div style={{
                                width: '20px',
                                height: '20px',
                                borderRadius: '50%',
                                border: `2px solid ${config.mode === mode.id ? 'var(--primary-color)' : '#666'}`,
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center'
                            }}>
                                {config.mode === mode.id && (
                                    <div style={{
                                        width: '10px',
                                        height: '10px',
                                        borderRadius: '50%',
                                        background: 'var(--primary-color)'
                                    }} />
                                )}
                            </div>
                            <div>
                                <div style={{ fontWeight: 600 }}>{mode.label}</div>
                                <div style={{ fontSize: '0.8rem', color: '#aaa' }}>{mode.description}</div>
                            </div>
                        </div>
                    ))}

                    {config.mode === 'custom' && (
                        <div style={{ paddingLeft: '32px', marginTop: '-0.5rem' }}>
                            <input
                                type="text"
                                value={config.customText}
                                onChange={(e) => onConfigChange({ ...config, customText: e.target.value })}
                                placeholder="_volumix"
                                style={{
                                    width: '100%',
                                    padding: '10px',
                                    borderRadius: '6px',
                                    border: '1px solid rgba(255,255,255,0.2)',
                                    background: 'rgba(0,0,0,0.3)',
                                    color: 'white',
                                    fontFamily: 'JetBrains Mono, monospace'
                                }}
                            />
                        </div>
                    )}
                </div>

                {/* Language Section */}
                <div style={{
                    marginTop: '2rem',
                    paddingTop: '1.5rem',
                    borderTop: '1px solid rgba(255,255,255,0.1)'
                }}>
                    <label style={{ fontSize: '0.9rem', color: '#888', fontWeight: 'bold', display: 'block', marginBottom: '1rem' }}>
                        {t('settings.language').toUpperCase()}
                    </label>
                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                        {languages.map(lang => (
                            <button
                                key={lang.id}
                                onClick={() => setLanguage(lang.id)}
                                style={{
                                    flex: 1,
                                    padding: '10px',
                                    borderRadius: '8px',
                                    border: language === lang.id ? '1px solid var(--primary-color)' : '1px solid rgba(255,255,255,0.2)',
                                    background: language === lang.id ? 'rgba(0, 229, 255, 0.1)' : 'rgba(255,255,255,0.05)',
                                    color: 'white',
                                    cursor: 'pointer',
                                    fontWeight: language === lang.id ? 'bold' : 'normal',
                                    transition: 'all 0.2s'
                                }}
                            >
                                {lang.label}
                            </button>
                        ))}
                    </div>
                </div>

                {/* License Section */}
                <div style={{
                    marginTop: '2rem',
                    paddingTop: '1.5rem',
                    borderTop: '1px solid rgba(255,255,255,0.1)'
                }}>
                    <label style={{ fontSize: '0.9rem', color: '#888', fontWeight: 'bold', display: 'block', marginBottom: '1rem' }}>
                        {t('settings.license').toUpperCase()}
                    </label>
                    <div
                        onClick={onOpenLicense}
                        style={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            padding: '12px',
                            background: licenseStatus?.isPro
                                ? 'rgba(255, 215, 0, 0.1)'
                                : 'rgba(255, 255, 255, 0.05)',
                            border: licenseStatus?.isPro
                                ? '1px solid rgba(255, 215, 0, 0.3)'
                                : '1px solid transparent',
                            borderRadius: '8px',
                            cursor: 'pointer',
                            transition: 'all 0.2s'
                        }}
                    >
                        <div>
                            <div style={{ fontWeight: 600, color: licenseStatus?.isPro ? '#ffd700' : 'white' }}>
                                {licenseStatus?.isPro ? t('license.pro') : t('license.free')}
                            </div>
                            <div style={{ fontSize: '0.8rem', color: '#aaa' }}>
                                {licenseStatus?.isPro
                                    ? t('license.activated').split('\n')[0]
                                    : t('upgrade.cta')}
                            </div>
                        </div>
                        <span style={{ color: '#00e5ff', fontSize: '1.2rem' }}>→</span>
                    </div>
                </div>

                {/* Open Source Licenses Section */}
                <div style={{
                    marginTop: '2rem',
                    paddingTop: '1.5rem',
                    borderTop: '1px solid rgba(255,255,255,0.1)'
                }}>
                    <label style={{ fontSize: '0.9rem', color: '#888', fontWeight: 'bold', display: 'block', marginBottom: '1rem' }}>
                        {language === 'ja' ? 'オープンソースライセンス' : 'OPEN SOURCE LICENSES'}
                    </label>
                    <div style={{
                        padding: '12px',
                        background: 'rgba(255, 255, 255, 0.03)',
                        borderRadius: '8px',
                        fontSize: '0.8rem',
                        color: 'rgba(255,255,255,0.6)',
                        lineHeight: '1.6'
                    }}>
                        <div style={{ marginBottom: '0.5rem', fontWeight: 600, color: 'rgba(255,255,255,0.8)' }}>
                            FFmpeg
                        </div>
                        <div>
                            {language === 'ja'
                                ? 'このソフトウェアは、GPLv3に基づいてライセンスされた'
                                : 'This software uses code of '}
                            <a
                                href="https://ffmpeg.org"
                                target="_blank"
                                rel="noopener noreferrer"
                                style={{ color: '#00e5ff' }}
                            >
                                FFmpeg
                            </a>
                            {language === 'ja'
                                ? 'のコードを使用しています。ソースコードは'
                                : ' licensed under the '}
                            <a
                                href="https://www.gnu.org/licenses/gpl-3.0.html"
                                target="_blank"
                                rel="noopener noreferrer"
                                style={{ color: '#00e5ff' }}
                            >
                                {language === 'ja' ? 'こちら' : 'GPLv3'}
                            </a>
                            {language === 'ja'
                                ? 'から入手できます。'
                                : ' and its source can be downloaded '}
                            {language !== 'ja' && (
                                <a
                                    href="https://ffmpeg.org/download.html"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    style={{ color: '#00e5ff' }}
                                >
                                    here
                                </a>
                            )}
                            {language === 'ja' && (
                                <span>
                                    {' '}
                                    <a
                                        href="https://ffmpeg.org/download.html"
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        style={{ color: '#00e5ff' }}
                                    >
                                        ダウンロード
                                    </a>
                                </span>
                            )}
                        </div>
                    </div>
                </div>

                <div style={{ marginTop: '2rem', display: 'flex', justifyContent: 'flex-end' }}>
                    <button
                        onClick={onClose}
                        style={{
                            padding: '10px 24px',
                            background: 'var(--primary-linear)',
                            border: 'none',
                            borderRadius: '8px',
                            color: 'black',
                            fontWeight: 'bold',
                            cursor: 'pointer'
                        }}
                    >
                        {t('common.close')}
                    </button>
                </div>
            </div>
        </div>
    );
}
