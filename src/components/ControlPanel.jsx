import React from 'react';

export default function ControlPanel({
    volume, setVolume,
    lkfs, setLkfs,
    sampleRate, setSampleRate,
    disabled
}) {
    return (
        <div className="glass-panel controls">
            <div style={{ display: 'grid', gap: '1.5rem' }}>

                {/* Volume Control */}
                <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span className="label">Volume Gain</span>
                        <span className="value-display">{(volume * 100).toFixed(0)}%</span>
                    </div>
                    <input
                        type="range"
                        min="0" max="3" step="0.1"
                        value={volume}
                        onChange={(e) => setVolume(parseFloat(e.target.value))}
                        disabled={disabled || lkfs !== ''} // Disable if LKFS is set (override behavior)
                        style={{ opacity: lkfs ? 0.5 : 1 }}
                    />
                </div>

                {/* LKFS Control */}
                <div>
                    <span className="label">Target LKFS (Normalization)</span>
                    <div style={{ display: 'flex', gap: '1rem' }}>
                        <input
                            type="text"
                            placeholder="e.g. -14 (Leave empty to disable)"
                            value={lkfs}
                            onChange={(e) => setLkfs(e.target.value)}
                            disabled={disabled}
                            style={{
                                background: 'rgba(0,0,0,0.3)',
                                border: '1px solid rgba(255,255,255,0.1)',
                                padding: '10px',
                                borderRadius: '8px',
                                color: 'white',
                                width: '100%'
                            }}
                        />
                    </div>
                    <p style={{ fontSize: '0.75rem', color: '#666', marginTop: '4px' }}>
                        *Overrides simple volume gain
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
