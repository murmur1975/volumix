import React from 'react';

export default function ControlPanel({
    lkfs, setLkfs,
    sampleRate, setSampleRate,
    disabled,
    isPro = false
}) {
    return (
        <div className="glass-panel controls">
            <div style={{
                display: 'grid',
                gridTemplateColumns: '1fr 1fr',
                gap: '1.5rem',
                alignItems: 'start'
            }}>

                {/* LKFS Control */}
                <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                        <span className="label" style={{ margin: 0 }}>Target Loudness</span>
                        <div style={{ display: 'flex', gap: '8px' }}>
                            <button
                                onClick={() => setLkfs('-24')}
                                disabled={disabled}
                                style={{
                                    padding: '2px 8px',
                                    fontSize: '0.75rem',
                                    background: lkfs === '-24' ? 'var(--primary-color)' : 'rgba(255,255,255,0.1)',
                                    border: 'none',
                                    borderRadius: '4px',
                                    color: 'white',
                                    cursor: 'pointer'
                                }}
                            >
                                TV (-24)
                            </button>
                            <button
                                onClick={() => setLkfs('-14')}
                                disabled={disabled}
                                style={{
                                    padding: '2px 8px',
                                    fontSize: '0.75rem',
                                    background: lkfs === '-14' ? 'var(--primary-color)' : 'rgba(255,255,255,0.1)',
                                    border: 'none',
                                    borderRadius: '4px',
                                    color: 'white',
                                    cursor: 'pointer'
                                }}
                            >
                                Web (-14)
                            </button>
                        </div>
                    </div>
                    <input
                        type="number"
                        placeholder="-14"
                        value={lkfs}
                        onChange={(e) => setLkfs(e.target.value)}
                        onBlur={(e) => {
                            let val = parseFloat(e.target.value);
                            if (isNaN(val)) val = -14;
                            if (val > -5) val = -5;
                            if (val < -70) val = -70;
                            setLkfs(val.toString());
                        }}
                        min="-70"
                        max="-5"
                        disabled={disabled}
                        step="0.1"
                        style={{
                            background: 'rgba(0,0,0,0.3)',
                            border: '1px solid rgba(255,255,255,0.1)',
                            padding: '12px',
                            borderRadius: '8px',
                            color: 'white',
                            width: '100%',
                            fontSize: '1.2rem',
                            fontFamily: 'JetBrains Mono, monospace',
                            boxSizing: 'border-box'
                        }}
                    />
                    <p style={{ fontSize: '0.75rem', color: '#888', marginTop: '8px' }}>
                        Range: -70 to -5. Standard: TV (-24), Youtube (-14)
                    </p>
                </div>

                {/* Sampling Rate */}
                <div>
                    <span className="label">Sampling Rate</span>
                    <select
                        value={isPro ? sampleRate : ''}
                        onChange={(e) => setSampleRate(e.target.value)}
                        disabled={disabled || !isPro}
                        style={{
                            background: 'rgba(0,0,0,0.3)',
                            border: '1px solid rgba(255,255,255,0.1)',
                            padding: '12px',
                            borderRadius: '8px',
                            color: 'white',
                            width: '100%',
                            cursor: isPro ? 'pointer' : 'not-allowed',
                            boxSizing: 'border-box',
                            opacity: isPro ? 1 : 0.6
                        }}
                    >
                        <option value="">Original</option>
                        <option value="44100" disabled={!isPro}>44.1 kHz {!isPro ? '(Pro版)' : ''}</option>
                        <option value="48000" disabled={!isPro}>48 kHz {!isPro ? '(Pro版)' : ''}</option>
                        <option value="96000" disabled={!isPro}>96 kHz {!isPro ? '(Pro版)' : ''}</option>
                    </select>
                    {!isPro && (
                        <p style={{ fontSize: '0.75rem', color: '#888', marginTop: '8px' }}>
                            サンプリングレート変更はPro版で利用可能
                        </p>
                    )}
                </div>

            </div>
        </div>
    );
}
