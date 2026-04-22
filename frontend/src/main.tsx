import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.tsx'
import './index.css'
import { setupErrorMonitor, reportLog } from './lib/errorReporter'

// Initialize monitoring
setupErrorMonitor();

// Log startup (Silent in dev)
reportLog('Frontend Online', `Application successfully loaded in the user's browser.`, 'info');

ReactDOM.createRoot(document.getElementById('root')!).render(

  <React.StrictMode>
    <App />
  </React.StrictMode>,
)
