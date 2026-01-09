import React from 'react';
import { useI18n } from '../i18n';

export default function SettingsModal({ isOpen, onClose, config, onConfigChange }) {
    const { t, lang, setLang, availableLanguages } = useI18n();

    if (!isOpen) return null;

    const modes = [
        { id: 'lkfs', label: t('targetLkfsOption'), description: t('targetLkfsDesc') },
        { id: 'custom', label: t('customTextOption'), description: t('customTextDesc') },
        { id: 'timestamp', label: t('timestampOption'), description: t('timestampDesc') },
    ];

    const languageLabels = {
        ja: '日本語',
        en: 'English'
    };

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
                    <span>⚙️</span> {t('outputSettings')}
                </h2>

                {/* Language Selection */}
                <div style={{ marginBottom: '1.5rem' }}>
                    <label style={{ fontSize: '0.9rem', color: '#888', fontWeight: 'bold', display: 'block', marginBottom: '0.5rem' }}>
                        🌐 LANGUAGE
                    </label>
                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                        {availableLanguages.map(langCode => (
                            <button
                                key={langCode}
                                onClick={() => setLang(langCode)}
                                style={{
                                    flex: 1,
                                    padding: '10px 16px',
                                    borderRadius: '8px',
                                    border: lang === langCode ? '1px solid var(--primary-color)' : '1px solid rgba(255,255,255,0.2)',
                                    background: lang === langCode ? 'rgba(0, 229, 255, 0.15)' : 'rgba(255,255,255,0.05)',
                                    color: lang === langCode ? 'var(--primary-color)' : 'white',
                                    fontWeight: lang === langCode ? 'bold' : 'normal',
                                    cursor: 'pointer',
                                    transition: 'all 0.2s'
                                }}
                            >
                                {languageLabels[langCode] || langCode}
                            </button>
                        ))}
                    </div>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    <label style={{ fontSize: '0.9rem', color: '#888', fontWeight: 'bold' }}>
                        {t('filenameSuffix')}
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
                        {t('close')}
                    </button>
                </div>
            </div>
        </div>
    );
}
