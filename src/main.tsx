import React from 'react'
import ReactDOM from 'react-dom/client'
// Global base/chrome first so per-panel stylesheets (imported by each panel
// component) load AFTER and can override on equal specificity.
import './styles.css'
import './parchment.css'
import App from './App'
import { startDiskBackup } from './store/backup'

startDiskBackup()

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)
