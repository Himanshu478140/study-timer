import { app, BrowserWindow, ipcMain, Tray, Menu, Notification, screen } from 'electron';
import path from 'path';
import { fileURLToPath } from 'url';
import http from 'http';
import fs from 'fs';
import Store from 'electron-store';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Initialize electron-store
const store = new Store();

let mainWindow = null;
let tray = null;
let localServer = null;
let localServerPort = null;
let currentMode = 'full';

// MIME Types for local HTTP server
const MIME_TYPES = {
    '.html': 'text/html',
    '.css': 'text/css',
    '.js': 'text/javascript',
    '.json': 'application/json',
    '.png': 'image/png',
    '.jpg': 'image/jpeg',
    '.gif': 'image/gif',
    '.svg': 'image/svg+xml',
    '.ico': 'image/x-icon',
    '.mp3': 'audio/mpeg',
    '.wav': 'audio/wav',
    '.webm': 'video/webm',
    '.mp4': 'video/mp4',
    '.woff': 'font/woff',
    '.woff2': 'font/woff2',
    '.ttf': 'font/ttf',
    '.otf': 'font/otf'
};

// Start a lightweight local web server in production to load files over HTTP
function startLocalServer() {
    return new Promise((resolve, reject) => {
        const distPath = path.join(__dirname, '../dist');
        const server = http.createServer((req, res) => {
            let safeUrl = decodeURIComponent(req.url);
            const urlPath = safeUrl.split(/[?#]/)[0];
            let filePath = path.join(distPath, urlPath === '/' ? 'index.html' : urlPath);

            // Path traversal prevention
            if (!filePath.startsWith(distPath)) {
                res.statusCode = 403;
                res.end('Forbidden');
                return;
            }

            fs.readFile(filePath, (err, content) => {
                if (err) {
                    if (err.code === 'ENOENT') {
                        // Return index.html for React router fallback
                        fs.readFile(path.join(distPath, 'index.html'), (err2, indexContent) => {
                            if (err2) {
                                res.statusCode = 404;
                                res.end('Not Found');
                            } else {
                                res.writeHead(200, { 'Content-Type': 'text/html' });
                                res.end(indexContent, 'utf-8');
                            }
                        });
                    } else {
                        res.statusCode = 500;
                        res.end(`Server Error: ${err.code}`);
                    }
                } else {
                    const ext = path.extname(filePath).toLowerCase();
                    const contentType = MIME_TYPES[ext] || 'application/octet-stream';
                    res.writeHead(200, { 'Content-Type': contentType });
                    res.end(content, 'utf-8');
                }
            });
        });

        server.listen(0, '127.0.0.1', () => {
            const port = server.address().port;
            resolve({ port, server });
        });

        server.on('error', (err) => {
            reject(err);
        });
    });
}

async function createWindow() {
    const isDev = !app.isPackaged;
    let startUrl = '';

    if (isDev) {
        startUrl = process.env.ELECTRON_START_URL || 'http://localhost:5173/';
    } else {
        try {
            const result = await startLocalServer();
            localServer = result.server;
            localServerPort = result.port;
            startUrl = `http://127.0.0.1:${localServerPort}/`;
        } catch (err) {
            console.error('Failed to start local static server:', err);
            app.quit();
            return;
        }
    }

    // Load window state from store
    const savedBounds = store.get('windowBounds') || { width: 1200, height: 800 };

    const iconPath = app.isPackaged 
        ? path.join(__dirname, '../dist/focora.png') 
        : path.join(__dirname, '../public/focora.png');

    mainWindow = new BrowserWindow({
        x: savedBounds.x,
        y: savedBounds.y,
        width: savedBounds.width,
        height: savedBounds.height,
        icon: iconPath,
        frame: false,
        transparent: false,
        backgroundColor: '#0a0a0a',
        alwaysOnTop: false,
        hasShadow: true,
        resizable: true,
        webPreferences: {
            preload: path.join(__dirname, 'preload.js'),
            contextIsolation: true,
            nodeIntegration: false,
            webSecurity: true
        },
        minWidth: 800,
        minHeight: 600
    });

    if (store.get('isMaximized')) {
        mainWindow.maximize();
    }

    mainWindow.loadURL(startUrl);

    // Track bounds when window is modified
    mainWindow.on('resize', () => {
        if (currentMode === 'full') {
            if (!mainWindow.isMaximized()) {
                store.set('windowBounds', mainWindow.getBounds());
                store.set('isMaximized', false);
            } else {
                store.set('isMaximized', true);
            }
        } else {
            store.set('widgetBounds', mainWindow.getBounds());
        }
    });

    mainWindow.on('move', () => {
        if (currentMode === 'full') {
            if (!mainWindow.isMaximized()) {
                store.set('windowBounds', mainWindow.getBounds());
            }
        } else {
            store.set('widgetBounds', mainWindow.getBounds());
        }
    });

    // Hide window to tray on close
    mainWindow.on('close', (event) => {
        if (!app.isQuitting) {
            event.preventDefault();
            mainWindow.hide();
        }
    });

    mainWindow.on('closed', () => {
        mainWindow = null;
    });
}

function createTray() {
    const iconPath = app.isPackaged 
        ? path.join(__dirname, '../dist/focora.png') 
        : path.join(__dirname, '../public/focora.png');
    
    tray = new Tray(iconPath);
    const contextMenu = Menu.buildFromTemplate([
        { 
            label: 'Open Focora', 
            click: () => {
                if (mainWindow) {
                    mainWindow.show();
                    mainWindow.focus();
                }
            } 
        },
        { 
            label: 'Start Focus Session', 
            click: () => {
                if (mainWindow) {
                    mainWindow.show();
                    mainWindow.focus();
                    mainWindow.webContents.send('start-session');
                }
            } 
        },
        { type: 'separator' },
        { 
            label: 'Quit', 
            click: () => {
                app.isQuitting = true;
                app.quit();
            } 
        }
    ]);
    
    tray.setToolTip('Focora Focus Timer');
    tray.setContextMenu(contextMenu);
    
    tray.on('click', () => {
        if (mainWindow) {
            if (mainWindow.isVisible()) {
                mainWindow.hide();
            } else {
                mainWindow.show();
                mainWindow.focus();
            }
        }
    });
}

// IPC Handlers
ipcMain.on('window-minimize', () => {
    if (mainWindow) mainWindow.minimize();
});

ipcMain.on('window-maximize', () => {
    if (mainWindow) {
        if (mainWindow.isMaximized()) {
            mainWindow.unmaximize();
        } else {
            mainWindow.maximize();
        }
    }
});

ipcMain.on('window-close', () => {
    if (mainWindow) {
        // Just hide to tray
        mainWindow.hide();
    }
});

ipcMain.on('window-set-mode', (event, mode) => {
    if (!mainWindow) return;
    currentMode = mode;

    if (mode === 'widget') {
        const isMax = mainWindow.isMaximized();
        store.set('isMaximized', isMax);
        if (!isMax) {
            store.set('windowBounds', mainWindow.getBounds());
        }

        mainWindow.setMinimumSize(150, 150);
        mainWindow.setAlwaysOnTop(true, 'screen-saver');

        const savedWidget = store.get('widgetBounds') || { width: 340, height: 340 };
        const width = savedWidget.width || 340;
        const height = savedWidget.height || 340;

        let x = savedWidget.x;
        let y = savedWidget.y;
        if (x === undefined || y === undefined) {
            const primaryDisplay = screen.getPrimaryDisplay();
            const { width: scrWidth, height: scrHeight } = primaryDisplay.workAreaSize;
            x = Math.round((scrWidth - width) / 2);
            y = Math.round((scrHeight - height) / 2);
        }

        mainWindow.setBounds({ x, y, width, height });
        mainWindow.webContents.send('mode-changed', 'widget');
    } else {
        store.set('widgetBounds', mainWindow.getBounds());

        mainWindow.setAlwaysOnTop(false);
        mainWindow.setMinimumSize(800, 600);

        const savedFull = store.get('windowBounds') || { width: 1200, height: 800 };
        const width = savedFull.width || 1200;
        const height = savedFull.height || 800;

        let x = savedFull.x;
        let y = savedFull.y;
        if (x === undefined || y === undefined) {
            const primaryDisplay = screen.getPrimaryDisplay();
            const { width: scrWidth, height: scrHeight } = primaryDisplay.workAreaSize;
            x = Math.round((scrWidth - width) / 2);
            y = Math.round((scrHeight - height) / 2);
        }

        mainWindow.setBounds({ x, y, width, height });

        if (store.get('isMaximized')) {
            mainWindow.maximize();
        }

        mainWindow.webContents.send('mode-changed', 'full');
    }
});

ipcMain.on('show-notification', (event, { title, body }) => {
    if (Notification.isSupported()) {
        const notification = new Notification({
            title: title || 'Focora',
            body: body || '',
            icon: app.isPackaged 
                ? path.join(__dirname, '../dist/focora.png') 
                : path.join(__dirname, '../public/focora.png')
        });
        notification.show();
    }
});

app.whenReady().then(() => {
    createWindow();
    createTray();
});

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

app.on('will-quit', () => {
    if (localServer) {
        localServer.close();
    }
});
