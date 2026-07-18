import './index.css'

function App() {
  return (
    <div className="app-container" style={{ alignItems: 'center', justifyContent: 'center' }}>
      <div className="glass-card" style={{ maxWidth: '500px', textAlign: 'center' }}>
        <h1 style={{ marginBottom: '16px' }}>CrossSearch AI</h1>
        <p style={{ color: 'var(--text-secondary)', marginBottom: '32px' }}>
          Offline Multimodal RAG Engine
        </p>
        <button 
          className="btn-primary"
          onClick={() => {
            // Test Electron IPC
            if (window.ipcRenderer) {
              window.ipcRenderer.send('test-message', 'Hello from React!')
            } else {
              console.log('Running in browser (No Electron IPC)')
            }
          }}
        >
          Initialize System
        </button>
      </div>
    </div>
  )
}

export default App
