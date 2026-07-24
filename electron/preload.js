const { contextBridge, ipcRenderer } = require('electron');

// Expose Electron APIs to the React renderer process securely
contextBridge.exposeInMainWorld('electronAPI', {
    minimize: () => ipcRenderer.send('window-minimize'),
    maximize: () => ipcRenderer.send('window-maximize'),
    close: () => ipcRenderer.send('window-close'),
    showNotification: (title, body) => ipcRenderer.send('show-notification', { title, body }),
    setWindowMode: (mode) => ipcRenderer.send('window-set-mode', mode),
    onModeChanged: (callback) => {
        const subscription = (event, mode) => callback(mode);
        ipcRenderer.on('mode-changed', subscription);
        return () => ipcRenderer.removeListener('mode-changed', subscription);
    },
    onStartSession: (callback) => {
        const subscription = () => callback();
        ipcRenderer.on('start-session', subscription);
        return () => ipcRenderer.removeListener('start-session', subscription);
    },
    drive: {
        connect: () => ipcRenderer.invoke('focora:drive-connect'),
        disconnect: () => ipcRenderer.invoke('focora:drive-disconnect'),
        status: () => ipcRenderer.invoke('focora:drive-status'),
        backup: (payload) => ipcRenderer.invoke('focora:drive-backup', payload),
        restore: () => ipcRenderer.invoke('focora:drive-restore'),
        onProgress: (callback) => {
            const subscription = (event, status) => callback(status);
            ipcRenderer.on('focora:drive-progress', subscription);
            return () => ipcRenderer.removeListener('focora:drive-progress', subscription);
        }
    }
});
