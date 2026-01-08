import React from 'react';

export default function FileTable({ files, onToggleFile, onToggleAll, onRemoveFile }) {
    if (!files || files.length === 0) {
        return null;
    }

    const allSelected = files.every(f => f.selected);
    const someSelected = files.some(f => f.selected) && !allSelected;

    const getStatusBadge = (status) => {
        const styles = {
            pending: { bg: 'rgba(255,255,255,0.1)', color: '#888' },
            analyzing: { bg: 'rgba(41,121,255,0.2)', color: '#2979ff' },
            ready: { bg: 'rgba(0,229,255,0.2)', color: '#00e5ff' },
            processing: { bg: 'rgba(255,193,7,0.2)', color: '#ffc107' },
            done: { bg: 'rgba(76,175,80,0.2)', color: '#4caf50' },
            error: { bg: 'rgba(244,67,54,0.2)', color: '#f44336' }
        };
        const style = styles[status] || styles.pending;
        const labels = {
            pending: 'Pending',
            analyzing: 'Analyzing...',
            ready: 'Ready',
            processing: 'Processing...',
            done: 'Done',
            error: 'Error'
        };

        return (
            <span style={{
                padding: '4px 8px',
                borderRadius: '4px',
                fontSize: '0.75rem',
                fontWeight: 600,
                background: style.bg,
                color: style.color,
                textTransform: 'uppercase'
            }}>
                {labels[status] || status}
            </span>
        );
    };

    const formatLkfs = (value) => {
        if (value === null || value === undefined) return '--';
        if (typeof value === 'string') return value;
        return `${value.toFixed(1)} LUFS`;
    };

    return (
        <div className="glass-panel" style={{ padding: '1rem', overflowX: 'auto' }}>
            <table style={{
                width: '100%',
                borderCollapse: 'collapse',
                fontSize: '0.9rem'
            }}>
                <thead>
                    <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
                        <th style={{ padding: '12px 8px', textAlign: 'center', width: '40px' }}>
                            <input
                                type="checkbox"
                                checked={allSelected}
                                ref={el => { if (el) el.indeterminate = someSelected; }}
                                onChange={() => onToggleAll(!allSelected)}
                                style={{ cursor: 'pointer', width: '18px', height: '18px', accentColor: 'var(--primary-color)' }}
                            />
                        </th>
                        <th style={{ padding: '12px 8px', textAlign: 'left', color: 'var(--text-secondary)' }}>File Name</th>
                        <th style={{ padding: '12px 8px', textAlign: 'center', color: 'var(--text-secondary)', width: '120px' }}>Original</th>
                        <th style={{ padding: '12px 8px', textAlign: 'center', color: 'var(--text-secondary)', width: '120px' }}>Result</th>
                        <th style={{ padding: '12px 8px', textAlign: 'center', color: 'var(--text-secondary)', width: '100px' }}>Status</th>
                        <th style={{ width: '40px' }}></th>
                    </tr>
                </thead>
                <tbody>
                    {files.map((file) => (
                        <tr
                            key={file.id}
                            style={{
                                borderBottom: '1px solid rgba(255,255,255,0.05)',
                                opacity: file.selected ? 1 : 0.5,
                                transition: 'opacity 0.2s ease'
                            }}
                        >
                            <td style={{ padding: '12px 8px', textAlign: 'center' }}>
                                <input
                                    type="checkbox"
                                    checked={file.selected}
                                    onChange={() => onToggleFile(file.id)}
                                    disabled={file.status === 'processing' || file.status === 'analyzing'}
                                    style={{ cursor: 'pointer', width: '18px', height: '18px', accentColor: 'var(--primary-color)' }}
                                />
                            </td>
                            <td style={{
                                padding: '12px 8px',
                                maxWidth: '200px',
                                overflow: 'hidden',
                                textOverflow: 'ellipsis',
                                whiteSpace: 'nowrap',
                                fontFamily: 'JetBrains Mono, monospace',
                                fontSize: '0.85rem'
                            }}>
                                {file.name}
                            </td>
                            <td style={{
                                padding: '12px 8px',
                                textAlign: 'center',
                                fontFamily: 'JetBrains Mono, monospace',
                                color: 'var(--secondary-color)'
                            }}>
                                {formatLkfs(file.originalLkfs)}
                            </td>
                            <td style={{
                                padding: '12px 8px',
                                textAlign: 'center',
                                fontFamily: 'JetBrains Mono, monospace',
                                color: 'var(--primary-color)'
                            }}>
                                {formatLkfs(file.resultLkfs)}
                            </td>
                            <td style={{ padding: '12px 8px', textAlign: 'center' }}>
                                {getStatusBadge(file.status)}
                            </td>
                            <td style={{ padding: '12px 8px', textAlign: 'center' }}>
                                {file.status !== 'processing' && file.status !== 'analyzing' && (
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            onRemoveFile(file.id);
                                        }}
                                        style={{
                                            background: 'transparent',
                                            border: 'none',
                                            color: '#666',
                                            cursor: 'pointer',
                                            fontSize: '1rem',
                                            padding: '4px',
                                            lineHeight: 1,
                                            boxShadow: 'none'
                                        }}
                                        title="Remove file"
                                    >
                                        ✕
                                    </button>
                                )}
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}
