import React from 'react';

export default function ControlPanel({
    lkfs, setLkfs,
    sampleRate, setSampleRate,
    currentLkfs,
    disabled
}) {
    return (
        <div className="glass-panel controls">
            <div style={{ display: 'grid', gap: '1.5rem' }}>

                {/* Current File Info */}
                <div style={{
                    background: 'rgba(255,255,255,0.05)',
                    padding: '1rem',
                    borderRadius: '8px',
                    borderLeft: '4px solid var(--secondary-color)'
                }}>
                    <span className="label">Original Loudness</span>
                    <div className="value-display" style={{ fontSize: '1.5rem' }}>
                        {currentLkfs ? `${currentLkfs} LUFS` : '--'}
                    </div>
                </div>

                {/* LKFS Control */}
                <div>
                    <span className="label">Target Loudness (LKFS/LUFS)</span>
                    <div style={{ display: 'flex', gap: '1rem' }}>
                        <input
                            type="number"
                            placeholder="-14"
                            value={lkfs}
                            onChange={(e) => setLkfs(e.target.value)}
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
                                fontFamily: 'JetBrains Mono, monospace'
                            }}
                        />
                    </div>
                    <p style={{ fontSize: '0.75rem', color: '#888', marginTop: '8px' }}>
                        Standard values: TV (-24), Youtube (-14), Spotify (-14)
                    </p>
                </div>

                {/* Sampling Rate */}
                <div>
                    <span className="label">Sampling Rate</span>
                    <select
                        value={sampleRate}
                        onChange={(e) => setSampleRate(e.target.value)}
                        disabled={disabled}
                        style={{
                            background: 'rgba(0,0,0,0.3)',
                            border: '1px solid rgba(255,255,255,0.1)',
                            padding: '10px',
                            borderRadius: '8px',
                            color: 'white',
                            width: '100%',
                            cursor: 'pointer'
                        }}
                    >
                        <option value="">Original</option>
                        <option value="44100">44.1 kHz</option>
                        <option value="48000">48 kHz</option>
                        <option value="96000">96 kHz</option>
                    </select>
                </div>

            </div>
        </div>
    );
}
