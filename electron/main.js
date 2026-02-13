import { app, BrowserWindow, ipcMain } from 'electron';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

let mainWindow = null;

function createWindow() {
    mainWindow = new BrowserWindow({
        width: 400,
        height: 500,
        frame: false,
        transparent: true,
        alwaysOnTop: true,
        hasShadow: true,
        resizable: true,
        webPreferences: {
            nodeIntegration: true,
            contextIsolation: false, // For easier IPC in prototype
            webSecurity: false
        },
        minWidth: 250,
        minHeight: 250
    });

    // Development: Load Vite Dev Server
    // Production: Load built index.html
    const startUrl = process.env.ELECTRON_START_URL || 'http://localhost:5173/#/widget';

    mainWindow.loadURL(startUrl);

    // mainWindow.webContents.openDevTools({ mode: 'detach' });

    mainWindow.on('closed', () => (mainWindow = null));
}

app.on('ready', createWindow);

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        app.quit();
    }
});

app.on('activate', () => {
    if (mainWindow === null) {
        createWindow();
    }
});
