import { driveRequest } from './driveAPI.js';
import { getAccessToken, fetchWithRetry } from './driveAuth.js';

// Find a file/folder by appProperties
export async function findFileByProperty(key, value) {
  const q = encodeURIComponent(`appProperties has { key='${key}' and value='${value}' } and trashed=false`);
  const data = await driveRequest(`/files?q=${q}&fields=files(id, name, md5Checksum, appProperties)`);
  return data.files && data.files.length > 0 ? data.files[0] : null;
}

// List all files in a parent folder
export async function listFilesByParent(parentId) {
  const q = encodeURIComponent(`'${parentId}' in parents and trashed=false`);
  const data = await driveRequest(`/files?q=${q}&fields=files(id, name, md5Checksum, appProperties)&pageSize=1000`);
  return data.files || [];
}

// Create a new folder
export async function createFolder(name, parentId = null, properties = {}) {
  const body = {
    name,
    mimeType: 'application/vnd.google-apps.folder',
    appProperties: properties
  };
  if (parentId) {
    body.parents = [parentId];
  }

  return driveRequest('/files', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body)
  });
}

// Create file metadata
export async function createFileMetadata(name, parentId, properties) {
  const body = {
    name,
    parents: [parentId],
    appProperties: properties
  };
  return driveRequest('/files', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body)
  });
}

// Upload/overwrite file content (JSON or binary)
export async function uploadFileContent(fileId, mimeType, buffer) {
  return driveRequest(`/upload/files/${fileId}?uploadType=media`, {
    method: 'PATCH',
    headers: {
      'Content-Type': mimeType
    },
    body: buffer
  });
}

// Delete a file
export async function deleteFile(fileId) {
  return driveRequest(`/files/${fileId}`, {
    method: 'DELETE'
  });
}

// Ensure the Focora folder structure exists
export async function getOrCreateAppFolders() {
  let rootFolder = await findFileByProperty('type', 'root');
  if (!rootFolder) {
    console.log('focora/driveStorage: Creating root folder Focora...');
    rootFolder = await createFolder('Focora', null, { type: 'root' });
  }
  return { rootFolderId: rootFolder.id };
}

// Generic Backup executor
export async function triggerBackup(payload, webContents) {
  webContents.send('focora:drive-progress', 'Connecting to Google Drive...');
  const { rootFolderId } = await getOrCreateAppFolders();

  // Find or create timer-backup.json
  webContents.send('focora:drive-progress', 'Uploading backup to Google Drive...');
  let backupFile = await findFileByProperty('type', 'timer-backup');
  if (!backupFile) {
    backupFile = await createFileMetadata('timer-backup.json', rootFolderId, { type: 'timer-backup' });
  }

  const backupBuffer = Buffer.from(JSON.stringify(payload, null, 2), 'utf8');
  await uploadFileContent(backupFile.id, 'application/json', backupBuffer);

  webContents.send('focora:drive-progress', 'Backup complete');
  
  // Return the Folder ID for telemetry
  return { success: true, folderId: rootFolderId };
}

// Generic Restore downloader
export async function triggerRestore(webContents) {
  webContents.send('focora:drive-progress', 'Locating backup file...');
  const { rootFolderId } = await getOrCreateAppFolders();

  const backupFile = await findFileByProperty('type', 'timer-backup');
  if (!backupFile) {
    throw new Error('Backup data (timer-backup.json) not found on Google Drive.');
  }

  webContents.send('focora:drive-progress', 'Downloading backup payload...');
  const token = await getAccessToken();
  const res = await fetchWithRetry(`https://www.googleapis.com/drive/v3/files/${backupFile.id}?alt=media`, {
    headers: { 'Authorization': `Bearer ${token}` }
  });
  
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Drive API error (${res.status}): ${text}`);
  }

  const backupData = await res.json();
  webContents.send('focora:drive-progress', 'Restore download complete.');
  
  return {
    success: true,
    data: backupData
  };
}
