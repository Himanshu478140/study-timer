import { Upload, AlertTriangle, Cloud } from 'lucide-react';

interface DashboardModalsProps {
  showImportModal: boolean;
  onImportCancel: () => void;
  onImportConfirm: () => void;
  
  showResetModal: boolean;
  onResetCancel: () => void;
  onResetConfirm: () => void;
  resetConfirmText: string;
  setResetConfirmText: (text: string) => void;
  
  showDriveRestoreModal: boolean;
  onDriveRestoreCancel: () => void;
  onDriveRestoreConfirm: () => void;
}

export const DashboardModals = ({
  showImportModal,
  onImportCancel,
  onImportConfirm,
  showResetModal,
  onResetCancel,
  onResetConfirm,
  resetConfirmText,
  setResetConfirmText,
  showDriveRestoreModal,
  onDriveRestoreCancel,
  onDriveRestoreConfirm
}: DashboardModalsProps) => {
  return (
    <>
      {/* Import Confirmation Modal */}
      {showImportModal && (
        <div className="nested-modal-overlay" onClick={onImportCancel}>
          <div className="nested-modal-container" onClick={(e) => e.stopPropagation()}>
            <header className="nested-modal-header">
              <Upload size={20} color="var(--color-accent)" />
              <span>Import Backup</span>
            </header>
            
            <div className="nested-modal-body">
              <p style={{ margin: 0 }}>
                Are you sure you want to restore this backup? This action is destructive and will overwrite all your current local data, including:
              </p>
              <ul className="nested-modal-list">
                <li className="nested-modal-list-item">• Daily Habits & Logs</li>
                <li className="nested-modal-list-item">• Tasks & History</li>
                <li className="nested-modal-list-item">• Study Session Statistics</li>
                <li className="nested-modal-list-item">• Custom Quotes & Notes</li>
                <li className="nested-modal-list-item">• App Config & Theme Settings</li>
              </ul>
              <p style={{ margin: 'var(--space-2) 0 0 0', fontWeight: 600, color: 'var(--color-accent)' }}>
                Note: An emergency pre-import backup will be downloaded and saved automatically before proceeding.
              </p>
            </div>

            <footer className="nested-modal-footer">
              <button 
                type="button"
                className="data-btn data-btn-secondary"
                onClick={onImportCancel}
              >
                Cancel
              </button>
              <button 
                type="button"
                className="data-btn data-btn-primary"
                onClick={onImportConfirm}
              >
                Proceed & Import
              </button>
            </footer>
          </div>
        </div>
      )}

      {/* Reset Confirmation Modal */}
      {showResetModal && (
        <div className="nested-modal-overlay" onClick={onResetCancel}>
          <div className="nested-modal-container" onClick={(e) => e.stopPropagation()}>
            <header className="nested-modal-header danger">
              <AlertTriangle size={20} />
              <span>Reset Application</span>
            </header>
            
            <div className="nested-modal-body">
              <p style={{ margin: 0 }}>
                This will completely delete all your Focora settings, tasks, habits, and stats. This action cannot be undone.
              </p>
              <p style={{ margin: 'var(--space-2) 0' }}>
                To confirm, please type <strong style={{ color: 'white' }}>RESET</strong> in the box below:
              </p>
              <input 
                type="text"
                className="nested-modal-input"
                placeholder="Type RESET to confirm"
                value={resetConfirmText}
                onChange={(e) => setResetConfirmText(e.target.value)}
                autoFocus
              />
            </div>

            <footer className="nested-modal-footer">
              <button 
                type="button"
                className="data-btn data-btn-secondary"
                onClick={onResetCancel}
              >
                Cancel
              </button>
              <button 
                type="button"
                className="data-btn data-btn-danger"
                onClick={onResetConfirm}
                disabled={resetConfirmText.trim().toUpperCase() !== 'RESET'}
                style={{
                  opacity: resetConfirmText.trim().toUpperCase() === 'RESET' ? 1 : 0.5,
                  cursor: resetConfirmText.trim().toUpperCase() === 'RESET' ? 'pointer' : 'not-allowed'
                }}
              >
                Reset Everything
              </button>
            </footer>
          </div>
        </div>
      )}

      {/* Google Drive Restore Confirmation Modal */}
      {showDriveRestoreModal && (
        <div className="nested-modal-overlay" onClick={onDriveRestoreCancel}>
          <div className="nested-modal-container" onClick={(e) => e.stopPropagation()}>
            <header className="nested-modal-header">
              <Cloud size={20} color="var(--color-accent)" />
              <span>Restore from Google Drive</span>
            </header>
            
            <div className="nested-modal-body">
              <p style={{ margin: 0 }}>
                Are you sure you want to restore your data from Google Drive? This will wipe all your current local study timer settings, stats, notes, habits, tasks, and attendance.
              </p>
              <p style={{ margin: 'var(--space-2) 0 0 0', fontWeight: 600, color: 'var(--color-accent)' }}>
                Note: A local rollback backup will be automatically captured. If the restoration fails, your current data will be recovered.
              </p>
            </div>

            <footer className="nested-modal-footer">
              <button 
                type="button"
                className="data-btn data-btn-secondary"
                onClick={onDriveRestoreCancel}
              >
                Cancel
              </button>
              <button 
                type="button"
                className="data-btn data-btn-primary"
                onClick={onDriveRestoreConfirm}
              >
                Proceed & Restore
              </button>
            </footer>
          </div>
        </div>
      )}
    </>
  );
};
