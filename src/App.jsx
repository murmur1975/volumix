import { useState, useEffect, useCallback } from 'react'
import FileDropper from './components/FileDropper'
import ControlPanel from './components/ControlPanel'
import ProgressBar from './components/ProgressBar'
import FileTable from './components/FileTable'
import SettingsModal from './components/SettingsModal'

function App() {
  // Multi-file state
  const [files, setFiles] = useState([])
  const [lkfs, setLkfs] = useState('-14')
  const [sampleRate, setSampleRate] = useState('')
  const [status, setStatus] = useState('idle')
  const [progress, setProgress] = useState(0)
  const [message, setMessage] = useState('')

  // Settings
  const [isSettingsOpen, setIsSettingsOpen] = useState(false)
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
  }, [])

  // Handle multiple files selected
  const handleFilesSelected = useCallback(async (newFiles) => {
    console.log('[Renderer] handleFilesSelected:', newFiles);

    if (!newFiles || newFiles.length === 0) return;

    // Add new files to state with initial status
    const fileEntries = newFiles.map(f => ({
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
  }, []);

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
      setMessage('No files selected for processing');
      return;
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
    }

    setStatus('done');
    setMessage(`Processed ${processed} file(s) successfully!`);
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
      </div>

      <FileDropper onFilesSelected={handleFilesSelected} multiple={true} />

      <FileTable
        files={files}
        onToggleFile={handleToggleFile}
        onToggleAll={handleToggleAll}
        onRemoveFile={handleRemoveFile}
      />

      <ControlPanel
        lkfs={lkfs} setLkfs={setLkfs}
        sampleRate={sampleRate} setSampleRate={setSampleRate}
        disabled={isProcessing}
      />

      <ProgressBar progress={progress} status={status} />

      {message && (
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
      )}

      <div style={{ marginTop: '2rem', textAlign: 'center' }}>
        <button
          onClick={handleStart}
          disabled={!hasSelectedFiles || isProcessing}
          style={{ width: '100%', fontSize: '1.2rem', padding: '1rem' }}
        >
          {isProcessing ? 'Processing...' : `Start Processing${hasSelectedFiles ? ` (${files.filter(f => f.selected && f.status === 'ready').length})` : ''}`}
        </button>
      </div>

      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        config={namingConfig}
        onConfigChange={setNamingConfig}
      />
    </div>
  )
}

export default App
