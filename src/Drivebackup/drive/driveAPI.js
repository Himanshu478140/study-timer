import { getAccessToken, fetchWithRetry } from './driveAuth.js';

/**
 * Generic helper to make Google Drive API requests.
 * Automatically injects the active OAuth access token.
 * 
 * @param {string} path API endpoint path (e.g. '/files' or '/upload/files')
 * @param {object} options standard Request options
 * @returns {Promise<any>} Response JSON data or null for 204 No Content
 */
export async function driveRequest(path, options = {}) {
  const token = await getAccessToken();
  const headers = {
    'Authorization': `Bearer ${token}`,
    ...options.headers
  };

  const isUpload = path.startsWith('/upload/');
  const baseUrl = isUpload 
    ? 'https://www.googleapis.com/upload/drive/v3'
    : 'https://www.googleapis.com/drive/v3';

  const url = `${baseUrl}${isUpload ? path.replace('/upload', '') : path}`;

  const res = await fetchWithRetry(url, { ...options, headers });
  
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Drive API error (${res.status}): ${text}`);
  }

  if (res.status === 204) {
    return null;
  }

  return res.json();
}
