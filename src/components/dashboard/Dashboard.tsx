import { useState, useEffect } from 'react';
import {
    X, GalleryHorizontalEnd, Clock, BarChart2, Quote, MessageSquare,
    Sparkles, User, Plus, Minus, BadgeInfo, Database, Shield, Download, Upload, Trash2, AlertTriangle,
    Github
} from 'lucide-react';
import { StatsPanel } from './StatsPanel';
import './dashboard.css';
import { type WallpaperConfig } from '../wallpaper/WallpaperSelector';
import { WallpaperGallery } from '../wallpaper/WallpaperGallery';
import { useHabits } from '../../hooks/useHabits';
import { FOCORA_BACKUP_KEYS } from '../../utils/backupRegistry';

interface DashboardProps {
    isOpen: boolean;
    onClose: () => void;
    wallpaper: WallpaperConfig;
    onWallpaperSelect: (config: WallpaperConfig) => void;
    // Wiring Props
    timerConfig: {
        pomodoro: number;
        flow: number;
        deep_work: number;
        shortBreak: number;
        longBreak: number;
        custom: number;
        customBreak: number;
        pomodoroBreakMode?: 'auto' | 'fixed';
        pomodoroBreakDuration?: number;
        flowBreakMode?: 'auto' | 'fixed';
        flowBreakDuration?: number;
        deepWorkBreakMode?: 'auto' | 'fixed';
        deepWorkBreakDuration?: number;
    };
    setTimerConfig: (config: any) => void;
    features: {
        ambientMode: boolean;
        sound: boolean;
        notifications: boolean;
        showQuoteInFullscreen: boolean;
        zenModeType: 'clock' | 'timer';
        zenTimeFormat: '12h' | '24h';
        homeTimeFormat: '12h' | '24h';
    };
    setFeatures: (features: any) => void;
    clockFont: string;
    setClockFont: (font: string) => void;
    selectedQuote: string;
    setSelectedQuote: (quote: string) => void;
    customQuotes: string[];
    onAddQuote: (quote: string) => void;
    onRemoveQuote: (quote: string) => void;
    quoteFont: string;
    setQuoteFont: (font: string) => void;
    // Data Props from hooks
    xp: number;
    level: number;
    streak: number;
    stats: any;
    timezone: string;
    setTimezone: (tz: string) => void;
    initialTab?: DashboardTab;
    customAvatar: string | null;
    setCustomAvatar: (avatar: string | null) => void;
    zenClockStyle: string;
    setZenClockStyle: (style: string) => void;
}

export type DashboardTab = 'themes' | 'clock' | 'stats' | 'quotes' | 'account' | 'support' | 'about';

export const Dashboard = ({
    isOpen, onClose, wallpaper, onWallpaperSelect,
    timerConfig, setTimerConfig, features, setFeatures, clockFont, setClockFont,
    selectedQuote, setSelectedQuote, xp, level, streak, stats,
    customQuotes, onAddQuote, onRemoveQuote,
    quoteFont, setQuoteFont,
    timezone, setTimezone,
    initialTab = 'stats',
    customAvatar, setCustomAvatar,
    zenClockStyle, setZenClockStyle
}: DashboardProps) => {
    const [lastExportedTime, setLastExportedTime] = useState(() => localStorage.getItem('last-exported-at'));
    const [showImportModal, setShowImportModal] = useState(false);
    const [importData, setImportData] = useState<any>(null);
    const [showResetModal, setShowResetModal] = useState(false);
    const [resetConfirmText, setResetConfirmText] = useState('');

    const TIMEZONES = [
        { id: 'auto', name: 'Automatic', subtext: 'System Default', region: 'General' },
        { id: 'UTC', name: 'UTC', subtext: 'Universal Time', region: 'General' },
        { id: 'America/Los_Angeles', name: 'Pacific Time', subtext: 'Los Angeles, Vancouver', region: 'Americas' },
        { id: 'America/Denver', name: 'Mountain Time', subtext: 'Denver, Calgary', region: 'Americas' },
        { id: 'America/Chicago', name: 'Central Time', subtext: 'Chicago, Mexico City', region: 'Americas' },
        { id: 'America/New_York', name: 'Eastern Time', subtext: 'New York, Toronto', region: 'Americas' },
        { id: 'America/Sao_Paulo', name: 'Sao Paulo', subtext: 'Brazil Time (BRT)', region: 'Americas' },
        { id: 'Europe/London', name: 'London', subtext: 'GMT/BST', region: 'Europe & Africa' },
        { id: 'Europe/Paris', name: 'Paris / Berlin', subtext: 'CET/CEST', region: 'Europe & Africa' },
        { id: 'Africa/Johannesburg', name: 'Johannesburg', subtext: 'SAST', region: 'Europe & Africa' },
        { id: 'Africa/Cairo', name: 'Cairo', subtext: 'EET', region: 'Europe & Africa' },
        { id: 'Asia/Dubai', name: 'Dubai', subtext: 'Gulf Standard (GST)', region: 'Middle East & Asia' },
        { id: 'Asia/Kolkata', name: 'Kolkata', subtext: 'India Time (IST)', region: 'Middle East & Asia' },
        { id: 'Asia/Singapore', name: 'Singapore', subtext: 'Singapore Time (SGT)', region: 'Middle East & Asia' },
        { id: 'Asia/Tokyo', name: 'Tokyo', subtext: 'Japan Time (JST)', region: 'Middle East & Asia' },
        { id: 'Asia/Seoul', name: 'Seoul', subtext: 'Korea Time (KST)', region: 'Middle East & Asia' },
        { id: 'Australia/Sydney', name: 'Sydney', subtext: 'AEST/AEDT', region: 'Oceania' },
        { id: 'Pacific/Auckland', name: 'Auckland', subtext: 'NZST/NZDT', region: 'Oceania' },
    ];

    const [activeTab, setActiveTab] = useState<DashboardTab>(initialTab);
    const [copied, setCopied] = useState(false);

    useEffect(() => {
        if (isOpen) {
            setActiveTab(initialTab);
        }
    }, [isOpen, initialTab]);

    const [aboutVisited, setAboutVisited] = useState(() => localStorage.getItem('about_visited') === 'true');

    // Support Form State
    const [supportType, setSupportType] = useState<'bug' | 'feature' | 'feedback'>('feedback');
    const [supportMessage, setSupportMessage] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error'>('idle');
    const [focusError, setFocusError] = useState(false);
    const [breakError, setBreakError] = useState(false);
    const [rateLimitActive, setRateLimitActive] = useState(false);

    const [activeBreakSettingMode, setActiveBreakSettingMode] = useState<'pomodoro' | 'flow' | 'deep_work'>('pomodoro');

    const getBreakMode = (m: 'pomodoro' | 'flow' | 'deep_work') => {
        if (m === 'pomodoro') return timerConfig.pomodoroBreakMode || 'auto';
        if (m === 'flow') return timerConfig.flowBreakMode || 'auto';
        return timerConfig.deepWorkBreakMode || 'auto';
    };

    const setBreakMode = (m: 'pomodoro' | 'flow' | 'deep_work', modeValue: 'auto' | 'fixed') => {
        if (m === 'pomodoro') {
            setTimerConfig({ ...timerConfig, pomodoroBreakMode: modeValue });
        } else if (m === 'flow') {
            setTimerConfig({ ...timerConfig, flowBreakMode: modeValue });
        } else {
            setTimerConfig({ ...timerConfig, deepWorkBreakMode: modeValue });
        }
    };

    const getBreakDuration = (m: 'pomodoro' | 'flow' | 'deep_work') => {
        if (m === 'pomodoro') return timerConfig.pomodoroBreakDuration !== undefined ? timerConfig.pomodoroBreakDuration : 5;
        if (m === 'flow') return timerConfig.flowBreakDuration !== undefined ? timerConfig.flowBreakDuration : 17;
        return timerConfig.deepWorkBreakDuration !== undefined ? timerConfig.deepWorkBreakDuration : 15;
    };

    const setBreakDuration = (m: 'pomodoro' | 'flow' | 'deep_work', durationValue: number) => {
        if (m === 'pomodoro') {
            setTimerConfig({ ...timerConfig, pomodoroBreakDuration: durationValue });
        } else if (m === 'flow') {
            setTimerConfig({ ...timerConfig, flowBreakDuration: durationValue });
        } else {
            setTimerConfig({ ...timerConfig, deepWorkBreakDuration: durationValue });
        }
    };

    const getAutoBreakTime = (m: 'pomodoro' | 'flow' | 'deep_work') => {
        if (m === 'pomodoro') return timerConfig.shortBreak;
        if (m === 'flow') return 17;
        return timerConfig.longBreak;
    };

    const isCustomPreset = (m: 'pomodoro' | 'flow' | 'deep_work') => {
        const dur = getBreakDuration(m);
        return dur === 5 || dur === 10 || dur === 15;
    };

    // Rate limit check on mount or when support tab opens
    useEffect(() => {
        const lastSubmission = localStorage.getItem('last_support_submission');
        if (lastSubmission) {
            const timePassed = Date.now() - parseInt(lastSubmission);
            if (timePassed < 24 * 60 * 60 * 1000) {
                setRateLimitActive(true);
            }
        }
    }, [activeTab]);

    const handleSubmitSupport = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!supportMessage.trim()) return;

        setIsSubmitting(true);
        setSubmitStatus('idle');

        try {
            // Simulate network latency for submission
            await new Promise(resolve => setTimeout(resolve, 800));

            const ticket = {
                type: supportType,
                message: supportMessage.trim(),
                createdAt: new Date().toISOString(),
                userAgent: navigator.userAgent,
                platform: navigator.platform
            };
            const existing = localStorage.getItem('local-support-tickets');
            const tickets = existing ? JSON.parse(existing) : [];
            tickets.push(ticket);
            localStorage.setItem('local-support-tickets', JSON.stringify(tickets));

            // Update rate limit only after successful submission
            localStorage.setItem('last_support_submission', Date.now().toString());
            setRateLimitActive(true);

            setSubmitStatus('success');
            setSupportMessage('');
        } catch (error) {
            console.error('Error submitting support ticket:', error);
            setSubmitStatus('error');
        } finally {
            setIsSubmitting(false);
        }
    };
    const [newQuoteText, setNewQuoteText] = useState('');
    const { setDailyGoal } = useHabits();

    // Close on Escape key
    useEffect(() => {
        const handleEsc = (e: KeyboardEvent) => {
            if (e.key === 'Escape') onClose();
        };
        window.addEventListener('keydown', handleEsc);
        return () => window.removeEventListener('keydown', handleEsc);
    }, [onClose]);

    const getFocoraDataSize = () => {
        let totalBytes = 0;
        FOCORA_BACKUP_KEYS.forEach(key => {
            const val = localStorage.getItem(key);
            if (val) {
                totalBytes += key.length + val.length;
            }
        });
        if (totalBytes < 1024) {
            return `${totalBytes} B`;
        }
        return `${(totalBytes / 1024).toFixed(2)} KB`;
    };

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

    const handleConfirmImport = () => {
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

    const handleConfirmReset = () => {
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

    if (!isOpen) return null;

    return (
        <div className={`dashboard-overlay ${isOpen ? 'open' : ''}`} onClick={onClose}>
            <div className="dashboard-container" onClick={(e) => e.stopPropagation()}>
                {/* Fixed Close Button */}
                <div className="dashboard-close" onClick={onClose}>
                    <X size={20} />
                </div>

                {/* Sidebar */}
                <div className="dashboard-sidebar">
                    <SidebarItem
                        icon={GalleryHorizontalEnd}
                        label="Themes"
                        active={activeTab === 'themes'}
                        onClick={() => setActiveTab('themes')}
                    />
                    {/* Placeholder items */}
                    <SidebarItem icon={Clock} label="Clock" active={activeTab === 'clock'} onClick={() => setActiveTab('clock')} />
                    <SidebarItem icon={BarChart2} label="Stats" active={activeTab === 'stats'} onClick={() => setActiveTab('stats')} />
                    <SidebarItem icon={Quote} label="Quotes" active={activeTab === 'quotes'} onClick={() => setActiveTab('quotes')} />
                    <SidebarItem icon={Database} label="Account" active={activeTab === 'account'} onClick={() => setActiveTab('account')} />


                    <SidebarItem
                        icon={BadgeInfo}
                        label="About"
                        active={activeTab === 'about'}
                        glow={!aboutVisited}
                        onClick={() => {
                            setActiveTab('about');
                            setAboutVisited(true);
                            localStorage.setItem('about_visited', 'true');
                        }}
                    />
                    <SidebarItem icon={MessageSquare} label="Support" active={activeTab === 'support'} onClick={() => setActiveTab('support')} />


                </div>

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
                        <div className="dashboard-section">
                            <WallpaperGallery currentId={wallpaper.id} wallpaper={wallpaper} onSelect={onWallpaperSelect} />
                        </div>
                    )}

                    {activeTab === 'clock' && (
                        <div className="dashboard-section">
                            <h2>Timer Settings</h2>
                            <p style={{ color: 'rgba(255,255,255,0.7)', marginBottom: '1.5rem' }}>Customize your focus routine durations.</p>

                            <div className="setting-group">
                                <label>Custom Focus Duration</label>
                                <div className="setting-options">
                                    {[15, 25, 45, 60, 90].map(m => (
                                        <button
                                            key={m}
                                            className={`setting-btn ${timerConfig.custom === m ? 'active' : ''}`}
                                            onClick={() => setTimerConfig({ ...timerConfig, custom: m })}
                                        >
                                            {m}m
                                        </button>
                                    ))}
                                </div>
                                <div className={`smart-adjuster ${focusError ? 'error' : ''}`}>
                                    <div className="adjuster-fill" style={{ width: `${Math.min((timerConfig.custom / 120) * 100, 100)}%` }}></div>
                                    <button
                                        className="adjuster-btn"
                                        onClick={() => {
                                            if (timerConfig.custom > 1) {
                                                setTimerConfig({ ...timerConfig, custom: timerConfig.custom - 1 });
                                            } else {
                                                setFocusError(true);
                                                setTimeout(() => setFocusError(false), 400);
                                            }
                                        }}
                                    >
                                        <Minus size={16} />
                                    </button>
                                    <div className="adjuster-input-container">
                                        <input
                                            type="number"
                                            className="adjuster-input"
                                            value={timerConfig.custom || ''}
                                            onChange={(e) => {
                                                const val = parseInt(e.target.value);
                                                if (val > 1440) {
                                                    setFocusError(true);
                                                    setTimeout(() => setFocusError(false), 400);
                                                    return;
                                                }
                                                if (!isNaN(val) && val >= 0) {
                                                    setTimerConfig({ ...timerConfig, custom: val });
                                                } else if (e.target.value === '') {
                                                    setTimerConfig({ ...timerConfig, custom: 0 });
                                                }
                                            }}
                                            onBlur={() => {
                                                if (!timerConfig.custom || timerConfig.custom < 1) setTimerConfig({ ...timerConfig, custom: 1 });
                                            }}
                                        />
                                        <span className="adjuster-unit">min</span>
                                    </div>
                                    <button
                                        className="adjuster-btn"
                                        onClick={() => {
                                            if (timerConfig.custom < 1440) {
                                                setTimerConfig({ ...timerConfig, custom: timerConfig.custom + 1 });
                                            } else {
                                                setFocusError(true);
                                                setTimeout(() => setFocusError(false), 400);
                                            }
                                        }}
                                    >
                                        <Plus size={16} />
                                    </button>
                                </div>
                            </div>

                            <div className="setting-group">
                                <label>Custom Break Duration</label>
                                <div className="setting-options">
                                    {[1, 5, 10, 15, 20].map(m => (
                                        <button
                                            key={m}
                                            className={`setting-btn ${timerConfig.customBreak === m ? 'active' : ''}`}
                                            onClick={() => setTimerConfig({ ...timerConfig, customBreak: m })}
                                        >
                                            {m}m
                                        </button>
                                    ))}
                                </div>
                                <div className={`smart-adjuster ${breakError ? 'error' : ''}`}>
                                    <div className="adjuster-fill" style={{ width: `${Math.min((timerConfig.customBreak / 60) * 100, 100)}%` }}></div>
                                    <button
                                        className="adjuster-btn"
                                        onClick={() => {
                                            if (timerConfig.customBreak > 1) {
                                                setTimerConfig({ ...timerConfig, customBreak: timerConfig.customBreak - 1 });
                                            } else {
                                                setBreakError(true);
                                                setTimeout(() => setBreakError(false), 400);
                                            }
                                        }}
                                    >
                                        <Minus size={16} />
                                    </button>
                                    <div className="adjuster-input-container">
                                        <input
                                            type="number"
                                            className="adjuster-input"
                                            value={timerConfig.customBreak || ''}
                                            onChange={(e) => {
                                                const val = parseInt(e.target.value);
                                                if (val > 480) {
                                                    setBreakError(true);
                                                    setTimeout(() => setBreakError(false), 400);
                                                    return;
                                                }
                                                if (!isNaN(val) && val >= 0) {
                                                    setTimerConfig({ ...timerConfig, customBreak: val });
                                                } else if (e.target.value === '') {
                                                    setTimerConfig({ ...timerConfig, customBreak: 0 });
                                                }
                                            }}
                                            onBlur={() => {
                                                if (!timerConfig.customBreak || timerConfig.customBreak < 1) setTimerConfig({ ...timerConfig, customBreak: 1 });
                                            }}
                                        />
                                        <span className="adjuster-unit">min</span>
                                    </div>
                                    <button
                                        className="adjuster-btn"
                                        onClick={() => {
                                            if (timerConfig.customBreak < 480) {
                                                setTimerConfig({ ...timerConfig, customBreak: timerConfig.customBreak + 1 });
                                            } else {
                                                setBreakError(true);
                                                setTimeout(() => setBreakError(false), 400);
                                            }
                                        }}
                                    >
                                        <Plus size={16} />
                                    </button>
                                </div>
                            </div>
                            <div className="setting-group" style={{ marginTop: '3rem' }}>
                                <label>Break Duration Settings</label>
                                <p style={{ color: 'rgba(255,255,255,0.7)', marginBottom: '1.25rem', fontSize: '0.85rem' }}>
                                    Customize individual break durations for core focus routines.
                                </p>

                                <div className="setting-options" style={{ background: 'rgba(18, 18, 22, 0.8)', border: '1px solid rgba(255, 255, 255, 0.08)', padding: '4px', borderRadius: '0.6rem', width: 'fit-content', marginBottom: '1.25rem', display: 'flex' }}>
                                    {(['pomodoro', 'flow', 'deep_work'] as const).map(m => (
                                        <button
                                            key={m}
                                            type="button"
                                            className={`setting-btn ${activeBreakSettingMode === m ? 'active' : ''}`}
                                            onClick={() => setActiveBreakSettingMode(m)}
                                            style={{ fontSize: '0.8rem', padding: '0.4rem 1rem', borderRadius: '0.4rem', border: 'none', background: activeBreakSettingMode === m ? 'var(--color-accent)' : 'transparent', boxShadow: activeBreakSettingMode === m ? '0 4px 12px rgba(var(--color-accent-rgb), 0.3)' : 'none' }}
                                        >
                                            {m === 'pomodoro' ? 'Pomodoro' : m === 'flow' ? '52/17' : 'Deep Work'}
                                        </button>
                                    ))}
                                </div>

                                <div className="feature-card" style={{ flexDirection: 'column', alignItems: 'stretch', gap: '1.25rem', background: 'rgba(18, 18, 22, 0.85)', border: '1px solid rgba(255, 255, 255, 0.08)', padding: '1.25rem', borderRadius: '1.25rem' }}>
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                                        {/* Option 1: Auto */}
                                        <label style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem', cursor: 'pointer', fontSize: '0.9rem', color: 'white' }}>
                                            <input
                                                type="radio"
                                                name={`break-mode-${activeBreakSettingMode}`}
                                                checked={getBreakMode(activeBreakSettingMode) === 'auto'}
                                                onChange={() => setBreakMode(activeBreakSettingMode, 'auto')}
                                                style={{ accentColor: 'var(--color-accent)', marginTop: '3px' }}
                                            />
                                            <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                                                <span style={{ fontWeight: 600 }}>Auto <span style={{ color: 'var(--color-accent)', fontSize: '0.75rem', fontWeight: 600 }}>(recommended)</span></span>
                                                <span style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.4)' }}>
                                                    Current fixed break: {getAutoBreakTime(activeBreakSettingMode)} min
                                                </span>
                                            </div>
                                        </label>

                                        {/* Option 2: Fixed */}
                                        <label style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', cursor: 'pointer', fontSize: '0.9rem', color: 'white' }}>
                                            <input
                                                type="radio"
                                                name={`break-mode-${activeBreakSettingMode}`}
                                                checked={getBreakMode(activeBreakSettingMode) === 'fixed'}
                                                onChange={() => setBreakMode(activeBreakSettingMode, 'fixed')}
                                                style={{ accentColor: 'var(--color-accent)' }}
                                            />
                                            <span style={{ fontWeight: 600 }}>Fixed Duration</span>
                                        </label>
                                    </div>

                                    {/* If Fixed is selected, show duration selectors */}
                                    {getBreakMode(activeBreakSettingMode) === 'fixed' && (
                                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', paddingLeft: '1.5rem', borderLeft: '2px solid rgba(var(--color-accent-rgb), 0.2)', animation: 'dashboardFadeIn 0.2s ease-out' }}>
                                            <div className="setting-options" style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginBottom: 0 }}>
                                                {[5, 10, 15].map(min => (
                                                    <button
                                                        key={min}
                                                        type="button"
                                                        className={`setting-btn ${getBreakDuration(activeBreakSettingMode) === min ? 'active' : ''}`}
                                                        onClick={() => setBreakDuration(activeBreakSettingMode, min)}
                                                        style={{ padding: '0.4rem 0.8rem', fontSize: '0.8rem', borderRadius: '0.375rem' }}
                                                    >
                                                        {min} min
                                                    </button>
                                                ))}

                                                {/* Custom input */}
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', background: 'rgba(18, 18, 22, 0.8)', border: '1px solid rgba(255, 255, 255, 0.08)', borderRadius: '0.375rem', padding: '0.2rem 0.5rem' }}>
                                                    <span style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.5)' }}>Custom:</span>
                                                    <input
                                                        className="no-spinner"
                                                        type="number"
                                                        min="1"
                                                        max="180"
                                                        value={isCustomPreset(activeBreakSettingMode) ? '' : getBreakDuration(activeBreakSettingMode)}
                                                        placeholder={isCustomPreset(activeBreakSettingMode) ? '17' : getBreakDuration(activeBreakSettingMode).toString()}
                                                        onChange={(e) => {
                                                            const val = parseInt(e.target.value);
                                                            if (!isNaN(val) && val > 0 && val <= 180) {
                                                                setBreakDuration(activeBreakSettingMode, val);
                                                            }
                                                        }}
                                                        style={{
                                                            background: 'transparent',
                                                            border: 'none',
                                                            color: 'white',
                                                            width: '32px',
                                                            textAlign: 'center',
                                                            fontSize: '0.8rem',
                                                            fontWeight: 600,
                                                            outline: 'none',
                                                            padding: 0
                                                        }}
                                                    />
                                                    <span style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.5)' }}>min</span>
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>

                            <div style={{ marginTop: '3rem' }}>
                                <h3>Zen Clock</h3>
                                <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.85rem', marginBottom: '1rem' }}>
                                    Experience time with smooth animations and depth.
                                </p>
                                <div className="font-grid" style={{ marginBottom: '2.5rem' }}>
                                    {[
                                        { id: 'flip', name: 'Flip Clock', class: 'font-mono' },
                                        { id: 'simple-flip', name: 'Simple Flip', class: 'font-mono' },
                                    ].map(f => (
                                        <div
                                            key={f.id}
                                            className={`font-preview-card ${zenClockStyle === f.id ? 'active' : ''}`}
                                            onClick={() => setZenClockStyle(f.id)}
                                        >
                                            <div className={`font-sample ${f.class}`}>9:24</div>
                                            <span className="font-name">{f.name}</span>
                                        </div>
                                    ))}
                                </div>

                                <div className="feature-card feature-row-card" style={{ marginTop: '1rem', background: 'rgba(18, 18, 22, 0.8)', border: '1px solid rgba(255, 255, 255, 0.08)', padding: '1rem', borderRadius: '1rem' }}>
                                    <div className="feature-info">
                                        <h3>Zen Mode</h3>
                                        <p>Choose what to display in Zen Mode.</p>
                                    </div>
                                    <div className="setting-pill">
                                        <button
                                            className={`setting-btn ${features.zenModeType === 'clock' ? 'active' : ''}`}
                                            onClick={() => setFeatures({ ...features, zenModeType: 'clock' })}
                                        >
                                            Clock
                                        </button>
                                        <button
                                            className={`setting-btn ${features.zenModeType === 'timer' ? 'active' : ''}`}
                                            onClick={() => setFeatures({ ...features, zenModeType: 'timer' })}
                                        >
                                            Timer
                                        </button>
                                    </div>
                                </div>


                                <div className="feature-card feature-row-card" style={{ marginTop: '0.75rem', background: 'rgba(18, 18, 22, 0.8)', border: '1px solid rgba(255, 255, 255, 0.08)', padding: '1rem', borderRadius: '1rem' }}>
                                    <div className="feature-info">
                                        <h3>Zen Time Format</h3>
                                        <p>Switch between 12-hour and 24-hour display.</p>
                                    </div>
                                    <div className="setting-pill">
                                        <button
                                            className={`setting-btn ${features.zenTimeFormat === '12h' ? 'active' : ''}`}
                                            onClick={() => setFeatures({ ...features, zenTimeFormat: '12h' })}
                                        >
                                            12H
                                        </button>
                                        <button
                                            className={`setting-btn ${features.zenTimeFormat === '24h' ? 'active' : ''}`}
                                            onClick={() => setFeatures({ ...features, zenTimeFormat: '24h' })}
                                        >
                                            24H
                                        </button>
                                    </div>
                                </div>

                                <div style={{ marginTop: '3rem' }}>
                                    <h3>Relax</h3>
                                    <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.85rem', marginBottom: '1rem' }}>
                                        Personalize your landing experience.
                                    </p>
                                    <div className="feature-card feature-row-card" style={{ background: 'rgba(18, 18, 22, 0.8)', border: '1px solid rgba(255, 255, 255, 0.08)', padding: '1rem', borderRadius: '1rem' }}>
                                        <div className="feature-info">
                                            <h3>Time Format</h3>
                                            <p>Switch between 12-hour and 24-hour display on the Relax screen.</p>
                                        </div>
                                        <div className="setting-pill">
                                            <button
                                                className={`setting-btn ${features.homeTimeFormat === '12h' ? 'active' : ''}`}
                                                onClick={() => setFeatures({ ...features, homeTimeFormat: '12h' })}
                                            >
                                                12H
                                            </button>
                                            <button
                                                className={`setting-btn ${features.homeTimeFormat === '24h' ? 'active' : ''}`}
                                                onClick={() => setFeatures({ ...features, homeTimeFormat: '24h' })}
                                            >
                                                24H
                                            </button>
                                        </div>
                                    </div>
                                </div>

                                <h3>Standard Typography</h3>
                                <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.85rem', marginBottom: '1rem' }}>
                                    Classic fonts for a clean and focused look.
                                </p>
                                <div className="font-grid">
                                    {[
                                        { id: 'default', name: 'Default', class: 'font-default' },
                                        { id: 'minimal', name: 'Minimal', class: 'font-minimal' },
                                        { id: 'minimal-light', name: 'Minimal Light', class: 'font-minimal-light' },
                                        { id: 'serif', name: 'Serif', class: 'font-serif' },
                                        { id: 'serif-condensed', name: 'Serif Condensed', class: 'font-serif-condensed' },
                                        { id: 'handwritten', name: 'Handwritten', class: 'font-handwritten' },
                                        { id: 'mono', name: 'Classic Mono', class: 'font-mono' },
                                        { id: 'rounded', name: 'Soft Rounded', class: 'font-rounded' },
                                        { id: 'display', name: 'Display', class: 'font-display' },
                                        { id: 'retro', name: 'Retro', class: 'font-retro' },
                                    ].map(f => (
                                        <div
                                            key={f.id}
                                            className={`font-preview-card ${clockFont === f.id ? 'active' : ''}`}
                                            onClick={() => setClockFont(f.id)}
                                        >
                                            <div className={`font-sample ${f.class}`}>9:24</div>
                                            <span className="font-name">{f.name}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    )}



                    {activeTab === 'quotes' && (
                        <div className="dashboard-section">
                            <h2>Inspiration</h2>
                            <p style={{ color: 'rgba(255,255,255,0.7)', marginBottom: '1.5rem' }}>Choose or add a quote that resonates with you today.</p>

                            {/* Quote Typography Selection */}
                            <div className="setting-group" style={{ marginBottom: '2rem' }}>
                                <label style={{ display: 'block', marginBottom: '1rem', color: 'rgba(255,255,255,0.7)', fontSize: '0.8rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                                    Quote Typography
                                </label>
                                <div className="font-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(130px, 1fr))', gap: '0.8rem' }}>
                                    {[
                                        { id: 'serif', name: 'Elegant Serif', class: 'font-serif' },
                                        { id: 'minimal-light', name: 'Modern Sans', class: 'font-minimal-light' },
                                        { id: 'handwritten', name: 'Handwritten', class: 'font-handwritten' },
                                        { id: 'mono', name: 'Classic Mono', class: 'font-mono' },
                                        { id: 'rounded', name: 'Soft Rounded', class: 'font-rounded' },
                                        { id: 'serif-condensed', name: 'Condensed', class: 'font-serif-condensed' },
                                    ].map(f => (
                                        <div
                                            key={f.id}
                                            className={`font-preview-card ${quoteFont === f.id ? 'active' : ''}`}
                                            onClick={() => setQuoteFont(f.id)}
                                            style={{
                                                padding: '1rem',
                                                background: quoteFont === f.id ? 'rgba(var(--color-accent-rgb), 0.25)' : 'rgba(18, 18, 22, 0.85)',
                                                border: `1px solid ${quoteFont === f.id ? 'var(--color-accent)' : 'rgba(255,255,255,0.08)'}`,
                                                borderRadius: '0.8rem',
                                                cursor: 'pointer',
                                                textAlign: 'center',
                                                transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)'
                                            }}
                                        >
                                            <div style={{ fontSize: '1.2rem', marginBottom: '0.4rem', opacity: quoteFont === f.id ? 1 : 0.7 }} className={f.class}>Aa</div>
                                            <span style={{ fontSize: '0.7rem', opacity: quoteFont === f.id ? 1 : 0.5 }}>{f.name}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Add Custom Quote Input */}
                            <div className="custom-quote-input-wrapper" style={{ marginBottom: '2rem' }}>
                                <div style={{ display: 'flex', gap: '0.5rem' }}>
                                    <input
                                        type="text"
                                        placeholder="Add your own inspiration..."
                                        value={newQuoteText}
                                        onChange={(e) => setNewQuoteText(e.target.value)}
                                        onKeyDown={(e) => {
                                            if (e.key === 'Enter' && newQuoteText.trim()) {
                                                onAddQuote(newQuoteText.trim());
                                                setNewQuoteText('');
                                            }
                                        }}
                                        style={{
                                            flex: 1,
                                            padding: '0.8rem 1.2rem',
                                            borderRadius: '0.8rem',
                                            background: 'rgba(18, 18, 22, 0.8)',
                                            border: '1px solid rgba(255,255,255,0.12)',
                                            color: 'white',
                                            fontSize: '0.9rem'
                                        }}
                                    />
                                    <button
                                        onClick={() => {
                                            if (newQuoteText.trim()) {
                                                onAddQuote(newQuoteText.trim());
                                                setNewQuoteText('');
                                            }
                                        }}
                                        className="interactive-press"
                                        style={{
                                            padding: '0 1.2rem',
                                            borderRadius: '0.8rem',
                                            background: 'var(--color-accent)',
                                            color: 'white',
                                            border: 'none',
                                            fontWeight: 600,
                                            cursor: 'pointer'
                                        }}
                                    >
                                        Add
                                    </button>
                                </div>
                            </div>

                            <div className="quote-grid" style={{ display: 'grid', gap: '1rem' }}>
                                {/* Preset Quotes */}
                                {[
                                    "The only way to do great work is to love what you do.",
                                    "Don't count the days, make the days count.",
                                    "Your time is limited, don't waste it living someone else's life.",
                                    "Focus on being productive instead of busy.",
                                    "The secret of getting ahead is getting started.",
                                    "Deep work is the superpower of the 21st century.",
                                    "Quality is not an act, it is a habit.",
                                    "Do what you can, with what you have, where you are."
                                ].map(q => (
                                    <div
                                        key={q}
                                        className={`quote-selection-card preset ${selectedQuote === q ? 'active' : ''}`}
                                        onClick={() => setSelectedQuote(q)}
                                        style={{
                                            padding: '1.5rem',
                                            background: selectedQuote === q ? 'rgba(var(--color-accent-rgb), 0.25)' : 'rgba(18, 18, 22, 0.85)',
                                            border: `1px solid ${selectedQuote === q ? 'var(--color-accent)' : 'rgba(255,255,255,0.08)'}`,
                                            borderRadius: '1rem',
                                            cursor: 'pointer',
                                            transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
                                            position: 'relative'
                                        }}
                                    >
                                        <p style={{
                                            margin: 0,
                                            fontSize: '1rem',
                                            fontStyle: 'italic',
                                            color: selectedQuote === q ? 'white' : 'rgba(255,255,255,0.7)',
                                            fontWeight: selectedQuote === q ? 600 : 400
                                        }}>
                                            "{q}"
                                        </p>
                                        {selectedQuote === q && (
                                            <div style={{
                                                position: 'absolute',
                                                top: '0.5rem',
                                                right: '0.5rem',
                                                background: 'var(--color-accent)',
                                                padding: '2px 8px',
                                                borderRadius: '1rem',
                                                fontSize: '0.6rem',
                                                fontWeight: 800,
                                                textTransform: 'uppercase'
                                            }}>Active</div>
                                        )}
                                    </div>
                                ))}

                                {/* Custom Quotes */}
                                {customQuotes.map(q => (
                                    <div
                                        key={q}
                                        className={`quote-selection-card custom ${selectedQuote === q ? 'active' : ''}`}
                                        onClick={() => setSelectedQuote(q)}
                                        style={{
                                            padding: '1.5rem',
                                            background: selectedQuote === q ? 'rgba(var(--color-accent-rgb), 0.25)' : 'rgba(18, 18, 22, 0.85)',
                                            border: `1px solid ${selectedQuote === q ? 'var(--color-accent)' : 'rgba(255,255,255,0.08)'}`,
                                            borderRadius: '1rem',
                                            cursor: 'pointer',
                                            transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
                                            position: 'relative'
                                        }}
                                    >
                                        <p style={{
                                            margin: 0,
                                            fontSize: '1rem',
                                            fontStyle: 'italic',
                                            color: selectedQuote === q ? 'white' : 'rgba(255,255,255,0.7)',
                                            fontWeight: selectedQuote === q ? 600 : 400,
                                            paddingRight: '2rem'
                                        }}>
                                            "{q}"
                                        </p>

                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                onRemoveQuote(q);
                                            }}
                                            style={{
                                                position: 'absolute',
                                                right: '1rem',
                                                top: '50%',
                                                transform: 'translateY(-50%)',
                                                background: 'rgba(255,50,50,0.15)',
                                                color: '#ff6b6b',
                                                border: 'none',
                                                padding: '0.4rem',
                                                borderRadius: '0.4rem',
                                                cursor: 'pointer',
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center'
                                            }}
                                            title="Delete Quote"
                                        >
                                            <X size={14} />
                                        </button>

                                        {selectedQuote === q && (
                                            <div style={{
                                                position: 'absolute',
                                                top: '0.5rem',
                                                right: '3rem',
                                                background: 'var(--color-accent)',
                                                padding: '2px 8px',
                                                borderRadius: '1rem',
                                                fontSize: '0.6rem',
                                                fontWeight: 800,
                                                textTransform: 'uppercase'
                                            }}>Active</div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {activeTab === 'account' && (
                        <div className="dashboard-section animate-fade-in" style={{ maxWidth: '800px', margin: '0 auto' }}>
                            <h2 className="flex-center" style={{ justifyContent: 'flex-start', gap: '0.5rem' }}>
                                <Database size={20} /> Data & Profile
                            </h2>
                            <p style={{ marginBottom: '2rem', color: 'rgba(255,255,255,0.7)', fontSize: '0.9rem' }}>
                                Manage your profile, timezone settings, and offline backups.
                            </p>

                            {/* Premium Custom Avatar Selector */}
                            <div className="setting-card" style={{ padding: '2rem', background: 'rgba(18, 18, 22, 0.85)', borderRadius: '1rem', marginBottom: '2rem', border: '1px solid rgba(255, 255, 255, 0.08)' }}>
                                <h3 style={{ fontSize: '1rem', fontWeight: 600, marginBottom: '1.2rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                    <Sparkles size={16} color="var(--color-accent)" /> Profile Avatar
                                </h3>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', flexWrap: 'wrap' }}>
                                    <div style={{
                                        width: 72,
                                        height: 72,
                                        borderRadius: '1.125rem',
                                        background: 'rgba(0,0,0,0.4)',
                                        border: '2px solid var(--color-accent)',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        overflow: 'hidden',
                                        position: 'relative'
                                    }}>
                                        {customAvatar ? (
                                            <img src={customAvatar} alt="Avatar Preview" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                        ) : (
                                            <User size={32} style={{ color: 'rgba(255,255,255,0.3)' }} />
                                        )}
                                    </div>
                                    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '0.5rem', minWidth: '200px' }}>
                                        <div style={{ display: 'flex', gap: '0.5rem' }}>
                                            <button
                                                className="interactive-press"
                                                onClick={() => document.getElementById('avatar-file-input')?.click()}
                                                style={{
                                                    padding: '0.5rem 1rem',
                                                    borderRadius: '0.6rem',
                                                    background: 'var(--color-accent)',
                                                    color: 'white',
                                                    border: 'none',
                                                    fontWeight: 600,
                                                    fontSize: '0.8rem',
                                                    cursor: 'pointer'
                                                }}
                                            >
                                                Choose Image
                                            </button>
                                            {customAvatar && (
                                                <button
                                                    className="interactive-press"
                                                    onClick={() => setCustomAvatar(null)}
                                                    style={{
                                                        padding: '0.5rem 1rem',
                                                        borderRadius: '0.6rem',
                                                        background: 'rgba(255, 75, 75, 0.1)',
                                                        color: '#ff4b4b',
                                                        border: '1px solid rgba(255, 75, 75, 0.2)',
                                                        fontWeight: 600,
                                                        fontSize: '0.8rem',
                                                        cursor: 'pointer'
                                                    }}
                                                >
                                                    Remove
                                                </button>
                                            )}
                                        </div>
                                        <p style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.4)', margin: 0, lineHeight: 1.4 }}>
                                            Upload a custom square avatar image (.png, .jpg, .webp). Max size 2MB.
                                        </p>
                                        <input
                                            id="avatar-file-input"
                                            type="file"
                                            accept="image/*"
                                            onChange={(e) => {
                                                const file = e.target.files?.[0];
                                                if (file) {
                                                    if (file.size > 2 * 1024 * 1024) {
                                                        alert("Image size must be less than 2MB.");
                                                        return;
                                                    }
                                                    const reader = new FileReader();
                                                    reader.onload = (event) => {
                                                        if (event.target?.result) {
                                                            setCustomAvatar(event.target.result as string);
                                                        }
                                                    };
                                                    reader.readAsDataURL(file);
                                                }
                                            }}
                                            style={{ display: 'none' }}
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Offline-First Data Management Section */}
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
                                            onClick={handleExportBackup}
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
                                            onChange={handleFileSelect}
                                            style={{ display: 'none' }}
                                        />
                                    </div>
                                </div>

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
                                        className="data-btn data-btn-danger"
                                        onClick={() => {
                                            setResetConfirmText('');
                                            setShowResetModal(true);
                                        }}
                                    >
                                        <Trash2 size={16} /> Reset App
                                    </button>
                                </div>
                            </section>

                            {/* Timezone Selection UI */}
                            <div className="timezone-settings-container" style={{ marginTop: '2rem' }}>
                                <h4 className="settings-subtitle" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.9rem', color: 'white', marginBottom: '1rem', fontWeight: 600 }}>
                                    <Clock size={14} /> Timezone Settings
                                </h4>

                                <div className="timezone-list-wrapper">
                                    {['General', 'Americas', 'Europe & Africa', 'Middle East & Asia', 'Oceania'].map(region => (
                                        <div key={region} className="timezone-region-group">
                                            <div className="region-header">{region}</div>
                                            <div className="timezone-grid">
                                                {TIMEZONES.filter(tz => tz.region === region).map(tz => (
                                                    <div
                                                        key={tz.id}
                                                        className={`timezone-card ${timezone === tz.id ? 'active' : ''}`}
                                                        onClick={() => setTimezone(tz.id)}
                                                    >
                                                        <div className="tz-info">
                                                            <span className="tz-name">{tz.name}</span>
                                                            <span className="tz-subtext">{tz.subtext}</span>
                                                        </div>
                                                        {timezone === tz.id && <div className="tz-active-dot" />}
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    )}



                    {activeTab === 'support' && (
                        <div className="dashboard-section animate-fade-in" style={{ maxWidth: '800px', margin: '0 auto' }}>
                            <h2 style={{ marginBottom: '0.5rem' }}>Help & Support</h2>
                            <p style={{ marginBottom: '2rem', color: 'rgba(255,255,255,0.6)' }}>
                                Have a question, feedback, or found a bug? Submit the form below or email us directly at <a href="mailto:feedbackhimanshu065@gamil.com" style={{ color: 'var(--color-accent)', textDecoration: 'none' }}>feedbackhimanshu065@gamil.com</a>
                            </p>

                            {/* Support Form Section */}
                            <div className="support-form-container-new" style={{ padding: '2rem', borderRadius: '1.5rem', background: 'rgba(18, 18, 22, 0.85)', border: '1px solid rgba(255,255,255,0.08)' }}>
                                <form onSubmit={handleSubmitSupport} className="feedback-form">
                                    <div className="form-group">
                                        <label>Query Type</label>
                                        <div className="type-selector">
                                            {(['feedback', 'bug', 'feature'] as const).map(type => (
                                                <button
                                                    key={type}
                                                    type="button"
                                                    className={`type-btn ${supportType === type ? 'active' : ''}`}
                                                    onClick={() => setSupportType(type)}
                                                >
                                                    {type.charAt(0).toUpperCase() + type.slice(1)}
                                                </button>
                                            ))}
                                        </div>
                                    </div>

                                    <div className="form-group">
                                        <label>Message</label>
                                        <textarea
                                            placeholder="How can we help?"
                                            value={supportMessage}
                                            onChange={(e) => setSupportMessage(e.target.value)}
                                            maxLength={1010} // Padding for counter
                                        ></textarea>
                                        <div style={{
                                            display: 'flex',
                                            justifyContent: 'flex-end',
                                            marginTop: '6px',
                                            fontSize: '0.7rem',
                                            color: supportMessage.trim().length > 1000 ? '#ef4444' : 'rgba(255,255,255,0.3)',
                                            fontWeight: 600,
                                            transition: 'color 0.2s'
                                        }}>
                                            {supportMessage.trim().length} / 1000
                                        </div>
                                    </div>

                                    {rateLimitActive ? (
                                        <div style={{
                                            padding: '1rem',
                                            background: 'rgba(18, 18, 22, 0.6)',
                                            border: '1px solid rgba(255, 255, 255, 0.08)',
                                            borderRadius: '0.75rem',
                                            color: 'rgba(255,255,255,0.5)',
                                            fontSize: '0.85rem',
                                            textAlign: 'center',
                                            lineHeight: '1.5'
                                        }}>
                                            You can send feedback once every 24 hours. <br />Thanks for understanding.
                                        </div>
                                    ) : (
                                        <button
                                            type="submit"
                                            className="submit-btn interactive-press"
                                            disabled={isSubmitting || supportMessage.trim().length === 0 || supportMessage.trim().length > 1000}
                                            style={{ width: '100%' }}
                                        >
                                            {isSubmitting ? 'Sending...' : 'Send Feedback'}
                                        </button>
                                    )}

                                    {submitStatus === 'success' && (
                                        <div className="form-status success" style={{ marginTop: '1rem', color: '#10b981', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.85rem' }}>
                                            <Sparkles size={14} /> Message sent successfully!
                                        </div>
                                    )}
                                    {submitStatus === 'error' && (
                                        <div className="form-status error" style={{ marginTop: '1rem', color: '#ef4444', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.85rem' }}>
                                            <X size={14} /> Failed to send. Please try again.
                                        </div>
                                    )}
                                </form>
                            </div>

                            {/* Quick FAQ Section - Now Below the Form */}
                            <div className="faq-container-new" style={{ marginTop: '3rem' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '1.5rem' }}>
                                    <h3 style={{ margin: 0, fontSize: '1.2rem', fontWeight: 800 }}>Quick FAQ</h3>
                                    <div style={{ height: '1px', flex: 1, background: 'linear-gradient(90deg, rgba(255,255,255,0.1), transparent)' }} />
                                </div>

                                <div className="faq-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1.5rem' }}>
                                    <div className="faq-card" style={{ padding: '1.2rem', borderRadius: '1rem', background: 'rgba(18, 18, 22, 0.85)', border: '1px solid rgba(255, 255, 255, 0.08)' }}>
                                        <div style={{ fontWeight: 800, fontSize: '0.85rem', marginBottom: '0.5rem', color: 'var(--color-accent)' }}>How do I change my Daily Focus Target?</div>
                                        <p style={{ margin: 0, fontSize: '0.8rem', color: 'rgba(255,255,255,0.6)', lineHeight: 1.5 }}>
                                            Go to the <strong>Stats</strong> tab. Look for the "Daily Focus Target" adjuster in the top-right header—you can change it there instantly.
                                        </p>
                                    </div>

                                    <div className="faq-card" style={{ padding: '1.2rem', borderRadius: '1rem', background: 'rgba(18, 18, 22, 0.85)', border: '1px solid rgba(255, 255, 255, 0.08)' }}>
                                        <div style={{ fontWeight: 800, fontSize: '0.85rem', marginBottom: '0.5rem', color: 'var(--color-accent)' }}>How do I import, export, or back up data?</div>
                                        <p style={{ margin: 0, fontSize: '0.8rem', color: 'rgba(255,255,255,0.6)', lineHeight: 1.5 }}>
                                            Go to the <strong>Account</strong> tab. You can export all your stats, habits, and settings as a `.json` backup file, or upload a previously exported file to restore your progress.
                                        </p>
                                    </div>

                                    <div className="faq-card" style={{ padding: '1.2rem', borderRadius: '1rem', background: 'rgba(18, 18, 22, 0.85)', border: '1px solid rgba(255, 255, 255, 0.08)' }}>
                                        <div style={{ fontWeight: 800, fontSize: '0.85rem', marginBottom: '0.5rem', color: 'var(--color-accent)' }}>What is the browser storage limit?</div>
                                        <p style={{ margin: 0, fontSize: '0.8rem', color: 'rgba(255,255,255,0.6)', lineHeight: 1.5 }}>
                                            Data is saved in browser `localStorage` (capped at ~5MB, enough for years of use). To keep storage low, a 6 months cleanup policy auto-archives old detailed focus session logs.
                                        </p>
                                    </div>

                                    <div className="faq-card" style={{ padding: '1.2rem', borderRadius: '1rem', background: 'rgba(18, 18, 22, 0.85)', border: '1px solid rgba(255, 255, 255, 0.08)' }}>
                                        <div style={{ fontWeight: 800, fontSize: '0.85rem', marginBottom: '0.5rem', color: 'var(--color-accent)' }}>Is my study progress private?</div>
                                        <p style={{ margin: 0, fontSize: '0.8rem', color: 'rgba(255,255,255,0.6)', lineHeight: 1.5 }}>
                                            Yes! Everything is saved locally on your device. No personal data is sent to external servers, making it private, secure, and fully offline-friendly.
                                        </p>
                                    </div>
                                </div>

                                <div style={{ marginTop: '2rem', textAlign: 'center' }}>
                                    <p style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.4)' }}>
                                        Still need help? Email me at <a href="mailto:feedbackhimanshu065@gamil.com" style={{ color: 'var(--color-accent)', textDecoration: 'none' }}>feedbackhimanshu065@gamil.com</a>
                                    </p>
                                </div>
                            </div>
                        </div>
                    )}
                    {activeTab === 'about' && (
                        <div className="dashboard-section animate-fade-in" style={{ maxWidth: '800px', margin: '0 auto', textAlign: 'center', padding: '2rem 0' }}>
 
                            <div style={{
                                background: 'rgba(18, 18, 22, 0.85)',
                                border: '1px solid rgba(255, 255, 255, 0.08)',
                                borderRadius: '1.5rem',
                                padding: '2.5rem',
                                color: 'rgba(255, 255, 255, 0.8)',
                                display: 'flex',
                                flexDirection: 'column',
                                gap: '1rem'
                            }}>
                                {/* Brand Moment Title */}
                                <h1 style={{ 
                                    margin: '0 auto 0.5rem auto', 
                                    fontSize: '3rem', 
                                    fontWeight: 900, 
                                    letterSpacing: '-0.04em', 
                                    color: '#ffffff',
                                    borderBottom: '3px solid var(--color-accent)',
                                    paddingBottom: '0.01rem',
                                    width: 'fit-content'
                                }}>focora</h1>

                                {/* Tier 1 — The one-liner (largest/boldest, primary attention) */}
                                <h2 style={{
                                    margin: 0,
                                    fontSize: '1.5rem',
                                    fontWeight: 800,
                                    lineHeight: '1.4',
                                    color: '#ffffff',
                                    letterSpacing: '-0.02em'
                                }}>
                                    A personal focus timer, built for deep work.
                                </h2>
 
                                {/* Tier 2 — The context (normal weight, slightly muted color) */}
                                <p style={{
                                    margin: 0,
                                    fontSize: '1.05rem',
                                    fontWeight: 400,
                                    lineHeight: '1.6',
                                    color: 'rgba(255, 255, 255, 0.6)'
                                }}>
                                    Built for myself, shared publicly. No features for features' sake.
                                </p>
 
                                 {/* Tier 3 — The blockquote disclaimer (trimmed text, green left border accent, breathing space) */}
                                 <blockquote style={{
                                     margin: '0.75rem 0 0 0',
                                     padding: '1.25rem 1.5rem',
                                     background: 'rgba(var(--color-accent-rgb), 0.05)',
                                     borderRadius: '1rem',
                                     borderLeft: '0.25rem solid var(--color-accent)',
                                     fontSize: '0.95rem',
                                     lineHeight: '1.6',
                                     color: 'rgba(255, 255, 255, 0.7)',
                                     textAlign: 'left'
                                 }}>
                                     Hobby project. Updates happen when I need them. Feedback is welcome if it fits the direction.
                                 </blockquote>
 
                                 {/* Tagline */}
                                 <p style={{
                                     margin: '0.5rem 0 0 0',
                                     fontWeight: 700,
                                     color: 'var(--color-accent)',
                                     textTransform: 'uppercase',
                                     letterSpacing: '0.1em',
                                     fontSize: '0.9rem'
                                 }}>
                                     Simple. Intentional. Built for focus. <span style={{ opacity: 0.5, fontWeight: 500, textTransform: 'none', letterSpacing: 'normal', marginLeft: '0.5rem' }}>— v2.0</span>
                                 </p>
                             </div>

                             <div style={{
                                     display: 'flex',
                                     alignItems: 'center',
                                     justifyContent: 'center',
                                     gap: '1.5rem',
                                     marginTop: '2.5rem',
                                     flexWrap: 'wrap'
                                 }}>
                                     {/* Share Widget */}
                                     <div className="tooltip-container" style={{ marginTop: 0 }}>
                                         <div className="button-content">
                                             <span className="text">Share with Friends</span>
                                             <svg
                                                 className="share-icon"
                                                 viewBox="0 0 24 24"
                                                 width="20"
                                                 height="20"
                                             >
                                                 <path d="M18 16.08c-.76 0-1.44.3-1.96.77L8.91 12.7c.05-.23.09-.46.09-.7s-.04-.47-.09-.7l7.05-4.11c.54.5 1.25.81 2.04.81 1.66 0 3-1.34 3-3s-1.34-3-3-3-3 1.34-3 3c0 .24.04.47.09.7L8.04 9.81C7.5 9.31 6.79 9 6 9c-1.66 0-3 1.34-3 3s1.34 3 3 3c.79 0 1.5-.31 2.04-.81l7.12 4.16c-.05.21-.08.43-.08.65 0 1.61 1.31 2.92 2.92 2.92s2.92-1.31 2.92-2.92-1.31-2.92-2.92-2.92z" />
                                             </svg>
                                         </div>
                                         <div className="tooltip-content">
                                             <div className="social-icons">
                                                 <a href={`https://api.whatsapp.com/send?text=${encodeURIComponent("Check out this awesome focus app, focora! " + "https://focora-timer.vercel.app/")}`} target="_blank" rel="noopener noreferrer" className="social-icon whatsapp" title="Share on WhatsApp">
                                                     <svg viewBox="0 0 16 16" width="20" height="20" fill="currentColor">
                                                         <path d="M13.601 2.326A7.85 7.85 0 0 0 7.994 0C3.627 0 .068 3.558.064 7.926c0 1.399.366 2.76 1.057 3.965L0 16l4.204-1.102a7.9 7.9 0 0 0 3.79.965h.004c4.368 0 7.926-3.558 7.93-7.93A7.9 7.9 0 0 0 13.6 2.326zM7.994 14.521a6.6 6.6 0 0 1-3.356-.92l-.24-.144-2.494.654.666-2.433-.156-.251a6.56 6.56 0 0 1-1.007-3.505c0-3.626 2.957-6.584 6.591-6.584a6.56 6.56 0 0 1 4.66 1.931 6.56 6.56 0 0 1 1.928 4.66c-.004 3.639-2.961 6.592-6.592 6.592m3.615-4.934c-.197-.099-1.17-.578-1.353-.646-.182-.065-.315-.099-.445.099-.133.197-.513.646-.627.775-.114.133-.232.148-.43.05-.197-.1-.836-.308-1.592-.985-.59-.525-.985-1.175-1.103-1.372-.114-.198-.011-.304.088-.403.087-.088.197-.232.296-.346.1-.114.133-.198.198-.33.065-.134.034-.248-.015-.347-.05-.099-.445-1.076-.612-1.47-.16-.389-.323-.335-.445-.34-.114-.007-.247-.007-.38-.007a.73.73 0 0 0-.529.247c-.182.198-.691.677-.691 1.654s.71 1.916.81 2.049c.098.133 1.394 2.132 3.383 2.992.47.205.84.326 1.129.418.475.152.904.129 1.246.08.38-.058 1.171-.48 1.338-.943.164-.464.164-.86.114-.943-.049-.084-.182-.133-.38-.232"/>
                                                     </svg>
                                                 </a>
                                                 <a href={`https://t.me/share/url?url=${encodeURIComponent("https://focora-timer.vercel.app/")}&text=${encodeURIComponent("Check out this awesome focus app, focora!")}`} target="_blank" rel="noopener noreferrer" className="social-icon telegram" title="Share on Telegram">
                                                     <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor">
                                                         <path d="M20.665 3.717l-17.73 6.837c-1.21.486-1.203 1.161-.222 1.462l4.539 1.446 11.004-6.941c.522-.32.983-.141.597.228l-8.91 8.766-.35 5.257c.515 0 .741-.235 1.03-.526l2.456-2.387 5.116 3.784c.944.52 1.62.248 1.854-.878l3.256-15.35c.338-1.353-.46-1.956-1.365-1.55z"/>
                                                     </svg>
                                                 </a>
                                                 <button 
                                                     onClick={(e) => {
                                                         e.preventDefault();
                                                         navigator.clipboard.writeText("https://focora-timer.vercel.app/");
                                                         setCopied(true);
                                                         setTimeout(() => setCopied(false), 2000);
                                                     }}
                                                     className="social-icon copylink"
                                                     title={copied ? "Copied!" : "Copy Link"}
                                                     style={{
                                                         border: 'none',
                                                         cursor: 'pointer',
                                                         padding: 0,
                                                         outline: 'none'
                                                     }}
                                                 >
                                                     {copied ? (
                                                         <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="#22c55e" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                                                             <polyline points="20 6 9 17 4 12" />
                                                         </svg>
                                                     ) : (
                                                         <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                                             <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
                                                             <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
                                                         </svg>
                                                     )}
                                                 </button>
                                             </div>
                                         </div>
                                     </div>

                                     {/* SPACE FOR LIKE BUTTON (Reserved for user implementation) */}
                                     {/* <LikeButton /> */}

                                     {/* GitHub Star Button */}
                                     <a
                                         href="https://github.com/Himanshu478140/study-timer"
                                         target="_blank"
                                         rel="noopener noreferrer"
                                         className="rainbow-btn"
                                         title="Star on GitHub"
                                     >
                                         <div style={{ display: 'flex', alignItems: 'center' }}>
                                              <Github size={16} />
                                             <span style={{ marginLeft: '4px' }}>Star on GitHub</span>
                                         </div>
                                     </a>
                                 </div>

                            <div style={{ marginTop: '3rem', opacity: 0.5, lineHeight: 1.4 }}>
                                <div style={{ fontWeight: 900, fontSize: '0.9rem', textTransform: 'uppercase', letterSpacing: '0.15em' }}>
                                    focora ·
                                </div>
                                <div style={{ fontWeight: 900, fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.1em', opacity: 0.8 }}>
                                    Crafted by Himanshu
                                </div>
                            </div>

                            {/* What's New Section */}
                            <div className="whats-new-container">
                                <h3 className="whats-new-title">
                                    <Sparkles size={14} /> What's New in v2.0
                                </h3>
                                <ul className="whats-new-list">
                                    {[
                                        { title: "Minimal Redesign", desc: "Every screen stripped back. Cleaner layout, less visual noise, more focus." },
                                        { title: "Performance Improvements", desc: "Faster load, lower resource usage. The app gets out of your way quicker." },
                                        { title: "New Wallpaper Collection", desc: "Fresh set of wallpapers added. More ways to set the mood for your session." },
                                        { title: "Desktop & Tablet App", desc: "focora is now available as a native app on desktop and tablet." },
                                        { title: "Responsive Web App", desc: "The web version now adapts properly to desktop and tablet screens." },
                                        { title: "Scratchpad", desc: "A simple scratchpad, built in. Jot down thoughts without leaving your session." },
                                        { title: "Data Export & Import", desc: "Your data stays yours. Export it, back it up, bring it back anytime. No cloud required." },
                                        { title: "Improved Widgets", desc: "Widget layouts have been refined. Better spacing, better readability." }
                                    ].map((item, idx) => (
                                        <li key={idx} className="whats-new-item">
                                            <div className="whats-new-content">
                                                <div className="whats-new-item-title">{item.title}</div>
                                                <div className="whats-new-item-desc">{item.desc}</div>
                                            </div>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        </div>
                    )}
                </div>
            </div>
            {/* Import Confirmation Modal */}
            {showImportModal && (
                <div className="nested-modal-overlay" onClick={() => setShowImportModal(false)}>
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
                                className="data-btn data-btn-secondary"
                                onClick={() => setShowImportModal(false)}
                            >
                                Cancel
                            </button>
                            <button 
                                className="data-btn data-btn-primary"
                                onClick={handleConfirmImport}
                            >
                                Proceed & Import
                            </button>
                        </footer>
                    </div>
                </div>
            )}

            {/* Reset Confirmation Modal */}
            {showResetModal && (
                <div className="nested-modal-overlay" onClick={() => setShowResetModal(false)}>
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
                                className="data-btn data-btn-secondary"
                                onClick={() => setShowResetModal(false)}
                            >
                                Cancel
                            </button>
                            <button 
                                className="data-btn data-btn-danger"
                                onClick={handleConfirmReset}
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
        </div>
    );
};

const SidebarItem = ({ icon: Icon, label, active, onClick, hasNotification, glow }: any) => (
    <div className={`sidebar-item ${active ? 'active' : ''} ${glow && !active ? 'glow' : ''}`} onClick={onClick}>
        <Icon size={20} />
        <span style={{ flex: 1 }}>{label}</span>
        {hasNotification && (
            <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#ea580c', boxShadow: '0 0 8px #ea580c' }}></div>
        )}
    </div>
);
