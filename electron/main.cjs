const { app, BrowserWindow, ipcMain, dialog } = require('electron');
const path = require('path');
const ffmpeg = require('fluent-ffmpeg');
const ffmpegPath = require('ffmpeg-static');
const ffprobePath = require('ffprobe-static').path;

// Set ffmpeg paths
ffmpeg.setFfmpegPath(ffmpegPath);
ffmpeg.setFfprobePath(ffprobePath);

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
    // if (process.env.NODE_ENV === 'development') {
    //     mainWindow.webContents.openDevTools();
    // }
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
ipcMain.handle('select-file', async () => {
    const { canceled, filePaths } = await dialog.showOpenDialog({
        properties: ['openFile'],
        filters: [{ name: 'Movies', extensions: ['mp4'] }]
    });
    if (canceled) {
        return null;
    } else {
        return filePaths[0];
    }
});

ipcMain.handle('select-files', async (event, multiple) => {
    const properties = multiple ? ['openFile', 'multiSelections'] : ['openFile'];
    const { canceled, filePaths } = await dialog.showOpenDialog({
        properties,
        filters: [{ name: 'Movies', extensions: ['mp4'] }]
    });
    if (canceled) {
        return [];
    } else {
        return filePaths;
    }
});

ipcMain.handle('get-file-info', async (event, filePath) => {
    console.log('[Main] get-file-info called for:', filePath);

    return new Promise((resolve, reject) => {
        // First get basic metadata
        ffmpeg.ffprobe(filePath, (err, metadata) => {
            if (err) {
                console.error('[Main] ffprobe error:', err);
                return reject(err);
            }
            console.log('[Main] ffprobe success');

            const audioStream = metadata.streams.find(s => s.codec_type === 'audio');
            if (!audioStream) {
                console.log('[Main] No audio stream found.');
                resolve({ ...metadata, lkfs: 'No Audio' });
                return;
            }

            console.log('[Main] Starting ebur128 analysis...');

            // Use 'NUL' on Windows, '/dev/null' on Unix
            const nullDevice = process.platform === 'win32' ? 'NUL' : '/dev/null';

            let stderrData = '';

            const cmd = ffmpeg(filePath)
                .audioFilters('ebur128')
                .format('null')
                .output(nullDevice);

            cmd.on('stderr', (line) => {
                stderrData += line + '\n';
            });

            cmd.on('end', () => {
                // Log last 1000 chars of stderr for debugging
                console.log('[Main] ebur128 output (last 1000 chars):', stderrData.slice(-1000));

                // Parse stderr for Summary section's Integrated Loudness
                // The Summary section looks like:
                //   Summary:
                //     Integrated loudness:
                //       I:         -23.0 LUFS
                // We want the LAST occurrence of "I:" followed by LUFS
                const matches = stderrData.matchAll(/I:\s*([-\d.]+)\s*LUFS/g);
                const allMatches = [...matches];
                const lkfs = allMatches.length > 0
                    ? parseFloat(allMatches[allMatches.length - 1][1])
                    : 'Unknown';
                console.log('[Main] Analysis complete. Final LKFS:', lkfs);
                resolve({ ...metadata, lkfs });
            });

            cmd.on('error', (err) => {
                console.error('[Main] Analysis error:', err.message);
                resolve({ ...metadata, lkfs: 'Error' });
            });

            cmd.run();
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
