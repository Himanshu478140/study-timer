import React from 'react';
import { Image as ImageIcon, Video, Youtube, Plus } from 'lucide-react';

interface UploadSectionProps {
    youtubeUrl: string;
    setYoutubeUrl: (url: string) => void;
    handleFileUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
    handleVideoUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
    handleAddYouTube: () => void;
}

export const UploadSection = ({
    youtubeUrl,
    setYoutubeUrl,
    handleFileUpload,
    handleVideoUpload,
    handleAddYouTube
}: UploadSectionProps) => {
    return (
        <>
            {/* Image upload */}
            <label className="wg-upload-card" tabIndex={0} aria-label="Upload custom image wallpaper">
                <div className="wg-upload-card__preview">
                    <ImageIcon size={20} />
                    <span style={{ fontSize: '0.625rem', fontWeight: 600 }}>Upload Image</span>
                </div>
                <span className="wg-upload-card__label">Image</span>
                <input type="file" accept="image/*" onChange={handleFileUpload} hidden />
            </label>

            {/* Video upload */}
            <label className="wg-upload-card" tabIndex={0} aria-label="Upload custom video wallpaper">
                <div className="wg-upload-card__preview">
                    <Video size={20} />
                    <span style={{ fontSize: '0.625rem', fontWeight: 600 }}>Upload Video</span>
                </div>
                <span className="wg-upload-card__label">Video</span>
                <input type="file" accept="video/*" onChange={handleVideoUpload} hidden />
            </label>

            {/* YouTube card */}
            <div className="wg-youtube-row">
                <div className="wg-youtube-card">
                    <div className="wg-youtube-card__header">
                        <Youtube size={12} />
                        <span>YouTube</span>
                    </div>
                    <div className="wg-youtube-card__input-row">
                        <input
                            className="wg-youtube-card__input"
                            type="text"
                            placeholder="Paste link..."
                            value={youtubeUrl}
                            onChange={(e) => setYoutubeUrl(e.target.value)}
                            onKeyDown={(e) => { if (e.key === 'Enter') handleAddYouTube(); }}
                        />
                        <button
                            className="wg-youtube-card__submit"
                            onClick={handleAddYouTube}
                            aria-label="Add YouTube wallpaper"
                        >
                            <Plus size={14} />
                        </button>
                    </div>
                </div>
                <span className="wg-upload-card__label">YouTube Link</span>
            </div>
        </>
    );
};
