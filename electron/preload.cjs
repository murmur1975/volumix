const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
    getFileInfo: (filePath) => ipcRenderer.invoke('get-file-info', filePath),
    // Add other methods here later
    onProgress: (callback) => ipcRenderer.on('conversion-progress', (_event, value) => callback(value)),
    startConversion: (config) => ipcRenderer.invoke('start-conversion', config)
});
