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
                // Send path (Electron only property)
                onFileSelected(droppedFile);
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

    return (
        <div
            className={`glass-panel drop-zone ${isDragOver ? 'active' : ''}`}
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            style={{
                border: isDragOver ? '2px dashed var(--primary-color)' : '2px dashed rgba(255,255,255,0.1)',
                textAlign: 'center',
                padding: '3rem',
                cursor: 'default',
                transition: 'all 0.3s ease'
            }}
        >
            {file ? (
                <div>
                    <h3 style={{ marginBottom: '0.5rem', color: 'var(--primary-color)' }}>{file.name}</h3>
                    <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>Ready to process</p>
                </div>
            ) : (
                <div>
                    <div style={{ fontSize: '3rem', marginBottom: '1rem', color: isDragOver ? 'var(--primary-color)' : '#555' }}>
                        📂
                    </div>
                    <h3>Drag & Drop MP4 Video</h3>
                    <p style={{ color: 'var(--text-secondary)' }}>or click to separate audio from video (implementation detail)</p>
                </div>
            )}
        </div>
    );
}
