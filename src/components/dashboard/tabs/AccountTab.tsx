import React from 'react';
import { Database, AlertTriangle, Trash2 } from 'lucide-react';
import { AvatarSelector } from '../components/AvatarSelector';
import { BackupPanel } from '../components/BackupPanel';
import { GoogleDrivePanel } from '../components/GoogleDrivePanel';
import { TimezoneSelector } from '../components/TimezoneSelector';

interface AccountTabProps {
  customAvatar: string | null;
  setCustomAvatar: (avatar: string | null) => void;
  lastExportedTime: string | null;
  onExportBackup: () => void;
  onFileSelect: (e: React.ChangeEvent<HTMLInputElement>) => void;
  
  // Google Drive
  driveConnected: boolean;
  driveSyncing: boolean;
  driveProgress: string | null;
  driveError: string | null;
  driveMetadata: any;
  onConnectDrive: () => void;
  onDisconnectDrive: () => void;
  onBackupDrive: () => void;
  onRestoreDriveClick: () => void;
  
  // Timezone
  timezone: string;
  setTimezone: (tz: string) => void;
  
  // Danger Zone
  onResetClick: () => void;
}

export const AccountTab = ({
  customAvatar,
  setCustomAvatar,
  lastExportedTime,
  onExportBackup,
  onFileSelect,
  driveConnected,
  driveSyncing,
  driveProgress,
  driveError,
  driveMetadata,
  onConnectDrive,
  onDisconnectDrive,
  onBackupDrive,
  onRestoreDriveClick,
  timezone,
  setTimezone,
  onResetClick
}: AccountTabProps) => {
  return (
    <div className="dashboard-section animate-fade-in" style={{ maxWidth: '800px', margin: '0 auto' }}>
      <h2 className="flex-center" style={{ justifyContent: 'flex-start', gap: '0.5rem' }}>
        <Database size={20} /> Data & Profile
      </h2>
      <p style={{ marginBottom: '2rem', color: 'rgba(255,255,255,0.7)', fontSize: '0.9rem' }}>
        Manage your profile, timezone settings, and offline backups.
      </p>

      {/* Avatar Selector */}
      <AvatarSelector customAvatar={customAvatar} setCustomAvatar={setCustomAvatar} />

      {/* Backup panel */}
      <BackupPanel
        lastExportedTime={lastExportedTime}
        onExport={onExportBackup}
        onImportSelect={onFileSelect}
      />

      {/* Google Drive panel */}
      <GoogleDrivePanel
        connected={driveConnected}
        syncing={driveSyncing}
        progress={driveProgress}
        error={driveError}
        metadata={driveMetadata}
        onConnect={onConnectDrive}
        onDisconnect={onDisconnectDrive}
        onBackup={onBackupDrive}
        onRestoreClick={onRestoreDriveClick}
      />

      {/* Danger Zone */}
      <div style={{ 
        marginTop: 'var(--space-2)', 
        padding: 'var(--space-3)', 
        border: '1px solid rgba(239, 68, 68, 0.2)', 
        borderRadius: '1rem',
        background: 'rgba(239, 68, 68, 0.02)'
      }}>
        <h4 style={{ 
          color: '#ef4444', 
          margin: '0 0 var(--space-1) 0', 
          fontSize: '0.875rem', 
          fontWeight: 600,
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem'
        }}>
          <AlertTriangle size={14} /> Danger Zone
        </h4>
        <p style={{ 
          fontSize: '0.75rem', 
          color: 'rgba(255,255,255,0.5)', 
          margin: '0 0 var(--space-2) 0', 
          lineHeight: 1.4 
        }}>
          Wipe all your Focora settings, tasks, habits, and session history. This action is immediate and cannot be undone unless you have a backup.
        </p>
        <button 
          type="button"
          className="data-btn data-btn-danger"
          onClick={onResetClick}
        >
          <Trash2 size={16} /> Reset App
        </button>
      </div>

      {/* Timezone Selector */}
      <TimezoneSelector timezone={timezone} onSelect={setTimezone} />
    </div>
  );
};
