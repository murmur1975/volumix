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
                .audioFilters('ebur128=peak=true') // Enable True Peak measurement
                .format('null')
                .output(nullDevice);

            cmd.on('stderr', (line) => {
                stderrData += line + '\n';
            });

            cmd.on('end', () => {
                // Log last 1000 chars of stderr for debugging
                console.log('[Main] ebur128 output (last 1000 chars):', stderrData.slice(-1000));

                // Parse stderr for Summary section
                // Integrated loudness:
                //   I:         -23.0 LUFS
                //   Threshold: -33.0 LUFS
                // Loudness range:
                //   LRA:         5.0 LU
                //   Threshold: -43.0 LUFS
                //   LRA low:   -25.0 LUFS
                //   LRA high:  -20.0 LUFS
                // True peak:
                //   Peak:        0.5 dBFS

                const parseValue = (regex) => {
                    const matches = [...stderrData.matchAll(regex)];
                    return matches.length > 0 ? matches[matches.length - 1][1] : null;
                };

                const i = parseValue(/I:\s*([-\d.]+)\s*LUFS/g);
                const lra = parseValue(/LRA:\s*([-\d.]+)\s*LU/g);
                const tp = parseValue(/Peak:\s*([-\d.]+)\s*dBFS/g);

                // Integrated loudness threshold is usually the first "Threshold:" after "Integrated loudness:"
                // Because Regex is tricky with multiline/state, let's look for "Integrated loudness:" block
                let threshold = null;
                const integratedBlock = stderrData.split('Integrated loudness:')[1];
                if (integratedBlock) {
                    const threshMatch = integratedBlock.match(/Threshold:\s*([-\d.]+)\s*LUFS/);
                    if (threshMatch) threshold = threshMatch[1];
                }

                console.log('[Main] Analysis complete.', { i, lra, tp, threshold });

                resolve({
                    ...metadata,
                    lkfs: i || 'Unknown',
                    measurements: {
                        i, lra, tp, threshold
                    }
                });
            });

            cmd.on('error', (err) => {
                console.error('[Main] Analysis error:', err.message);
                resolve({ ...metadata, lkfs: 'Error' });
            });

            cmd.run();
        });
    });
});

ipcMain.handle('start-conversion', async (event, { filePath, volume, lkfs, sampleRate, naming, measured }) => {
    const fs = require('fs');
    const os = require('os');

    const dir = path.dirname(filePath);
    const ext = path.extname(filePath);
    const name = path.basename(filePath, ext);

    // Determines suffix based on naming config
    let suffix = '_volumix'; // default fallback

    if (naming) {
        if (naming.mode === 'custom') {
            suffix = naming.customText || '_volumix';
        } else if (naming.mode === 'lkfs') {
            suffix = lkfs ? `_${lkfs}LKFS` : '_volumix';
        } else if (naming.mode === 'timestamp') {
            const now = new Date();
            const yy = String(now.getFullYear()).slice(-2);
            const MM = String(now.getMonth() + 1).padStart(2, '0');
            const dd = String(now.getDate()).padStart(2, '0');
            const HH = String(now.getHours()).padStart(2, '0');
            const mm = String(now.getMinutes()).padStart(2, '0');
            suffix = `_${yy}${MM}${dd}-${HH}${mm}`;
        }
    }

    const outputPath = path.join(dir, `${name}${suffix}${ext}`);

    // Helper: Analyze a file's loudness
    const analyzeLoudness = (inputPath) => {
        return new Promise((resolve, reject) => {
            const nullDevice = process.platform === 'win32' ? 'NUL' : '/dev/null';
            let stderrData = '';

            const cmd = ffmpeg(inputPath)
                .audioFilters('ebur128=peak=true')
                .format('null')
                .output(nullDevice);

            cmd.on('stderr', (line) => {
                stderrData += line + '\n';
            });

            cmd.on('end', () => {
                const parseValue = (regex) => {
                    const matches = [...stderrData.matchAll(regex)];
                    return matches.length > 0 ? parseFloat(matches[matches.length - 1][1]) : null;
                };

                const i = parseValue(/I:\s*([-\d.]+)\s*LUFS/g);
                resolve(i);
            });

            cmd.on('error', (err) => {
                reject(err);
            });

            cmd.run();
        });
    };

    // Helper: Run one normalization pass
    const runNormalizationPass = (inputPath, outputFilePath, targetLkfs) => {
        return new Promise((resolve, reject) => {
            const audioFilters = [
                'alimiter=limit=0.9:level=false',
                `loudnorm=I=${targetLkfs}:TP=0:LRA=11`
            ];

            const cmd = ffmpeg(inputPath)
                .audioFilters(audioFilters)
                .videoCodec('copy')
                .on('progress', (progress) => {
                    const percent = Math.min(100, Math.round(progress.percent || 0));
                    event.sender.send('conversion-progress', percent);
                })
                .on('end', () => {
                    resolve();
                })
                .on('error', (err) => {
                    reject(err);
                })
                .save(outputFilePath);
        });
    };

    // Main iterative logic
    try {
        if (!lkfs) {
            // No LKFS normalization, just simple processing
            return new Promise((resolve, reject) => {
                let command = ffmpeg(filePath);
                const audioFilters = [];

                if (sampleRate) {
                    command.audioFrequency(parseInt(sampleRate));
                }

                if (volume && volume !== 1) {
                    audioFilters.push(`volume=${volume}`);
                }

                if (audioFilters.length > 0) {
                    command.audioFilters(audioFilters);
                }

                command.videoCodec('copy')
                    .on('progress', (progress) => {
                        event.sender.send('conversion-progress', Math.min(100, Math.round(progress.percent || 0)));
                    })
                    .on('end', () => resolve({ success: true, outputPath }))
                    .on('error', (err) => reject(new Error(err.message)))
                    .save(outputPath);
            });
        }

        // Iterative LKFS normalization
        const targetLkfs = parseFloat(lkfs);
        const tolerance = 1.0; // ±1 LKFS
        const maxIterations = 5;

        let currentInput = filePath;
        let tempFiles = [];
        let iteration = 0;
        let currentLoudness = null;

        console.log(`[Main] Starting iterative normalization. Target: ${targetLkfs} LKFS`);

        while (iteration < maxIterations) {
            iteration++;

            // Create temp output path
            const tempOutput = path.join(os.tmpdir(), `volumix_temp_${Date.now()}_${iteration}${ext}`);
            tempFiles.push(tempOutput);

            console.log(`[Main] Iteration ${iteration}: Processing...`);

            // Run normalization pass
            await runNormalizationPass(currentInput, tempOutput, targetLkfs);

            // Measure result
            currentLoudness = await analyzeLoudness(tempOutput);
            console.log(`[Main] Iteration ${iteration} result: ${currentLoudness} LUFS (target: ${targetLkfs})`);

            // Check convergence
            const diff = Math.abs(currentLoudness - targetLkfs);
            if (diff <= tolerance) {
                console.log(`[Main] Converged after ${iteration} iteration(s)! Diff: ${diff.toFixed(2)} LKFS`);
                break;
            }

            // Use temp output as next input
            currentInput = tempOutput;

            // Send progress update
            event.sender.send('conversion-progress', Math.round((iteration / maxIterations) * 100));
        }

        // Copy final result to output path
        const finalTemp = tempFiles[tempFiles.length - 1];
        fs.copyFileSync(finalTemp, outputPath);

        // Cleanup temp files
        for (const tempFile of tempFiles) {
            try {
                fs.unlinkSync(tempFile);
            } catch (e) {
                // Ignore cleanup errors
            }
        }

        console.log(`[Main] Final output: ${outputPath} (${currentLoudness} LUFS after ${iteration} iterations)`);
        return { success: true, outputPath, iterations: iteration, finalLoudness: currentLoudness };

    } catch (error) {
        console.error('[Main] Conversion error:', error);
        throw error;
    }
});
