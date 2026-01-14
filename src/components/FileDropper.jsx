import { useState, useCallback } from 'react';
import { useI18n } from '../i18n';

export default function FileDropper({ onFilesSelected, multiple = true }) {
    const { t } = useI18n();
    const [isDragOver, setIsDragOver] = useState(false);

    const handleDrop = useCallback((e) => {
        e.preventDefault();
        setIsDragOver(false);

        const droppedFiles = Array.from(e.dataTransfer.files);
        const mp4Files = droppedFiles.filter(f => f.name.toLowerCase().endsWith('.mp4'));

        if (mp4Files.length === 0) {
            alert(t('dropMp4Only'));
            return;
        }

        // Get file paths using Electron's webUtils
        const filesWithPaths = [];
        for (const file of mp4Files) {
            let filePath = null;
            if (window.electronAPI && window.electronAPI.getPathForFile) {
                filePath = window.electronAPI.getPathForFile(file);
            }

            if (filePath) {
                filesWithPaths.push({
                    name: file.name,
                    path: filePath
                });
            } else {
                console.error('[Renderer] Could not get file path for:', file.name);
            }
        }

        if (filesWithPaths.length > 0) {
            console.log('[Renderer] Dropped files:', filesWithPaths);
            onFilesSelected(filesWithPaths);
        } else {
            alert(t('couldNotGetPath'));
        }
    }, [onFilesSelected, t]);

    const handleDragOver = (e) => {
        e.preventDefault();
        setIsDragOver(true);
    };

    const handleDragLeave = () => {
        setIsDragOver(false);
    };

    const handleClick = async () => {
        if (window.electronAPI && window.electronAPI.selectFiles) {
            const filePaths = await window.electronAPI.selectFiles(multiple);
            if (filePaths && filePaths.length > 0) {
                console.log('[Renderer] Selected file paths:', filePaths);
                const files = filePaths.map(path => ({
                    name: path.split(/[/\\]/).pop(),
                    path: path
                }));
                onFilesSelected(files);
            }
        } else if (window.electronAPI && window.electronAPI.selectFile) {
            // Fallback for single file selection
            const filePath = await window.electronAPI.selectFile();
            if (filePath) {
                console.log('[Renderer] Selected file path:', filePath);
                onFilesSelected([{
                    name: filePath.split(/[/\\]/).pop(),
                    path: filePath
                }]);
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
                padding: '2rem',
                cursor: 'pointer',
                transition: 'all 0.3s ease',
                marginBottom: '1rem'
            }}
        >
            <div style={{ fontSize: '2.5rem', marginBottom: '0.5rem', color: isDragOver ? 'var(--primary-color)' : '#555' }}>
                📂
            </div>
            <h3 style={{ margin: '0.5rem 0' }}>
                {t('dropHint')}
            </h3>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', margin: 0 }}>
                {t('orClickToSelect')}
            </p>
        </div>
    );
}
