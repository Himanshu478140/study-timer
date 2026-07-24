import { FOCORA_BACKUP_KEYS } from '../../../Offlinebackup/backupRegistry';

/**
 * Calculates total size of keys stored in localStorage for Focora backup registry.
 */
export const getFocoraDataSize = (): string => {
  let totalBytes = 0;
  FOCORA_BACKUP_KEYS.forEach(key => {
    const val = localStorage.getItem(key);
    if (val) {
      totalBytes += key.length + val.length;
    }
  });
  if (totalBytes < 1024) {
    return `${totalBytes} B`;
  }
  return `${(totalBytes / 1024).toFixed(2)} KB`;
};
