import { Cloud, RefreshCw, Download, LogOut, AlertTriangle } from 'lucide-react';

interface GoogleDrivePanelProps {
  connected: boolean;
  syncing: boolean;
  progress: string | null;
  error: string | null;
  metadata: {
    googleEmail?: string;
    backupSize?: string;
    lastBackup?: string;
    lastRestore?: string;
  };
  onConnect: () => void;
  onDisconnect: () => void;
  onBackup: () => void;
  onRestoreClick: () => void;
}

export const GoogleDrivePanel = ({
  connected,
  syncing,
  progress,
  error,
  metadata,
  onConnect,
  onDisconnect,
  onBackup,
  onRestoreClick
}: GoogleDrivePanelProps) => {
  return (
    <div className="telemetry-card" style={{ marginTop: '1.5rem' }}>
      <h3 style={{ fontSize: '1rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.5rem', margin: '0 0 1.25rem 0' }}>
        <Cloud size={16} color="var(--color-accent)" /> Google Drive Sync
      </h3>

      {!connected ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <p style={{ fontSize: '0.85rem', color: 'rgba(255,255,255,0.6)', margin: 0, lineHeight: 1.5 }}>
            Securely back up your study routines, habits, task lists, and stats to your private Google Drive storage. This data is private to you and isolated to this application folder.
          </p>
          <div>
            <button 
              className="data-btn data-btn-primary"
              onClick={onConnect}
              disabled={syncing}
              style={{ gap: '0.6rem', padding: '0.6rem 1.2rem' }}
            >
              <Cloud size={16} /> Connect Google Drive
            </button>
          </div>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          {/* Drive Telemetry Grid */}
          <div className="telemetry-grid">
            <div className="telemetry-item">
              <span className="telemetry-label">Connected Account</span>
              <span className="telemetry-value" style={{ fontSize: '1rem', color: 'var(--color-accent)' }}>
                {metadata.googleEmail || 'Connected'}
              </span>
            </div>
            <div className="telemetry-item">
              <span className="telemetry-label">Backup Size</span>
              <span className="telemetry-value" style={{ fontSize: '1rem' }}>
                {metadata.backupSize || '0 B'}
              </span>
            </div>
            <div className="telemetry-item">
              <span className="telemetry-label">Last Backed Up</span>
              <span className="telemetry-value" style={{ fontSize: '1rem' }}>
                {metadata.lastBackup ? new Date(metadata.lastBackup).toLocaleDateString(undefined, {
                  year: 'numeric',
                  month: 'short',
                  day: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit'
                }) : 'Never'}
              </span>
            </div>
            <div className="telemetry-item">
              <span className="telemetry-label">Last Restored</span>
              <span className="telemetry-value" style={{ fontSize: '1rem' }}>
                {metadata.lastRestore ? new Date(metadata.lastRestore).toLocaleDateString(undefined, {
                  year: 'numeric',
                  month: 'short',
                  day: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit'
                }) : 'Never'}
              </span>
            </div>
          </div>

          {/* Sync Progress / Error States */}
          {progress && (
            <div style={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: '0.6rem', 
              padding: '0.8rem 1rem', 
              background: 'rgba(255,255,255,0.03)', 
              borderRadius: '0.75rem',
              border: '1px solid rgba(255,255,255,0.06)',
              fontSize: '0.85rem'
            }}>
              <RefreshCw size={14} className="spin-animation" style={{ color: 'var(--color-accent)' }} />
              <span>{progress}</span>
            </div>
          )}

          {error && (
            <div style={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: '0.6rem', 
              padding: '0.8rem 1rem', 
              background: 'rgba(239, 68, 68, 0.08)', 
              borderRadius: '0.75rem',
              border: '1px solid rgba(239, 68, 68, 0.15)',
              fontSize: '0.85rem',
              color: '#ff6b6b'
            }}>
              <AlertTriangle size={14} />
              <span>{error}</span>
            </div>
          )}

          {/* Action buttons */}
          <div className="data-actions-row">
            <button 
              className="data-btn data-btn-primary"
              onClick={onBackup}
              disabled={syncing}
              style={{ gap: '0.5rem' }}
            >
              <RefreshCw size={14} className={syncing ? 'spin-animation' : ''} /> Sync to Cloud
            </button>

            <button 
              className="data-btn data-btn-secondary"
              onClick={onRestoreClick}
              disabled={syncing}
              style={{ gap: '0.5rem' }}
            >
              <Download size={14} /> Restore from Cloud
            </button>

            <button 
              className="data-btn data-btn-secondary"
              onClick={onDisconnect}
              disabled={syncing}
              style={{ gap: '0.5rem', marginLeft: 'auto', background: 'rgba(255, 75, 75, 0.05)', color: '#ff6b6b', borderColor: 'rgba(255, 75, 75, 0.1)' }}
            >
              <LogOut size={14} /> Disconnect
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
