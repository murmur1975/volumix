import { useState } from 'react';

export default function FileDropper({ onFileSelected, file }) {
    const [isHover, setIsHover] = useState(false);

    const handleClick = async () => {
        if (window.electronAPI && window.electronAPI.selectFile) {
            const filePath = await window.electronAPI.selectFile();
            if (filePath) {
                console.log('[Renderer] File selected:', filePath);
                onFileSelected({
                    name: filePath.split(/[/\\]/).pop(),
                    path: filePath
                });
            }
        }
    };

    return (
        <div
            className="glass-panel drop-zone"
            onClick={handleClick}
            onMouseEnter={() => setIsHover(true)}
            onMouseLeave={() => setIsHover(false)}
            style={{
                border: isHover ? '2px dashed var(--primary-color)' : '2px dashed rgba(255,255,255,0.1)',
                textAlign: 'center',
                padding: '3rem',
                cursor: 'pointer',
                transition: 'all 0.3s ease'
            }}
        >
            {file ? (
                <div>
                    <h3 style={{ marginBottom: '0.5rem', color: 'var(--primary-color)' }}>{file.name}</h3>
                    <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>Ready to process (Click to change)</p>
                </div>
            ) : (
                <div>
                    <div style={{ fontSize: '3rem', marginBottom: '1rem', color: isHover ? 'var(--primary-color)' : '#555' }}>
                        📂
                    </div>
                    <h3>Click to Select MP4 Video</h3>
                </div>
            )}
        </div>
    );
}
