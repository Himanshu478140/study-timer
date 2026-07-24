/**
 * Helper to calculate the SHA-256 hash of a string using native Web Crypto APIs.
 */
export async function calculateSHA256(text: string): Promise<string> {
  const msgBuffer = new TextEncoder().encode(text);
  const hashBuffer = await crypto.subtle.digest('SHA-256', msgBuffer);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

export interface BackupPayload {
  app: string;
  version: string;
  backupVersion: number;
  createdAt: string;
  checksum?: string;
  data: Record<string, string | null>;
}

/**
 * Validates the structural integrity and checksum of a download payload.
 * Throws an error if any checks fail.
 */
export async function validateBackup(payload: any): Promise<BackupPayload> {
  if (!payload || typeof payload !== 'object') {
    throw new Error('Invalid backup file. Must be a JSON object.');
  }

  // 1. Check basic schema keys
  if (payload.app !== 'focora') {
    throw new Error('Invalid backup file. App signature does not match Focora.');
  }

  if (typeof payload.backupVersion !== 'number') {
    throw new Error('Missing backup version identifier.');
  }

  if (!payload.data || typeof payload.data !== 'object') {
    throw new Error('Backup payload contains no valid data.');
  }

  // 2. Check required keys (ensure at least some configuration or main keys exist)
  const requiredKeys = ['study-timer-timer-config', 'study-timer-features'];
  const missingKeys = requiredKeys.filter(k => !(k in payload.data));
  if (missingKeys.length > 0) {
    throw new Error(`Backup data is incomplete. Missing required keys: ${missingKeys.join(', ')}`);
  }

  // 3. Verify checksum (if present)
  if (payload.checksum) {
    // Stringify the data payload exactly as it was saved
    const dataString = JSON.stringify(payload.data);
    const calculated = await calculateSHA256(dataString);
    if (calculated !== payload.checksum) {
      throw new Error('Backup checksum verification failed. The file may be corrupted.');
    }
  }

  return payload as BackupPayload;
}
