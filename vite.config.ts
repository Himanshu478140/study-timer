import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      injectRegister: false,
      registerType: 'autoUpdate',
      includeAssets: ['focora.png', 'audio/**/*'],
      manifest: {
        name: 'Focora Focus Timer',
        short_name: 'Focora',
        description: 'A premium, aesthetic focus timer with Pomodoro, Deep Work, and Zen modes.',
        theme_color: '#7c3aed',
        background_color: '#0a0a0a',
        display: 'standalone',
        orientation: 'any',
        icons: [
          {
            src: 'focora.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'any maskable'
          }
        ]
      }
    })
  ],
})
