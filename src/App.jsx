import { useState, useEffect, useCallback } from 'react'
import { useI18n } from './i18n'
import FileDropper from './components/FileDropper'
import ControlPanel from './components/ControlPanel'
import ProgressBar from './components/ProgressBar'
import FileTable from './components/FileTable'
import SettingsModal from './components/SettingsModal'
import LicenseModal from './components/LicenseModal'

function App() {
  const { t } = useI18n();
  // Multi-file state
  const [files, setFiles] = useState([])
  const [lkfs, setLkfs] = useState('-14')
  const [sampleRate, setSampleRate] = useState('')
  const [bitrate, setBitrate] = useState('')
  const [status, setStatus] = useState('idle')
  const [progress, setProgress] = useState(0)
  const [message, setMessage] = useState('')

  // Settings
  const [isSettingsOpen, setIsSettingsOpen] = useState(false)
  const [isLicenseOpen, setIsLicenseOpen] = useState(false)
  const [isPro, setIsPro] = useState(false)
  const [usageInfo, setUsageInfo] = useState({ remaining: 10, limit: 10 })
  const [namingConfig, setNamingConfig] = useState({
    mode: 'lkfs',
    customText: '_volumix'
  })

  // Generate unique ID
  const generateId = () => `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`

  useEffect(() => {
    if (window.electronAPI && window.electronAPI.onProgress) {
      window.electronAPI.onProgress((value) => {
        setProgress(value)
      })
    }

    // Check Pro status on mount
    const checkProStatus = async () => {
      if (window.electronAPI && window.electronAPI.getProStatus) {
        const status = await window.electronAPI.getProStatus()
        setIsPro(status.isPro)
      }
    }
    checkProStatus()

    // Check usage info
    const checkUsageInfo = async () => {
      if (window.electronAPI && window.electronAPI.getUsageInfo) {
        const info = await window.electronAPI.getUsageInfo()
        setUsageInfo(info)
      }
    }
    checkUsageInfo()
  }, [])

  // Handle multiple files selected
  const handleFilesSelected = useCallback(async (newFiles) => {
    console.log('[Renderer] handleFilesSelected:', newFiles);

    if (!newFiles || newFiles.length === 0) return;

    // Free version: limit to 1 file at a time
    let filesToAdd = newFiles;
    if (!isPro && newFiles.length > 1) {
      setMessage(t('filesAddedLimit'));
      filesToAdd = [newFiles[0]];
    }

    // Add new files to state with initial status
    const fileEntries = filesToAdd.map(f => ({
      id: generateId(),
      name: f.name,
      path: f.path,
      originalLkfs: null,
      resultLkfs: null,
      selected: true,
      status: 'analyzing'
    }));

    setFiles(prev => [...prev, ...fileEntries]);

    // Analyze each file
    for (const entry of fileEntries) {
      try {
        if (window.electronAPI && window.electronAPI.getFileInfo) {
          console.log('[Renderer] Calling getFileInfo for:', entry.path);
          const info = await window.electronAPI.getFileInfo(entry.path);
          console.log('[Renderer] File Info:', info);

          setFiles(prev => prev.map(f =>
            f.id === entry.id
              ? { ...f, originalLkfs: info.lkfs, measurements: info.measurements, status: 'ready' }
              : f
          ));
        }
      } catch (err) {
        console.error('[Renderer] Error analyzing:', entry.name, err);
        setFiles(prev => prev.map(f =>
          f.id === entry.id
            ? { ...f, status: 'error', originalLkfs: 'Error' }
            : f
        ));
      }
    }
  }, [isPro, t]);

  // Toggle single file selection
  const handleToggleFile = useCallback((fileId) => {
    setFiles(prev => prev.map(f =>
      f.id === fileId ? { ...f, selected: !f.selected } : f
    ));
  }, []);

  // Toggle all files
  const handleToggleAll = useCallback((selected) => {
    setFiles(prev => prev.map(f => ({ ...f, selected })));
  }, []);

  // Remove file from list
  const handleRemoveFile = useCallback((fileId) => {
    setFiles(prev => prev.filter(f => f.id !== fileId));
  }, []);

  // Start processing selected files
  const handleStart = async () => {
    const selectedFiles = files.filter(f => f.selected && f.status === 'ready');
    if (selectedFiles.length === 0) {
      setMessage(t('freeVersionLimit'));
      return;
    }

    // Free version: limit to 1 file at a time
    if (!isPro && selectedFiles.length > 1) {
      setMessage(t('freeVersionLimit'));
      return;
    }

    // Free version: check rate limit
    if (!isPro) {
      const info = await window.electronAPI.getUsageInfo();
      if (info.remaining < selectedFiles.length) {
        setMessage(t('rateLimitReached'));
        return;
      }
    }

    setStatus('processing');
    setProgress(0);
    setMessage('');

    let processed = 0;
    const total = selectedFiles.length;

    for (const file of selectedFiles) {
      // Update file status to processing
      setFiles(prev => prev.map(f =>
        f.id === file.id ? { ...f, status: 'processing' } : f
      ));

      try {
        const result = await window.electronAPI.startConversion({
          filePath: file.path,
          lkfs: lkfs ? parseFloat(lkfs) : null,
          sampleRate: sampleRate || null,
          bitrate: bitrate || null,
          naming: namingConfig,
          measured: file.measurements // Pass measured stats for specific linear normalization
        });

        if (result.success) {
          // Get result LKFS
          let resultLkfs = null;
          try {
            const info = await window.electronAPI.getFileInfo(result.outputPath);
            resultLkfs = info.lkfs;
          } catch (e) {
            console.error('Error getting result LKFS:', e);
          }

          setFiles(prev => prev.map(f =>
            f.id === file.id
              ? { ...f, status: 'done', resultLkfs }
              : f
          ));
        }
      } catch (error) {
        console.error('Conversion error:', error);
        setFiles(prev => prev.map(f =>
          f.id === file.id
            ? { ...f, status: 'error' }
            : f
        ));
      }

      processed++;
      setProgress(Math.round((processed / total) * 100));

      // Record file processed for rate limiting (Free version)
      if (!isPro && window.electronAPI.recordFileProcessed) {
        await window.electronAPI.recordFileProcessed();
      }
    }

    // Update usage info after processing
    if (!isPro && window.electronAPI.getUsageInfo) {
      const info = await window.electronAPI.getUsageInfo();
      setUsageInfo(info);
    }

    setStatus('done');
    setMessage(`${processed}個のファイルを処理しました！`);
  };

  // Check if any file is processing
  const isProcessing = files.some(f => f.status === 'processing' || f.status === 'analyzing');
  const hasSelectedFiles = files.some(f => f.selected && f.status === 'ready');

  return (
    <div className="container" style={{ maxWidth: '900px', margin: '0 auto', width: '100%' }}>
      <div style={{ position: 'relative' }}>
        <h1 style={{
          textAlign: 'center',
          fontSize: '3rem',
          marginBottom: '2rem',
          textShadow: '0 0 20px rgba(0,229,255,0.5)',
          background: 'linear-gradient(to right, #00e5ff, #2979ff)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent'
        }}>
          Volumix
        </h1>

        {/* Settings Button */}
        <button
          onClick={() => setIsSettingsOpen(true)}
          style={{
            position: 'absolute',
            top: '0.5rem',
            right: '0',
            background: 'none',
            border: 'none',
            fontSize: '1.8rem',
            cursor: 'pointer',
            opacity: 0.7,
            transition: 'opacity 0.2s',
            color: 'white'
          }}
          title="Settings"
          onMouseEnter={(e) => e.currentTarget.style.opacity = 1}
          onMouseLeave={(e) => e.currentTarget.style.opacity = 0.7}
        >
          ⚙️
        </button>

        {/* Pro/Free Badge */}
        <button
          onClick={() => setIsLicenseOpen(true)}
          style={{
            position: 'absolute',
            top: '0.5rem',
            left: '0',
            background: isPro
              ? 'linear-gradient(135deg, #00c853 0%, #00796b 100%)'
              : 'linear-gradient(135deg, #ff9800 0%, #f57c00 100%)',
            border: 'none',
            borderRadius: '20px',
            padding: '0.3rem 0.8rem',
            fontSize: '0.8rem',
            fontWeight: 'bold',
            cursor: 'pointer',
            color: 'white',
            boxShadow: isPro
              ? '0 2px 8px rgba(0, 200, 83, 0.4)'
              : '0 2px 8px rgba(255, 152, 0, 0.4)',
            transition: 'transform 0.2s, box-shadow 0.2s'
          }}
          title="ライセンス管理"
          onMouseEnter={(e) => { e.currentTarget.style.transform = 'scale(1.05)'; }}
          onMouseLeave={(e) => { e.currentTarget.style.transform = 'scale(1)'; }}
        >
          {isPro ? t('proBadge') : t('freeBadge')}
        </button>
      </div>

      {/* Usage info for Free version */}
      {!isPro && (
        <div style={{
          textAlign: 'center',
          fontSize: '0.85rem',
          color: 'rgba(255,255,255,0.6)',
          marginBottom: '1rem'
        }}>
          {t('remainingFiles', { count: `${usageInfo.remaining} / ${usageInfo.limit}` })}
        </div>
      )}

      <FileDropper onFilesSelected={handleFilesSelected} multiple={isPro} />

      <FileTable
        files={files}
        onToggleFile={handleToggleFile}
        onToggleAll={handleToggleAll}
        onRemoveFile={handleRemoveFile}
      />

      <ControlPanel
        lkfs={lkfs} setLkfs={setLkfs}
        sampleRate={sampleRate} setSampleRate={setSampleRate}
        bitrate={bitrate} setBitrate={setBitrate}
        disabled={isProcessing}
        isPro={isPro}
      />

      <ProgressBar progress={progress} status={status} />

      {
        message && (
          <div style={{
            marginTop: '1rem',
            padding: '1rem',
            borderRadius: '8px',
            background: status === 'error' ? 'rgba(255,0,0,0.2)' : 'rgba(0,255,0,0.2)',
            border: `1px solid ${status === 'error' ? 'red' : 'lightgreen'}`,
            textAlign: 'center'
          }}>
            {message}
          </div>
        )
      }

      <div style={{ marginTop: '2rem', textAlign: 'center' }}>
        <button
          onClick={handleStart}
          disabled={!hasSelectedFiles || isProcessing}
          style={{ width: '100%', fontSize: '1.2rem', padding: '1rem' }}
        >
          {isProcessing ? t('processing') : `${t('startProcessing')}${hasSelectedFiles ? ` (${files.filter(f => f.selected && f.status === 'ready').length})` : ''}`}
        </button>
      </div>

      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        config={namingConfig}
        onConfigChange={setNamingConfig}
      />

      <LicenseModal
        isOpen={isLicenseOpen}
        onClose={() => setIsLicenseOpen(false)}
        isPro={isPro}
        onStatusChange={(newStatus) => {
          setIsPro(newStatus);
          // Refresh usage info when license status changes
          if (!newStatus && window.electronAPI.getUsageInfo) {
            window.electronAPI.getUsageInfo().then(info => setUsageInfo(info));
          }
        }}
      />
    </div >
  )
}

export default App
