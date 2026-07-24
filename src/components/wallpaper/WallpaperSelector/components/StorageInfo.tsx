import { Info, HardDrive } from 'lucide-react';
import { formatBytes } from '../../../../Offlinebackup/localstorage/storageUtils';

interface StorageInfoProps {
    storageUsed: number;
    storageColor: string;
}

export const StorageInfo = ({ storageUsed, storageColor }: StorageInfoProps) => {
    return (
        <div style={{
            flexShrink: 0,
            width: '100%',
            maxWidth: '800px',
            background: 'rgba(255, 255, 255, 0.02)',
            border: '1px solid rgba(255, 255, 255, 0.05)',
            borderRadius: '1rem',
            padding: '1rem 1.25rem',
            display: 'flex',
            gap: '2rem',
            boxSizing: 'border-box'
        }}>
            {/* Image Section */}
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--color-accent)', fontWeight: 700, fontSize: '0.65rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                    <Info size={12} />
                    <span>Image Tips</span>
                </div>
                <p style={{ margin: 0, fontSize: '0.7rem', color: 'rgba(255, 255, 255, 0.5)', lineHeight: '1.4' }}>
                    • Max size: <strong>20MB</strong><br />
                    • Best formats: <strong>JPEG / PNG / WebP</strong><br />
                    • Tip: <strong>1080p+</strong> for sharpest quality.<br />
                    • Privacy: Images stay private.
                </p>
            </div>

            {/* Divider */}
            <div style={{ width: '1px', background: 'rgba(255, 255, 255, 0.05)', alignSelf: 'stretch' }} />

            {/* Video Section */}
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--color-accent)', fontWeight: 700, fontSize: '0.65rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                    <Info size={12} />
                    <span>Video Tips</span>
                </div>
                <p style={{ margin: 0, fontSize: '0.7rem', color: 'rgba(255, 255, 255, 0.5)', lineHeight: '1.4' }}>
                    • Max size: <strong>50MB</strong> (local)<br />
                    • Supports: <strong>MP4 / WebM / YouTube</strong><br />
                    • <strong>Performance Tip</strong>: YouTube and 4K streams may affect performance on low-end devices.<br />
                    • Privacy: Videos stay private.
                </p>
            </div>

            {/* Divider */}
            <div style={{ width: '1px', background: 'rgba(255, 255, 255, 0.05)', alignSelf: 'stretch' }} />

            {/* Storage Section */}
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: storageColor, fontWeight: 700, fontSize: '0.65rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                    <HardDrive size={12} />
                    <span>Storage</span>
                </div>
                <p style={{ margin: 0, fontSize: '0.7rem', color: 'rgba(255, 255, 255, 0.5)', lineHeight: '1.4', marginBottom: '0.5rem' }}>
                    <strong style={{ color: storageColor }}>{formatBytes(storageUsed)}</strong> / ~9 MB used
                </p>
                <p style={{
                    margin: '0.1rem 0 0 0',
                    fontSize: '0.66rem',
                    color: 'rgba(255, 255, 255, 0.4)',
                    lineHeight: '1.6',
                    fontWeight: 500,
                    maxWidth: '220px'
                }}>
                    Your stats, habits, tasks, quotes, and preferences stay local in your browser. If storage fills up, new data won't be saved.
                </p>
            </div>
        </div>
    );
};
