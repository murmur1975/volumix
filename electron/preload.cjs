const { contextBridge, ipcRenderer, webUtils } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
    getFileInfo: (filePath) => ipcRenderer.invoke('get-file-info', filePath),
    selectFile: () => ipcRenderer.invoke('select-file'),

    // Get file path from a File object (for drag and drop)
    getPathForFile: (file) => {
        try {
            return webUtils.getPathForFile(file);
        } catch (err) {
            console.error('getPathForFile error:', err);
            return null;
        }
    },

    onProgress: (callback) => ipcRenderer.on('conversion-progress', (_event, value) => callback(value)),
    startConversion: (config) => ipcRenderer.invoke('start-conversion', config)
});
