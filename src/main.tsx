import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { FocusTaskProvider } from './context/FocusTaskContext'
import { CloudSyncProvider } from './context/CloudSyncContext'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <CloudSyncProvider>
      <FocusTaskProvider>
        <App />
      </FocusTaskProvider>
    </CloudSyncProvider>
  </StrictMode>,
)
