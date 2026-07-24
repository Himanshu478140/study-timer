import { ipcMain } from 'electron';
import { startOAuthFlow, disconnect, loadCredentials } from '../drive/driveAuth.js';
import { triggerBackup, triggerRestore } from '../drive/driveStorage.js';

export function initDriveIPC() {
  // Connect flow
  ipcMain.handle('focora:drive-connect', async (event) => {
    try {
      const email = await startOAuthFlow();
      return { success: true, email };
    } catch (err) {
      console.error('focora/driveIPC: Connect failed', err);
      return { success: false, error: err.message };
    }
  });

  // Disconnect flow
  ipcMain.handle('focora:drive-disconnect', async (event) => {
    try {
      await disconnect();
      return { success: true };
    } catch (err) {
      console.error('focora/driveIPC: Disconnect failed', err);
      return { success: false, error: err.message };
    }
  });

  // Status check
  ipcMain.handle('focora:drive-status', async (event) => {
    try {
      const auth = loadCredentials();
      if (!auth) {
        return { connected: false };
      }
      return { connected: true, email: auth.email };
    } catch (err) {
      console.error('focora/driveIPC: Status check failed', err);
      return { connected: false, error: err.message };
    }
  });

  // Backup consolidated JSON payload
  ipcMain.handle('focora:drive-backup', async (event, payload) => {
    try {
      const res = await triggerBackup(payload, event.sender);
      return { success: true, ...res };
    } catch (err) {
      console.error('focora/driveIPC: Backup failed', err);
      return { success: false, error: err.message };
    }
  });

  // Download restore payload
  ipcMain.handle('focora:drive-restore', async (event) => {
    try {
      const res = await triggerRestore(event.sender);
      return { success: true, ...res };
    } catch (err) {
      console.error('focora/driveIPC: Restore failed', err);
      return { success: false, error: err.message };
    }
  });
}
