import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { FocusTaskProvider } from './context/FocusTaskContext'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <FocusTaskProvider>
      <App />
    </FocusTaskProvider>
  </StrictMode>,
)
