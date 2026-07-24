import { useState, useEffect } from 'react';
import { type WallpaperConfig } from '../types';
import { getLocalStorageSize, getStorageUsagePercent } from '../../../../Offlinebackup/localstorage/storageUtils';

export const useStorageInfo = (customWallpapers: WallpaperConfig[]) => {
    const [storageUsed, setStorageUsed] = useState(0);
    const [storagePercent, setStoragePercent] = useState(0);

    useEffect(() => {
        setStorageUsed(getLocalStorageSize());
        setStoragePercent(getStorageUsagePercent());
    }, [customWallpapers]);

    const getStorageColor = () => {
        if (storagePercent < 60) return '#10b981'; // Green
        if (storagePercent < 85) return '#f59e0b'; // Yellow
        return '#ef4444'; // Red
    };

    return {
        storageUsed,
        storagePercent,
        storageColor: getStorageColor()
    };
};
