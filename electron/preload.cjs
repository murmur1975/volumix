const { contextBridge, ipcRenderer, webUtils } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
    getFileInfo: (filePath) => ipcRenderer.invoke('get-file-info', filePath),
    selectFile: () => ipcRenderer.invoke('select-file'),
    selectFiles: (multiple) => ipcRenderer.invoke('select-files', multiple),

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
    startConversion: (config) => ipcRenderer.invoke('start-conversion', config),

    // ライセンス管理API
    getLicenseStatus: () => ipcRenderer.invoke('get-license-status'),
    checkFreeRestrictions: (fileCount) => ipcRenderer.invoke('check-free-restrictions', { fileCount }),
    recordFileProcessing: (fileCount) => ipcRenderer.invoke('record-file-processing', { fileCount }),
    activateLicense: (licenseKey) => ipcRenderer.invoke('activate-license', { licenseKey }),
    validateLicense: () => ipcRenderer.invoke('validate-license'),
    deactivateLicense: () => ipcRenderer.invoke('deactivate-license')
});
