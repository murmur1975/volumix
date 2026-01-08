import { useState, useCallback } from 'react';

export default function FileDropper({ onFileSelected, file }) {
    const [isDragOver, setIsDragOver] = useState(false);

    const handleDrop = useCallback((e) => {
        e.preventDefault();
        setIsDragOver(false);

        const files = e.dataTransfer.files;
        if (files.length > 0) {
            const droppedFile = files[0];
            if (droppedFile.name.toLowerCase().endsWith('.mp4')) {
                // Use Electron's webUtils to get the file path
                let filePath = null;
                if (window.electronAPI && window.electronAPI.getPathForFile) {
                    filePath = window.electronAPI.getPathForFile(droppedFile);
                }

                if (filePath) {
                    console.log('[Renderer] Dropped file path:', filePath);
                    onFileSelected({
                        name: droppedFile.name,
                        path: filePath
                    });
                } else {
                    console.error('[Renderer] Could not get file path from dropped file');
                    alert('Could not get file path. Please use click to select.');
                }
            } else {
                alert('Please drop an MP4 file');
            }
        }
    }, [onFileSelected]);

    const handleDragOver = (e) => {
        e.preventDefault();
        setIsDragOver(true);
    };

    const handleDragLeave = () => {
        setIsDragOver(false);
    };

    const handleClick = async () => {
        if (window.electronAPI && window.electronAPI.selectFile) {
            const filePath = await window.electronAPI.selectFile();
            if (filePath) {
                console.log('[Renderer] Selected file path:', filePath);
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
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onClick={handleClick}
            style={{
                border: isDragOver ? '2px dashed var(--primary-color)' : '2px dashed rgba(255,255,255,0.1)',
                textAlign: 'center',
                padding: '3rem',
                cursor: 'pointer',
                transition: 'all 0.3s ease'
            }}
        >
            {file ? (
                <div>
                    <h3 style={{ marginBottom: '0.5rem', color: 'var(--primary-color)' }}>{file.name}</h3>
                    <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>Ready to process (Click or drop to change)</p>
                </div>
            ) : (
                <div>
                    <div style={{ fontSize: '3rem', marginBottom: '1rem', color: isDragOver ? 'var(--primary-color)' : '#555' }}>
                        📂
                    </div>
                    <h3>Click or Drag & Drop MP4 Video</h3>
                </div>
            )}
        </div>
    );
}
