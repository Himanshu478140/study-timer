import { X } from 'lucide-react';
import { StatsPanel } from './StatsPanel';
import { Sidebar } from './Sidebar';
import { DashboardModals } from './DashboardModals';
import { ThemesTab } from './tabs/ThemesTab';
import { ClockTab } from './tabs/ClockTab';
import { QuotesTab } from './tabs/QuotesTab';
import { AccountTab } from './tabs/AccountTab';
import { SupportTab } from './tabs/SupportTab';
import { AboutTab } from './tabs/AboutTab';
import { useDashboardState } from './hooks/useDashboardState';
import { useBreakSettings } from '../Modes/Break/useBreakSettings';
import { useBackup } from '../../Offlinebackup/backup/useBackup';
import { useHabits } from '../../Offlinebackup/localstorage/HabitsContext';
import { useDriveBackup } from '../../Drivebackup/useDriveBackup';
import type { DashboardProps, DashboardTab } from './types';
export type { DashboardTab };
import './styles/dashboard.css';

export const Dashboard = ({
  isOpen,
  onClose,
  wallpaper,
  onWallpaperSelect,
  timerConfig,
  setTimerConfig,
  features,
  setFeatures,
  clockFont,
  setClockFont,
  selectedQuote,
  setSelectedQuote,
  customQuotes,
  onAddQuote,
  onRemoveQuote,
  quoteFont,
  setQuoteFont,
  xp,
  level,
  streak,
  stats,
  timezone,
  setTimezone,
  initialTab = 'stats',
  customAvatar,
  setCustomAvatar,
  zenClockStyle,
  setZenClockStyle
}: DashboardProps) => {
  const { setDailyGoal } = useHabits();

  const {
    connected: driveConnected,
    syncing: driveSyncing,
    progress: driveProgress,
    error: driveError,
    metadata: driveMetadata,
    connect: connectDrive,
    disconnect: disconnectDrive,
    backup: backupDrive,
    restore: restoreDrive
  } = useDriveBackup();

  const {
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
    setShowDriveRestoreModal
  } = useDashboardState(isOpen, onClose, initialTab);

  const {
    activeBreakSettingMode,
    setActiveBreakSettingMode,
    focusError,
    setFocusError,
    breakError,
    setBreakError,
    getBreakMode,
    setBreakMode,
    getBreakDuration,
    setBreakDuration,
    getAutoBreakTime,
    isCustomPreset
  } = useBreakSettings(timerConfig, setTimerConfig);

  const {
    lastExportedTime,
    handleExportBackup,
    handleFileSelect,
    handleConfirmImport,
    handleConfirmReset
  } = useBackup(setImportData, setShowImportModal, setShowResetModal);

  if (!isOpen) return null;

  return (
    <div className={`dashboard-overlay ${isOpen ? 'open' : ''}`} onClick={onClose}>
      <div className="dashboard-container" onClick={(e) => e.stopPropagation()}>
        {/* Fixed Close Button */}
        <div className="dashboard-close" onClick={onClose}>
          <X size={20} />
        </div>

        {/* Navigation Sidebar */}
        <Sidebar
          activeTab={activeTab}
          aboutVisited={aboutVisited}
          onTabChange={setActiveTab}
          onAboutVisited={markAboutVisited}
        />

        {/* Content Area */}
        <div className="dashboard-content">
          {activeTab === 'stats' && (
            <StatsPanel
              stats={{ xp, level, streak }}
              focusStats={stats}
              setDailyGoal={setDailyGoal}
            />
          )}

          {activeTab === 'themes' && (
            <ThemesTab
              wallpaper={wallpaper}
              onWallpaperSelect={onWallpaperSelect}
            />
          )}

          {activeTab === 'clock' && (
            <ClockTab
              timerConfig={timerConfig}
              setTimerConfig={setTimerConfig}
              features={features}
              setFeatures={setFeatures}
              clockFont={clockFont}
              setClockFont={setClockFont}
              zenClockStyle={zenClockStyle}
              setZenClockStyle={setZenClockStyle}
              focusError={focusError}
              setFocusError={setFocusError}
              breakError={breakError}
              setBreakError={setBreakError}
              activeBreakSettingMode={activeBreakSettingMode}
              setActiveBreakSettingMode={setActiveBreakSettingMode}
              getBreakMode={getBreakMode}
              setBreakMode={setBreakMode}
              getBreakDuration={getBreakDuration}
              setBreakDuration={setBreakDuration}
              getAutoBreakTime={getAutoBreakTime}
              isCustomPreset={isCustomPreset}
            />
          )}

          {activeTab === 'quotes' && (
            <QuotesTab
              selectedQuote={selectedQuote}
              setSelectedQuote={setSelectedQuote}
              customQuotes={customQuotes}
              onAddQuote={onAddQuote}
              onRemoveQuote={onRemoveQuote}
              quoteFont={quoteFont}
              setQuoteFont={setQuoteFont}
            />
          )}

          {activeTab === 'account' && (
            <AccountTab
              customAvatar={customAvatar}
              setCustomAvatar={setCustomAvatar}
              lastExportedTime={lastExportedTime}
              onExportBackup={handleExportBackup}
              onFileSelect={handleFileSelect}
              driveConnected={driveConnected}
              driveSyncing={driveSyncing}
              driveProgress={driveProgress}
              driveError={driveError}
              driveMetadata={driveMetadata}
              onConnectDrive={connectDrive}
              onDisconnectDrive={disconnectDrive}
              onBackupDrive={backupDrive}
              onRestoreDriveClick={() => setShowDriveRestoreModal(true)}
              timezone={timezone}
              setTimezone={setTimezone}
              onResetClick={() => {
                setResetConfirmText('');
                setShowResetModal(true);
              }}
            />
          )}

          {activeTab === 'support' && <SupportTab />}

          {activeTab === 'about' && (
            <AboutTab
              copied={copied}
              setCopied={setCopied}
            />
          )}
        </div>
      </div>

      {/* Confirmation and Restore Dialog Modals */}
      <DashboardModals
        showImportModal={showImportModal}
        onImportCancel={() => setShowImportModal(false)}
        onImportConfirm={() => handleConfirmImport(importData)}
        showResetModal={showResetModal}
        onResetCancel={() => setShowResetModal(false)}
        onResetConfirm={() => handleConfirmReset(resetConfirmText)}
        resetConfirmText={resetConfirmText}
        setResetConfirmText={setResetConfirmText}
        showDriveRestoreModal={showDriveRestoreModal}
        onDriveRestoreCancel={() => setShowDriveRestoreModal(false)}
        onDriveRestoreConfirm={() => {
          setShowDriveRestoreModal(false);
          restoreDrive();
        }}
      />
    </div>
  );
};
export default Dashboard;
