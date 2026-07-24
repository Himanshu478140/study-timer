import { useState } from 'react';
import { type WallpaperConfig, type WallpaperCategory } from '../types';
import { estimateBase64Size, hasEnoughSpace, formatBytes, getLocalStorageSize } from '../../../../Offlinebackup/localstorage/storageUtils';
import { getYouTubeId } from '../utils/youtube';

interface UseCustomWallpapersProps {
    onSelect: (config: WallpaperConfig) => void;
    setActiveCategory: (cat: WallpaperCategory) => void;
}

export const useCustomWallpapers = ({ onSelect, setActiveCategory }: UseCustomWallpapersProps) => {
    const [customWallpapers, setCustomWallpapers] = useState<WallpaperConfig[]>(() => {
        try {
            const saved = localStorage.getItem('custom-wallpapers-list');
            return saved ? JSON.parse(saved) : [];
        } catch (e) {
            console.error("Failed to load custom wallpapers", e);
            return [];
        }
    });

    const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        // Check estimated file size after base64 encoding
        const estimatedSize = estimateBase64Size(file.size);
        if (!hasEnoughSpace(estimatedSize)) {
            alert(`Not enough storage space. This image needs ~${formatBytes(estimatedSize)}, but only ${formatBytes(getLocalStorageSize())} available. Try deleting some custom wallpapers first.`);
            e.target.value = ''; // Reset input
            return;
        }

        const reader = new FileReader();
        reader.onload = (event) => {
            const img = new Image();
            img.onload = () => {
                const canvas = document.createElement('canvas');
                let width = img.width;
                let height = img.height;

                // Max dimension 1920px (HD)
                const MAX_SIZE = 1920;
                if (width > height) {
                    if (width > MAX_SIZE) {
                        height *= MAX_SIZE / width;
                        width = MAX_SIZE;
                    }
                } else {
                    if (height > MAX_SIZE) {
                        width *= MAX_SIZE / height;
                        height = MAX_SIZE;
                    }
                }

                canvas.width = width;
                canvas.height = height;
                const ctx = canvas.getContext('2d');
                if (!ctx) return;

                ctx.drawImage(img, 0, 0, width, height);

                // --- Color Analysis ---
                const centerSize = 100;
                const centerX = Math.max(0, width / 2 - centerSize / 2);
                const centerY = Math.max(0, height / 2 - centerSize / 2);
                const imageData = ctx.getImageData(centerX, centerY, Math.min(centerSize, width), Math.min(centerSize, height)).data;

                let r = 0, g = 0, b = 0;
                const pixelCount = imageData.length / 4;

                for (let i = 0; i < imageData.length; i += 4) {
                    r += imageData[i];
                    g += imageData[i + 1];
                    b += imageData[i + 2];
                }

                r = Math.round(r / pixelCount);
                g = Math.round(g / pixelCount);
                b = Math.round(b / pixelCount);

                const rgbToHex = (r: number, g: number, b: number) => '#' + [r, g, b].map(x => x.toString(16).padStart(2, '0')).join('');
                const accentHex = rgbToHex(r, g, b);

                const getPixelBrightness = (x: number, y: number) => {
                    if (x < 0 || x >= width || y < 0 || y >= height) return 0;
                    const p = ctx.getImageData(x, y, 1, 1).data;
                    return (p[0] * 299 + p[1] * 587 + p[2] * 114) / 1000;
                }

                const b1 = getPixelBrightness(10, 10);
                const b2 = getPixelBrightness(width - 10, 10);
                const b3 = getPixelBrightness(width / 2, height / 2);
                const avgBrightness = (b1 + b2 + b3) / 3;

                const isLight = avgBrightness > 128;

                // Compress to JPEG 70%
                const dataUrl = canvas.toDataURL('image/jpeg', 0.7);

                const customConfig: WallpaperConfig = {
                    id: `custom-${Date.now()}`,
                    type: 'image',
                    category: 'Custom',
                    value: `url(${dataUrl})`,
                    thumbnail: dataUrl,
                    textColorTheme: isLight ? 'dark' : 'light',
                    accentColor: accentHex,
                    overlayOpacity: isLight ? 0.1 : 0.2
                };

                const updatedList = [customConfig, ...customWallpapers];
                setCustomWallpapers(updatedList);
                try {
                    localStorage.setItem('custom-wallpapers-list', JSON.stringify(updatedList));
                } catch (e) {
                    console.error("Failed to save custom wallpaper list", e);
                }

                onSelect(customConfig);
                setActiveCategory('Custom');
            };
            img.src = event.target?.result as string;
        };
        reader.readAsDataURL(file);
    };

    const handleVideoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        // Check file size (50MB limit)
        const MAX_SIZE = 50 * 1024 * 1024;
        if (file.size > MAX_SIZE) {
            alert('Video file is too large. Maximum size is 50MB.');
            e.target.value = '';
            return;
        }

        // Check estimated storage space
        const estimatedSize = estimateBase64Size(file.size);
        if (!hasEnoughSpace(estimatedSize)) {
            alert(`Not enough storage space. This video needs ~${formatBytes(estimatedSize)}, but only ${formatBytes(getLocalStorageSize())} available. Try deleting some custom wallpapers or use a smaller video.`);
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
            try {
                localStorage.setItem('custom-wallpapers-list', JSON.stringify(updatedList));
            } catch (e) {
                console.error("Failed to save custom wallpaper list. Video may be too large for localStorage.", e);
                alert('Video is too large to save. Try a shorter or lower quality video.');
                return;
            }

            onSelect(customConfig);
            setActiveCategory('Custom');
        };
        reader.readAsDataURL(file);
    };

    const handleAddYouTube = (youtubeUrl: string, onSuccess: () => void) => {
        const id = getYouTubeId(youtubeUrl);
        if (!id) {
            alert('Please enter a valid YouTube URL');
            return;
        }

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
        onSuccess();
        onSelect(customConfig);
    };

    const handleDeleteCustom = (id: string) => {
        const newList = customWallpapers.filter(w => w.id !== id);
        setCustomWallpapers(newList);
        localStorage.setItem('custom-wallpapers-list', JSON.stringify(newList));
    };

    return {
        customWallpapers,
        handleFileUpload,
        handleVideoUpload,
        handleAddYouTube,
        handleDeleteCustom
    };
};
