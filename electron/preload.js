const { contextBridge, ipcRenderer } = require('electron');

// Expose Electron APIs to the React renderer process securely
contextBridge.exposeInMainWorld('electronAPI', {
    minimize: () => ipcRenderer.send('window-minimize'),
    maximize: () => ipcRenderer.send('window-maximize'),
    close: () => ipcRenderer.send('window-close'),
    showNotification: (title, body) => ipcRenderer.send('show-notification', { title, body }),
    setWindowMode: (mode) => ipcRenderer.send('window-set-mode', mode),
    appReady: () => ipcRenderer.send('app-ready'),
    onModeChanged: (callback) => {
        const subscription = (event, mode) => callback(mode);
        ipcRenderer.on('mode-changed', subscription);
        return () => ipcRenderer.removeListener('mode-changed', subscription);
    },
    onStartSession: (callback) => {
        const subscription = () => callback();
        ipcRenderer.on('start-session', subscription);
        return () => ipcRenderer.removeListener('start-session', subscription);
    }
});
