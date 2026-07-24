import { useState, useEffect } from 'react';
import type { DashboardTab } from '../types';

/**
 * Custom hook to manage active tabs, escape key handlers, copied transitions, and nested confirmation modals.
 */
export const useDashboardState = (isOpen: boolean, onClose: () => void, initialTab: DashboardTab) => {
  const [activeTab, setActiveTab] = useState<DashboardTab>(initialTab);
  const [copied, setCopied] = useState(false);
  const [aboutVisited, setAboutVisited] = useState(() => localStorage.getItem('about_visited') === 'true');
  const [showImportModal, setShowImportModal] = useState(false);
  const [importData, setImportData] = useState<any>(null);
  const [showResetModal, setShowResetModal] = useState(false);
  const [resetConfirmText, setResetConfirmText] = useState('');
  const [showDriveRestoreModal, setShowDriveRestoreModal] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setActiveTab(initialTab);
    }
  }, [isOpen, initialTab]);

  // Close on Escape key
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, [onClose]);

  const markAboutVisited = () => {
    setAboutVisited(true);
    localStorage.setItem('about_visited', 'true');
  };

  return {
    activeTab,
    setActiveTab,
    copied,
    setCopied,
    aboutVisited,
    markAboutVisited,
    showImportModal,
    setShowImportModal,
    importData,
    setImportData,
    showResetModal,
    setShowResetModal,
    resetConfirmText,
    setResetConfirmText,
    showDriveRestoreModal,
    setShowDriveRestoreModal,
  };
};
