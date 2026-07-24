import React from 'react';
import { Database, Shield, Download, Upload } from 'lucide-react';
import { getFocoraDataSize } from '../utils/size';

interface BackupPanelProps {
  lastExportedTime: string | null;
  onExport: () => void;
  onImportSelect: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

export const BackupPanel = ({
  lastExportedTime,
  onExport,
  onImportSelect
}: BackupPanelProps) => {
  return (
    <section className="data-management-section">
      <h3 style={{ fontSize: '1rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.5rem', margin: 0 }}>
        <Database size={16} color="var(--color-accent)" /> Data Management
      </h3>

      {/* Privacy Banner */}
      <div className="privacy-banner">
        <Shield size={20} className="privacy-banner-icon" />
        <p className="privacy-banner-text">
          <strong>Offline-First & Private:</strong> Your data never leaves your device. We use no accounts, no tracking, and have zero cloud dependencies. Your focus metrics are 100% yours.
        </p>
      </div>

      {/* Telemetry & Stats */}
      <div className="telemetry-card">
        <div className="telemetry-grid">
          <div className="telemetry-item">
            <span className="telemetry-label">Stored Data Size</span>
            <span className="telemetry-value">{getFocoraDataSize()}</span>
          </div>
          <div className="telemetry-item">
            <span className="telemetry-label">Last Exported Backup</span>
            <span className="telemetry-value">
              {lastExportedTime ? new Date(lastExportedTime).toLocaleDateString(undefined, {
                year: 'numeric',
                month: 'short',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
              }) : 'Never'}
            </span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="data-actions-row">
          <button 
            className="data-btn data-btn-primary"
            onClick={onExport}
            title="Download all your Focora settings and data as a JSON file"
          >
            <Download size={16} /> Export Backup
          </button>

          <button 
            className="data-btn data-btn-secondary"
            onClick={() => document.getElementById('backup-import-input')?.click()}
            title="Restore previously exported Focora settings and data from a JSON file"
          >
            <Upload size={16} /> Import Backup
          </button>
          
          <input 
            id="backup-import-input"
            type="file"
            accept=".json"
            onChange={onImportSelect}
            style={{ display: 'none' }}
          />
        </div>
      </div>
    </section>
  );
};
