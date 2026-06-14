import { app, BrowserWindow, ipcMain, Tray, Menu, Notification, screen, protocol, net } from 'electron';
import path from 'path';
import { fileURLToPath, pathToFileURL } from 'url';
import Store from 'electron-store';

// Set application name before initializing store to ensure it uses AppData/Roaming/Focora
app.name = 'Focora';

// Single Instance Lock to prevent database access conflicts and memory footprint
if (!app.requestSingleInstanceLock()) {
    app.quit();
    process.exit(0);
}

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Initialize electron-store
const store = new Store();

let mainWindow = null;
let tray = null;
let currentMode = 'full';

// Handle second instance activation
app.on('second-instance', () => {
    if (mainWindow) {
        if (mainWindow.isMinimized()) mainWindow.restore();
        if (!mainWindow.isVisible()) mainWindow.show();
        mainWindow.focus();
    }
});

// Register custom protocol for production — gives a stable origin (app://focora)
// so localStorage always persists across restarts. Must be called before app.whenReady().
protocol.registerSchemesAsPrivileged([
    {
        scheme: 'app',
        privileges: {
            standard: true,
            secure: true,
            supportFetchAPI: true,
            corsEnabled: true,
            stream: true
        }
    }
]);

async function createWindow() {
    const isDev = !app.isPackaged;
    const startUrl = isDev
        ? (process.env.ELECTRON_START_URL || 'http://localhost:5173/')
        : 'app://focora/';

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
        show: false, // Prevents window from showing a black background before page contents are loaded
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

    // Show the window only when page has finished initial paint to prevent black flash
    mainWindow.once('ready-to-show', () => {
        mainWindow.show();
    });

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
    // Register custom protocol handler for production builds
    // Serves files from dist/ under the stable origin app://focora
    if (app.isPackaged) {
        const distPath = path.join(__dirname, '../dist');
        protocol.handle('app', async (request) => {
            const url = new URL(request.url);
            let filePath = decodeURIComponent(url.pathname);
            if (filePath === '/' || filePath === '') {
                filePath = '/index.html';
            }

            const fullPath = path.join(distPath, filePath);

            // Security: prevent path traversal
            if (!fullPath.startsWith(distPath)) {
                return new Response('Forbidden', { status: 403 });
            }

            try {
                return await net.fetch(pathToFileURL(fullPath).toString());
            } catch {
                // SPA fallback: serve index.html for client-side routing
                return net.fetch(pathToFileURL(path.join(distPath, 'index.html')).toString());
            }
        });
    }

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
