const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');
const ffmpeg = require('fluent-ffmpeg');
const ffmpegPath = require('ffmpeg-static');

// Set ffmpeg path
ffmpeg.setFfmpegPath(ffmpegPath);

function createWindow() {
    const mainWindow = new BrowserWindow({
        width: 1000,
        height: 800,
        webPreferences: {
            preload: path.join(__dirname, 'preload.cjs'),
            contextIsolation: true,
            nodeIntegration: false,
            sandbox: false // simplify local file access for prototype
        },
        // Modern look
        titleBarStyle: 'hiddenInset',
        vibrancy: 'under-window', // macOS only but nice to have
        backgroundColor: '#000000'
    });

    const startUrl = process.env.NODE_ENV === 'development' || process.argv.includes('--dev')
        ? 'http://localhost:5173'
        : `file://${path.join(__dirname, '../dist/index.html')}`;

    mainWindow.loadURL(startUrl);

    // Open DevTools in dev mode
    // mainWindow.webContents.openDevTools();
}

app.whenReady().then(() => {
    createWindow();

    app.on('activate', () => {
        if (BrowserWindow.getAllWindows().length === 0) {
            createWindow();
        }
    });
});

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        app.quit();
    }
});

// IPC Handlers
ipcMain.handle('get-file-info', async (event, filePath) => {
    return new Promise((resolve, reject) => {
        ffmpeg.ffprobe(filePath, (err, metadata) => {
            if (err) reject(err);
            else resolve(metadata);
        });
    });
});

ipcMain.handle('start-conversion', async (event, { filePath, volume, lkfs, sampleRate }) => {
    const dir = path.dirname(filePath);
    const ext = path.extname(filePath);
    const name = path.basename(filePath, ext);
    const outputPath = path.join(dir, `${name}_volumix${ext}`);

    return new Promise((resolve, reject) => {
        let command = ffmpeg(filePath);

        // Audio Filters
        const audioFilters = [];

        // Resample
        if (sampleRate) {
            command.audioFrequency(parseInt(sampleRate));
        }

        // Volume / LKFS
        if (lkfs) {
            // Use loudnorm for LKFS normalization
            // I (Integrated Loudness) targeted
            audioFilters.push({
                filter: 'loudnorm',
                options: { I: lkfs, TP: -1.5, LRA: 11 }
            });
        } else if (volume && volume !== 1) {
            // Simple volume adjustment
            audioFilters.push(`volume=${volume}`);
        }

        if (audioFilters.length > 0) {
            command.audioFilters(audioFilters);
        }

        // Copy video stream to avoid re-encoding video if possible
        // Note: If sampling rate changes, audio is re-encoded. Video can be copied.
        command.videoCodec('copy');

        command
            .on('progress', (progress) => {
                // Send progress to renderer
                // percent might be undefined if duration is unknown
                const percent = progress.percent || 0;
                event.sender.send('conversion-progress', Math.round(percent));
            })
            .on('end', () => {
                resolve({ success: true, outputPath });
            })
            .on('error', (err) => {
                reject(new Error(err.message));
            })
            .save(outputPath);
    });
});
