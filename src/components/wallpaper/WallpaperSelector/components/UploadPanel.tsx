import React from 'react';
import { Image as ImageIcon, Youtube, Plus } from 'lucide-react';
import { StorageInfo } from './StorageInfo';

interface UploadPanelProps {
    youtubeUrl: string;
    setYoutubeUrl: (url: string) => void;
    handleFileUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
    handleVideoUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
    handleAddYouTube: () => void;
    storageUsed: number;
    storageColor: string;
}

export const UploadPanel = ({
    youtubeUrl,
    setYoutubeUrl,
    handleFileUpload,
    handleVideoUpload,
    handleAddYouTube,
    storageUsed,
    storageColor
}: UploadPanelProps) => {
    return (
        <>
            <label
                className="interactive-hover"
                style={{
                    flexShrink: 0,
                    width: '80px',
                    height: '80px',
                    borderRadius: '1rem',
                    border: '2px dashed rgba(255,255,255,0.2)',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'pointer',
                    color: 'rgba(255,255,255,0.7)',
                    fontSize: '0.7rem',
                    gap: '4px'
                }}
            >
                <ImageIcon size={20} />
                <span>Image</span>
                <input type="file" accept="image/*" onChange={handleFileUpload} hidden />
            </label>

            <label
                className="interactive-hover"
                style={{
                    flexShrink: 0,
                    width: '80px',
                    height: '80px',
                    borderRadius: '1rem',
                    border: '2px dashed rgba(139, 92, 246, 0.3)',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'pointer',
                    color: 'rgba(139, 92, 246, 0.9)',
                    fontSize: '0.7rem',
                    gap: '4px'
                }}
            >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <polygon points="23 7 16 12 23 17 23 7"></polygon>
                    <rect x="1" y="5" width="15" height="14" rx="2" ry="2"></rect>
                </svg>
                <span>Video</span>
                <input type="file" accept="video/*" onChange={handleVideoUpload} hidden />
            </label>

            {/* YouTube Link Input */}
            <div style={{
                flexShrink: 0,
                display: 'flex',
                gap: '0.5rem',
                alignItems: 'center',
                background: 'rgba(255,255,255,0.03)',
                border: '1px solid rgba(255,255,255,0.1)',
                borderRadius: '1rem',
                padding: '0.5rem 0.75rem',
                height: '80px',
                boxSizing: 'border-box'
            }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#ff0000', fontSize: '0.7rem' }}>
                        <Youtube size={14} />
                        <span style={{ fontWeight: 600 }}>YouTube Link</span>
                    </div>
                    <div style={{ display: 'flex', gap: '6px' }}>
                        <input
                            type="text"
                            placeholder="Paste link..."
                            value={youtubeUrl}
                            onChange={(e) => setYoutubeUrl(e.target.value)}
                            style={{
                                background: 'rgba(255,255,255,0.05)',
                                border: '1px solid rgba(255,255,255,0.1)',
                                borderRadius: '0.5rem',
                                padding: '4px 8px',
                                color: 'white',
                                fontSize: '0.8rem',
                                width: '120px',
                                outline: 'none'
                            }}
                        />
                        <button
                            onClick={handleAddYouTube}
                            className="interactive-press"
                            style={{
                                background: 'var(--color-accent)',
                                border: 'none',
                                borderRadius: '0.5rem',
                                width: '32px',
                                height: '32px',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                color: 'white',
                                cursor: 'pointer'
                            }}
                        >
                            <Plus size={18} />
                        </button>
                    </div>
                </div>
            </div>

            {/* Instructional Note & Storage info */}
            <StorageInfo storageUsed={storageUsed} storageColor={storageColor} />
        </>
    );
};
