import { useState, useEffect } from 'react'
// import './App.css' // Removed default styles, using index.css
import FileDropper from './components/FileDropper'
import ControlPanel from './components/ControlPanel'
import ProgressBar from './components/ProgressBar'

function App() {
  const [file, setFile] = useState(null)
  const [volume, setVolume] = useState(1.0)
  const [lkfs, setLkfs] = useState('')
  const [sampleRate, setSampleRate] = useState('')
  const [status, setStatus] = useState('idle')
  const [progress, setProgress] = useState(0)
  const [message, setMessage] = useState('')

  useEffect(() => {
    // Listen for progress from Electron
    if (window.electronAPI && window.electronAPI.onProgress) {
      window.electronAPI.onProgress((value) => {
        setProgress(value)
      })
    }
  }, [])

  const handleFileSelected = (fileObj) => {
    setFile(fileObj)
    setStatus('idle')
    setMessage('')
    setProgress(0)
    // Optional: Get file info via IPC if needed in future
  }

  const handleStart = async () => {
    if (!file) return

    setStatus('processing')
    setProgress(0)
    setMessage('')

    try {
      // IPC call
      const result = await window.electronAPI.startConversion({
        filePath: file.path, // 'path' property exists on File in Electron renderer
        volume,
        lkfs: lkfs ? parseFloat(lkfs) : null,
        sampleRate: sampleRate || null
      })

      if (result.success) {
        setStatus('done')
        setMessage(`Success! Saved to: ${result.outputPath}`)
        // alert(`Completed! Saved to: ${result.outputPath}`)
      }
    } catch (error) {
      console.error(error)
      setStatus('error')
      setMessage(`Error: ${error.message}`)
    }
  }

  return (
    <div className="container" style={{ maxWidth: '800px', margin: '0 auto', width: '100%' }}>
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

      <FileDropper onFileSelected={handleFileSelected} file={file} />

      <ControlPanel
        volume={volume} setVolume={setVolume}
        lkfs={lkfs} setLkfs={setLkfs}
        sampleRate={sampleRate} setSampleRate={setSampleRate}
        disabled={status === 'processing'}
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
          disabled={!file || status === 'processing'}
          style={{ width: '100%', fontSize: '1.2rem', padding: '1rem' }}
        >
          {status === 'processing' ? 'Processing...' : 'Start Processing'}
        </button>
      </div>
    </div>
  )
}

export default App
