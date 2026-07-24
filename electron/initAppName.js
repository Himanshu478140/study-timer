import { app } from 'electron';
import path from 'path';

// Force Electron to use 'Focora' for app name and AppData directory
// MUST run before electron-store or webPreferences initialize
app.name = 'Focora';
app.setPath('userData', path.join(app.getPath('appData'), 'Focora'));
