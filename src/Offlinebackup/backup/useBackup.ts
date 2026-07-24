import { useState } from 'react';
import { FOCORA_BACKUP_KEYS } from '../backupRegistry';

/**
 * Custom hook to manage export downloads, JSON schema validations, and full system resets.
 */
export const useBackup = (
  setImportData: (data: any) => void,
  setShowImportModal: (show: boolean) => void,
  setShowResetModal: (show: boolean) => void
) => {
  const [lastExportedTime, setLastExportedTime] = useState(() => localStorage.getItem('last-exported-at'));

  const handleExportBackup = () => {
    try {
      const backupData: Record<string, string | null> = {};
      FOCORA_BACKUP_KEYS.forEach(key => {
        backupData[key] = localStorage.getItem(key);
      });

      const backupObj = {
        app: "focora",
        version: "2.0.0",
        backupVersion: 1,
        createdAt: new Date().toISOString(),
        data: backupData
      };

      const jsonString = JSON.stringify(backupObj, null, 2);
      const blob = new Blob([jsonString], { type: 'application/json' });
      const url = URL.createObjectURL(blob);

      const link = document.createElement('a');
      const dateStr = new Date().toISOString().slice(0, 10);
      link.href = url;
      link.download = `focora-backup-${dateStr}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      const nowStr = new Date().toISOString();
      localStorage.setItem('last-exported-at', nowStr);
      setLastExportedTime(nowStr);
    } catch (e) {
      console.error('Failed to export backup', e);
      alert('Failed to export backup. Please try again.');
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const text = event.target?.result as string;
        const parsed = JSON.parse(text);

        if (!parsed || typeof parsed !== 'object') {
          throw new Error("Invalid file structure. Must be a JSON object.");
        }
        if (parsed.app !== "focora" || parsed.backupVersion !== 1) {
          throw new Error("Invalid backup file. This file does not match Focora backup format.");
        }
        if (!parsed.data || typeof parsed.data !== 'object') {
          throw new Error("Backup file has no valid data payload.");
        }

        setImportData(parsed.data);
        setShowImportModal(true);
      } catch (err: any) {
        alert(err.message || "Failed to parse backup file.");
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  const handleConfirmImport = (importData: any) => {
    if (!importData) return;

    try {
      // Create emergency local backup
      const localEmergencyData: Record<string, string | null> = {};
      FOCORA_BACKUP_KEYS.forEach(key => {
        localEmergencyData[key] = localStorage.getItem(key);
      });
      const emergencyObj = {
        app: "focora",
        version: "2.0.0",
        backupVersion: 1,
        createdAt: new Date().toISOString(),
        note: "Emergency backup automatically created before manual import",
        data: localEmergencyData
      };

      localStorage.setItem('focora-pre-import-backup', JSON.stringify(emergencyObj));

      const jsonString = JSON.stringify(emergencyObj, null, 2);
      const blob = new Blob([jsonString], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      const dateStr = new Date().toISOString().replace(/[:.]/g, '-');
      link.href = url;
      link.download = `focora-auto-backup-before-import-${dateStr}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      // Import data
      Object.keys(importData).forEach(key => {
        if (importData[key] !== null && importData[key] !== undefined) {
          localStorage.setItem(key, importData[key]);
        } else {
          localStorage.removeItem(key);
        }
      });

      setShowImportModal(false);
      window.location.reload();
    } catch (e) {
      console.error('Import failed:', e);
      alert('Import failed. Please check the console.');
    }
  };

  const handleConfirmReset = (resetConfirmText: string) => {
    if (resetConfirmText.trim().toUpperCase() !== 'RESET') {
      alert('Please type RESET exactly as requested to confirm.');
      return;
    }

    try {
      FOCORA_BACKUP_KEYS.forEach(key => {
        localStorage.removeItem(key);
      });
      localStorage.removeItem('focora-pre-import-backup');
      setShowResetModal(false);
      window.location.reload();
    } catch (e) {
      console.error('Reset failed:', e);
      alert('Reset failed. Please check the console.');
    }
  };

  return {
    lastExportedTime,
    handleExportBackup,
    handleFileSelect,
    handleConfirmImport,
    handleConfirmReset
  };
};
