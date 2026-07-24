import { useState } from 'react';
import { type WallpaperConfig } from '../../WallpaperSelector';
import { estimateBase64Size, hasEnoughSpace, formatBytes, getLocalStorageSize } from '../../../../Offlinebackup/localstorage/storageUtils';
import { getYouTubeId } from '../utils/youtube';

interface UseCustomWallpapersProps {
    onSelect: (config: WallpaperConfig) => void;
}

export const useCustomWallpapers = ({ onSelect }: UseCustomWallpapersProps) => {
    /* ── Custom wallpapers ── */
    const [customWallpapers, setCustomWallpapers] = useState<WallpaperConfig[]>(() => {
        try {
            const saved = localStorage.getItem('custom-wallpapers-list');
            return saved ? JSON.parse(saved) : [];
        } catch { return []; }
    });

    const [youtubeUrl, setYoutubeUrl] = useState('');

    /* ── Upload handlers ── */
    const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        const estimatedSize = estimateBase64Size(file.size);
        if (!hasEnoughSpace(estimatedSize)) {
            alert(`Not enough storage space. Needs ~${formatBytes(estimatedSize)}, only ${formatBytes(getLocalStorageSize())} available.`);
            e.target.value = '';
            return;
        }

        const reader = new FileReader();
        reader.onload = (event) => {
            const img = new Image();
            img.onload = () => {
                const canvas = document.createElement('canvas');
                let width = img.width;
                let height = img.height;
                const MAX_SIZE = 1920;
                if (width > height) {
                    if (width > MAX_SIZE) { height *= MAX_SIZE / width; width = MAX_SIZE; }
                } else {
                    if (height > MAX_SIZE) { width *= MAX_SIZE / height; height = MAX_SIZE; }
                }
                canvas.width = width;
                canvas.height = height;
                const ctx = canvas.getContext('2d');
                if (!ctx) return;
                ctx.drawImage(img, 0, 0, width, height);

                // Color analysis
                const centerSize = 100;
                const cx = Math.max(0, width / 2 - centerSize / 2);
                const cy = Math.max(0, height / 2 - centerSize / 2);
                const imageData = ctx.getImageData(cx, cy, Math.min(centerSize, width), Math.min(centerSize, height)).data;
                let r = 0, g = 0, b = 0;
                const pc = imageData.length / 4;
                for (let i = 0; i < imageData.length; i += 4) {
                    r += imageData[i]; g += imageData[i + 1]; b += imageData[i + 2];
                }
                r = Math.round(r / pc); g = Math.round(g / pc); b = Math.round(b / pc);
                const rgbToHex = (r: number, g: number, b: number) => '#' + [r, g, b].map(x => x.toString(16).padStart(2, '0')).join('');

                const getPixelBrightness = (x: number, y: number) => {
                    if (x < 0 || x >= width || y < 0 || y >= height) return 0;
                    const p = ctx.getImageData(x, y, 1, 1).data;
                    return (p[0] * 299 + p[1] * 587 + p[2] * 114) / 1000;
                };
                const avgBrightness = (getPixelBrightness(10, 10) + getPixelBrightness(width - 10, 10) + getPixelBrightness(width / 2, height / 2)) / 3;

                const dataUrl = canvas.toDataURL('image/jpeg', 0.7);
                const customConfig: WallpaperConfig = {
                    id: `custom-${Date.now()}`,
                    type: 'image',
                    category: 'Custom',
                    value: `url(${dataUrl})`,
                    thumbnail: dataUrl,
                    textColorTheme: avgBrightness > 128 ? 'dark' : 'light',
                    accentColor: rgbToHex(r, g, b),
                    overlayOpacity: avgBrightness > 128 ? 0.1 : 0.2
                };

                const updatedList = [customConfig, ...customWallpapers];
                setCustomWallpapers(updatedList);
                try { localStorage.setItem('custom-wallpapers-list', JSON.stringify(updatedList)); }
                catch (err) { console.error('Failed to save custom wallpaper', err); }
                onSelect(customConfig);
            };
            img.src = event.target?.result as string;
        };
        reader.readAsDataURL(file);
    };

    const handleVideoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        const MAX_SIZE = 50 * 1024 * 1024;
        if (file.size > MAX_SIZE) {
            alert('Video file is too large. Maximum size is 50MB.');
            e.target.value = '';
            return;
        }
        const estimatedSize = estimateBase64Size(file.size);
        if (!hasEnoughSpace(estimatedSize)) {
            alert(`Not enough storage space. Needs ~${formatBytes(estimatedSize)}.`);
            e.target.value = '';
            return;
        }
        if (!file.type.startsWith('video/')) {
            alert('Please upload a valid video file (MP4 or WebM recommended).');
            return;
        }
        const reader = new FileReader();
        reader.onload = (event) => {
            const videoDataUrl = event.target?.result as string;
            const customConfig: WallpaperConfig = {
                id: `custom-video-${Date.now()}`,
                type: 'video',
                category: 'Custom',
                value: '#0f0f11',
                videoUrl: videoDataUrl,
                thumbnail: '',
                textColorTheme: 'light',
                accentColor: '#818cf8',
                overlayOpacity: 0.3
            };
            const updatedList = [customConfig, ...customWallpapers];
            setCustomWallpapers(updatedList);
            try { localStorage.setItem('custom-wallpapers-list', JSON.stringify(updatedList)); }
            catch (err) {
                console.error('Failed to save video wallpaper', err);
                alert('Video is too large to save.');
                return;
            }
            onSelect(customConfig);
        };
        reader.readAsDataURL(file);
    };

    const handleAddYouTube = () => {
        const id = getYouTubeId(youtubeUrl);
        if (!id) { alert('Please enter a valid YouTube URL'); return; }
        const customConfig: WallpaperConfig = {
            id: `youtube-${Date.now()}`,
            type: 'youtube',
            category: 'Custom',
            value: '#0f0f11',
            youtubeId: id,
            thumbnail: `https://img.youtube.com/vi/${id}/mqdefault.jpg`,
            textColorTheme: 'light',
            accentColor: '#ef4444',
            overlayOpacity: 0.1
        };
        const updatedList = [customConfig, ...customWallpapers];
        setCustomWallpapers(updatedList);
        localStorage.setItem('custom-wallpapers-list', JSON.stringify(updatedList));
        setYoutubeUrl('');
        onSelect(customConfig);
    };

    const handleDeleteCustom = (id: string) => {
        const newList = customWallpapers.filter(w => w.id !== id);
        setCustomWallpapers(newList);
        localStorage.setItem('custom-wallpapers-list', JSON.stringify(newList));
    };

    return {
        customWallpapers,
        youtubeUrl,
        setYoutubeUrl,
        handleFileUpload,
        handleVideoUpload,
        handleAddYouTube,
        handleDeleteCustom
    };
};
