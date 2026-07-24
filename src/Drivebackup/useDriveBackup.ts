import { useState, useEffect, useCallback } from 'react';
import { FOCORA_BACKUP_KEYS } from '../Offlinebackup/backupRegistry';
import { BackupSerializer } from '../Offlinebackup/backup/BackupSerializer';
import { validateBackup, calculateSHA256 } from '../Offlinebackup/backup/BackupValidator';

const METADATA_KEY = 'focora-sync-metadata';
const ROLLBACK_TEMP_KEY = 'focora-restore-rollback-temp';

export interface SyncMetadata {
  lastBackup: string | null;
  lastRestore: string | null;
  googleEmail: string | null;
  driveFolderId: string | null;
  lastError: string | null;
  backupSize: string | null;
  schemaVersion: number;
}

const getDriveAPI = () => {
  if (typeof window === 'undefined') return null;
  return (window as any).electronAPI?.drive;
};

// Formats byte count to a clean human-readable size
const formatBytes = (bytes: number): string => {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

export function useDriveBackup() {
  const [connected, setConnected] = useState<boolean>(false);
  const [syncing, setSyncing] = useState<boolean>(false);
  const [progress, setProgress] = useState<string>('');
  const [error, setError] = useState<string | null>(null);

  // Load telemetry metadata from localStorage
  const [metadata, setMetadata] = useState<SyncMetadata>(() => {
    const saved = localStorage.getItem(METADATA_KEY);
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error('Failed to parse sync metadata:', e);
      }
    }
    return {
      lastBackup: null,
      lastRestore: null,
      googleEmail: null,
      driveFolderId: null,
      lastError: null,
      backupSize: null,
      schemaVersion: 1
    };
  });

  // Save metadata changes to localStorage
  const updateMetadata = useCallback((updates: Partial<SyncMetadata>) => {
    setMetadata(prev => {
      const next = { ...prev, ...updates };
      localStorage.setItem(METADATA_KEY, JSON.stringify(next));
      return next;
    });
  }, []);

  // Check initial connection status from main process
  const checkStatus = useCallback(async () => {
    const drive = getDriveAPI();
    if (!drive) return;
    try {
      const res = await drive.status();
      setConnected(res.connected);
      if (res.connected && res.email) {
        updateMetadata({ googleEmail: res.email, lastError: null });
      } else {
        updateMetadata({ googleEmail: null });
      }
    } catch (err: any) {
      console.error('Failed to check Drive status', err);
    }
  }, [updateMetadata]);

  useEffect(() => {
    checkStatus();
  }, [checkStatus]);

  // Subscribe to progress events from the main process
  useEffect(() => {
    const drive = getDriveAPI();
    if (!drive) return;

    const unsubscribe = drive.onProgress((status: string) => {
      setProgress(status);
    });

    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, []);

  // Connect Google Drive (OAuth Flow)
  const connect = useCallback(async () => {
    const drive = getDriveAPI();
    if (!drive) return;
    setError(null);
    setProgress('Opening browser for Google sign-in...');
    try {
      const res = await drive.connect();
      if (res.success && res.email) {
        setConnected(true);
        updateMetadata({ googleEmail: res.email, lastError: null });
        setProgress('');
      } else {
        const errMsg = res.error || 'Failed to authenticate';
        setError(errMsg);
        updateMetadata({ lastError: errMsg });
        setProgress('');
      }
    } catch (err: any) {
      const errMsg = err.message || 'OAuth connection failed';
      setError(errMsg);
      updateMetadata({ lastError: errMsg });
      setProgress('');
    }
  }, [updateMetadata]);

  // Disconnect Google Drive
  const disconnect = useCallback(async () => {
    const drive = getDriveAPI();
    if (!drive) return;
    setError(null);
    setProgress('Disconnecting account...');
    try {
      const res = await drive.disconnect();
      if (res.success) {
        setConnected(false);
        updateMetadata({
          googleEmail: null,
          lastError: null
        });
        setProgress('');
      } else {
        const errMsg = res.error || 'Failed to disconnect';
        setError(errMsg);
        updateMetadata({ lastError: errMsg });
        setProgress('');
      }
    } catch (err: any) {
      const errMsg = err.message || 'Failed to disconnect';
      setError(errMsg);
      updateMetadata({ lastError: errMsg });
      setProgress('');
    }
  }, [updateMetadata]);

  // Backup data to Google Drive
  const backup = useCallback(async () => {
    const drive = getDriveAPI();
    if (!drive) return;

    setSyncing(true);
    setError(null);
    setProgress('Packaging local storage data...');

    try {
      // 1. Gather all local keys
      const serializedData = BackupSerializer.serialize(FOCORA_BACKUP_KEYS);
      const dataString = JSON.stringify(serializedData);

      // 2. Compute checksum of data
      const checksum = await calculateSHA256(dataString);

      // 3. Construct backup payload
      const payload = {
        app: 'focora',
        version: '2.0.0',
        backupVersion: 1,
        createdAt: new Date().toISOString(),
        checksum,
        data: serializedData
      };

      // 4. Send payload to Main process to upload
      const res = await drive.backup(payload);
      if (!res.success) {
        throw new Error(res.error || 'Upload to Google Drive failed.');
      }

      // 5. Update success telemetry
      const sizeStr = formatBytes(new Blob([JSON.stringify(payload)]).size);
      updateMetadata({
        lastBackup: new Date().toISOString(),
        driveFolderId: res.folderId || null,
        backupSize: sizeStr,
        lastError: null
      });

      setProgress('Backup completed successfully.');
      setTimeout(() => setProgress(''), 3000);
    } catch (err: any) {
      const errMsg = err.message || 'Backup failed';
      setError(errMsg);
      updateMetadata({ lastError: errMsg });
      setProgress('');
    } finally {
      setSyncing(false);
    }
  }, [updateMetadata]);

  // Restore data from Google Drive
  const restore = useCallback(async () => {
    const drive = getDriveAPI();
    if (!drive) return;

    setSyncing(true);
    setError(null);
    setProgress('Fetching backup payload...');

    // We store the backup of the current localStorage state for rollback
    let localRollbackBackup: Record<string, string | null> | null = null;

    try {
      // 1. Download payload from Drive
      const res = await drive.restore();
      if (!res.success || !res.data) {
        throw new Error(res.error || 'Failed to download restore backup.');
      }

      // 2. Validate payload schema & checksum
      setProgress('Validating download integrity...');
      const validatedPayload = await validateBackup(res.data);

      // 3. Create temporary rollback backup in case write fails midway
      setProgress('Creating local recovery backup...');
      localRollbackBackup = BackupSerializer.serialize(FOCORA_BACKUP_KEYS);
      localStorage.setItem(ROLLBACK_TEMP_KEY, JSON.stringify(localRollbackBackup));

      // 4. Atomic write operation
      setProgress('Applying restored data...');
      // Clear target keys
      FOCORA_BACKUP_KEYS.forEach(key => localStorage.removeItem(key));
      // Write restored keys
      BackupSerializer.deserialize(validatedPayload.data);

      // 5. Verify write success (check required configuration is present)
      if (!localStorage.getItem('study-timer-timer-config') || !localStorage.getItem('study-timer-features')) {
        throw new Error('Verification failed. Restored data is incomplete.');
      }

      // 6. Success: Clean rollback backup and update telemetry
      localStorage.removeItem(ROLLBACK_TEMP_KEY);

      const sizeStr = formatBytes(new Blob([JSON.stringify(validatedPayload)]).size);
      updateMetadata({
        lastRestore: new Date().toISOString(),
        backupSize: sizeStr,
        lastError: null
      });

      setProgress('Restored successfully! Reloading...');

      // Force app reload to load restored states
      setTimeout(() => {
        window.location.reload();
      }, 1500);

    } catch (err: any) {
      const errMsg = err.message || 'Restore failed';
      console.error('focora/restore: Fail detected, executing rollback...', err);

      // Rollback to previous state if a recovery backup was created
      if (localRollbackBackup) {
        try {
          setProgress('Restoration failed. Rolling back database changes...');
          BackupSerializer.deserialize(localRollbackBackup);
          localStorage.removeItem(ROLLBACK_TEMP_KEY);
        } catch (rollbackErr) {
          console.error('Critical: Rollback failed during recovery!', rollbackErr);
        }
      }

      setError(errMsg);
      updateMetadata({ lastError: errMsg });
      setProgress('');
      setSyncing(false);
    }
  }, [updateMetadata]);

  return {
    connected,
    syncing,
    progress,
    error,
    metadata,
    connect,
    disconnect,
    backup,
    restore,
    checkStatus
  };
}
