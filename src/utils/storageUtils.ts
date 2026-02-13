/**
 * Utility functions for monitoring localStorage usage
 */

/**
 * Calculate the total size of localStorage in bytes
 */
export function getLocalStorageSize(): number {
    let total = 0;
    for (const key in localStorage) {
        if (localStorage.hasOwnProperty(key)) {
            total += key.length + (localStorage.getItem(key)?.length || 0);
        }
    }
    return total;
}

/**
 * Calculate the size of a specific localStorage key in bytes
 */
export function getItemSize(key: string): number {
    const value = localStorage.getItem(key);
    if (!value) return 0;
    return key.length + value.length;
}

/**
 * Format bytes to human-readable format
 */
export function formatBytes(bytes: number): string {
    if (bytes === 0) return '0 B';

    const kb = bytes / 1024;
    if (kb < 1) return `${bytes} B`;

    const mb = kb / 1024;
    if (mb < 1) return `${kb.toFixed(2)} KB`;

    return `${mb.toFixed(2)} MB`;
}

/**
 * Estimate available localStorage space
 * Most browsers have ~10MB limit, but we use 9MB to be safe
 */
export function getAvailableSpace(): number {
    const ESTIMATED_LIMIT = 9 * 1024 * 1024; // 9MB in bytes
    const used = getLocalStorageSize();
    return Math.max(0, ESTIMATED_LIMIT - used);
}

/**
 * Check if there's enough space for new data
 */
export function hasEnoughSpace(estimatedSize: number): boolean {
    const available = getAvailableSpace();
    // Add 10% buffer for safety
    return available > (estimatedSize * 1.1);
}

/**
 * Get storage usage percentage (0-100)
 */
export function getStorageUsagePercent(): number {
    const ESTIMATED_LIMIT = 9 * 1024 * 1024; // 9MB
    const used = getLocalStorageSize();
    return Math.min(100, (used / ESTIMATED_LIMIT) * 100);
}

/**
 * Estimate the size of a file after base64 encoding
 * Base64 adds ~33% overhead
 */
export function estimateBase64Size(fileSize: number): number {
    return Math.ceil(fileSize * 1.33);
}
