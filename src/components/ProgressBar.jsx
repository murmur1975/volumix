import React from 'react';

export default function ProgressBar({ progress, status }) {
    if (status === 'idle') return null;

    return (
        <div className="glass-panel" style={{ textAlign: 'center' }}>
            <div style={{ marginBottom: '0.5rem', display: 'flex', justifyContent: 'space-between' }}>
                <span className="label">{status === 'processing' ? 'Processing...' : status}</span>
                <span className="value-display">{progress}%</span>
            </div>
            <div style={{
                width: '100%',
                height: '8px',
                background: 'rgba(255,255,255,0.1)',
                borderRadius: '4px',
                overflow: 'hidden'
            }}>
                <div style={{
                    width: `${progress}%`,
                    height: '100%',
                    background: 'var(--primary-color)',
                    transition: 'width 0.2s ease',
                    boxShadow: '0 0 10px var(--primary-color)'
                }} />
            </div>
        </div>
    );
}
