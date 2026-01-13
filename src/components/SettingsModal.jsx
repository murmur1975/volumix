import React, { useState, useEffect } from 'react';

export default function SettingsModal({ isOpen, onClose, config, onConfigChange, onOpenLicense, licenseStatus }) {
    if (!isOpen) return null;

    // Local state for editing to allow cancellation (optional) or just direct sync.
    // Let's use direct sync for simplicity as per thought process, but maybe safer to direct sync.
    // Actually, handling local state inside modal involves more code. Let's rely on parent state for now.

    const modes = [
        { id: 'lkfs', label: 'Target LKFS', description: 'Append target value (e.g. _-14.0LKFS)' },
        { id: 'custom', label: 'Custom Text', description: 'Append fixed text (e.g. _volumix)' },
        { id: 'timestamp', label: 'Timestamp', description: 'Append date & time (e.g. _250109-1230)' },
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
                    <span>⚙️</span> Output Settings
                </h2>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    <label style={{ fontSize: '0.9rem', color: '#888', fontWeight: 'bold' }}>
                        FILENAME SUFFIX
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

                {/* License Section */}
                <div style={{
                    marginTop: '2rem',
                    paddingTop: '1.5rem',
                    borderTop: '1px solid rgba(255,255,255,0.1)'
                }}>
                    <label style={{ fontSize: '0.9rem', color: '#888', fontWeight: 'bold', display: 'block', marginBottom: '1rem' }}>
                        LICENSE
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
                                {licenseStatus?.isPro ? '✨ Pro版' : 'Free版'}
                            </div>
                            <div style={{ fontSize: '0.8rem', color: '#aaa' }}>
                                {licenseStatus?.isPro
                                    ? 'ライセンス認証済み'
                                    : 'クリックしてPro版にアップグレード'}
                            </div>
                        </div>
                        <span style={{ color: '#00e5ff', fontSize: '1.2rem' }}>→</span>
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
                        閉じる
                    </button>
                </div>
            </div>
        </div>
    );
}
