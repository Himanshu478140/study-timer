import { useState, useEffect } from 'react';
import {
    X, Layout, Clock, BarChart2, MessageSquare,
    Sparkles, User, HelpCircle, Plus, Minus, Info,
    LogOut, RefreshCw, Library, Monitor, Smartphone,
    Cloud, Zap,
    Home, Moon, Shield
} from 'lucide-react';
import { useCloudSync } from '../../context/CloudSyncContext';
import { StatsPanel } from './StatsPanel';
import './dashboard.css';
import { WallpaperGrid, type WallpaperConfig } from '../wallpaper/WallpaperSelector';
import { auth, googleProvider, db } from '../../lib/firebase';
import { signInWithPopup, signOut } from 'firebase/auth';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { useHabits } from '../../hooks/useHabits';
import type { AppMode } from '../layout/GlobalModeSwitcher';

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
    };
    setTimerConfig: (config: any) => void;
    features: {
        ambientMode: boolean;
        sound: boolean;
        notifications: boolean;
        showQuoteInFullscreen: boolean;
        zenModeType: 'clock' | 'timer';
        zenAutoFullscreen: boolean;
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
    appMode: AppMode;
    onAppModeChange: (mode: AppMode) => void;
}

type DashboardTab = 'themes' | 'clock' | 'stats' | 'quotes' | 'features' | 'account' | 'help' | 'support' | 'about';

export const Dashboard = ({
    isOpen, onClose, wallpaper, onWallpaperSelect,
    timerConfig, setTimerConfig, features, setFeatures, clockFont, setClockFont,
    selectedQuote, setSelectedQuote, xp, level, streak, stats,
    customQuotes, onAddQuote, onRemoveQuote,
    quoteFont, setQuoteFont,
    timezone, setTimezone,
    appMode, onAppModeChange
}: DashboardProps) => {
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

    const [activeTab, setActiveTab] = useState<DashboardTab>('stats');
    const [aboutVisited, setAboutVisited] = useState(() => localStorage.getItem('about_visited') === 'true');

    // Support Form State
    const [supportType, setSupportType] = useState<'bug' | 'feature' | 'feedback'>('feedback');
    const [supportMessage, setSupportMessage] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error'>('idle');
    const [focusError, setFocusError] = useState(false);
    const [breakError, setBreakError] = useState(false);
    const [rateLimitActive, setRateLimitActive] = useState(false);

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
            await addDoc(collection(db, 'support_tickets'), {
                userId: user?.uid || 'guest',
                userEmail: user?.email || 'guest@anonymous.com',
                type: supportType,
                message: supportMessage.trim(),
                createdAt: serverTimestamp(),
                userAgent: navigator.userAgent,
                platform: navigator.platform
            });

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
    const { user, syncStatus, triggerSync, lastSyncedAt } = useCloudSync();
    const [authError, setAuthError] = useState<string | null>(null);
    const [newQuoteText, setNewQuoteText] = useState('');
    const { setDailyGoal } = useHabits();

    const handleGoogleLogin = async () => {
        setAuthError(null);
        try {
            await signInWithPopup(auth, googleProvider);
        } catch (error: any) {
            console.error("Login failed", error);
            setAuthError(error.message);
        }
    };

    const handleLogout = async () => {
        try {
            await signOut(auth);
        } catch (error) {
            console.error("Logout failed", error);
        }
    };

    // Close on Escape key
    useEffect(() => {
        const handleEsc = (e: KeyboardEvent) => {
            if (e.key === 'Escape') onClose();
        };
        window.addEventListener('keydown', handleEsc);
        return () => window.removeEventListener('keydown', handleEsc);
    }, [onClose]);

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
                    <div style={{
                        padding: '0.5rem 0 1rem 0',
                        textAlign: 'center',
                        fontSize: '0.9rem',
                        fontWeight: 900,
                        letterSpacing: '0.15em',
                        color: 'var(--color-accent)',
                        opacity: 1,
                        textTransform: 'uppercase',
                        fontFamily: 'Inter, sans-serif'
                    }}>
                        Study Timer
                    </div>

                    <SidebarItem
                        icon={Layout}
                        label="Themes"
                        active={activeTab === 'themes'}
                        onClick={() => setActiveTab('themes')}
                    />
                    {/* Placeholder items */}
                    <SidebarItem icon={Clock} label="Clock" active={activeTab === 'clock'} onClick={() => setActiveTab('clock')} />
                    <SidebarItem icon={BarChart2} label="Stats" active={activeTab === 'stats'} onClick={() => setActiveTab('stats')} />
                    <SidebarItem icon={MessageSquare} label="Quotes" active={activeTab === 'quotes'} onClick={() => setActiveTab('quotes')} />
                    <SidebarItem icon={Sparkles} label="Features" active={activeTab === 'features'} onClick={() => setActiveTab('features')} />
                    <SidebarItem icon={User} label="Account" active={activeTab === 'account'} onClick={() => setActiveTab('account')} hasNotification={!user} />

                    {/* Spacer to push items to bottom */}
                    <div style={{ flex: 1 }} />

                    <SidebarItem
                        icon={Info}
                        label="About"
                        active={activeTab === 'about'}
                        glow={!aboutVisited}
                        onClick={() => {
                            setActiveTab('about');
                            setAboutVisited(true);
                            localStorage.setItem('about_visited', 'true');
                        }}
                    />
                    <SidebarItem icon={HelpCircle} label="Help / Guide" active={activeTab === 'help'} onClick={() => setActiveTab('help')} />
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
                            <h2>Themes & Wallpapers</h2>
                            <p style={{ marginBottom: '1.5rem', color: 'rgba(255,255,255,0.7)' }}>
                                Choose a background that fits your vibe. The interface will automatically adapt its colors.
                            </p>
                            <WallpaperGrid currentId={wallpaper.id} onSelect={onWallpaperSelect} />
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
                                            className={`font-preview-card ${clockFont === f.id ? 'active' : ''}`}
                                            onClick={() => setClockFont(f.id)}
                                        >
                                            <div className={`font-sample ${f.class}`}>9:24</div>
                                            <span className="font-name">{f.name}</span>
                                        </div>
                                    ))}
                                </div>

                                <div className="feature-card" style={{ marginTop: '1rem', background: 'rgba(255,255,255,0.02)', padding: '1rem', borderRadius: '1rem' }}>
                                    <div className="feature-info">
                                        <h3>Zen Mode Mode</h3>
                                        <p>Choose what to display in Zen Mode.</p>
                                    </div>
                                    <div className="setting-options" style={{ background: 'rgba(255,255,255,0.05)', padding: '4px', borderRadius: '0.6rem' }}>
                                        <button
                                            className={`setting-btn ${features.zenModeType === 'clock' ? 'active' : ''}`}
                                            onClick={() => setFeatures({ ...features, zenModeType: 'clock' })}
                                            style={{ fontSize: '0.75rem', padding: '0.4rem 0.8rem' }}
                                        >
                                            Clock
                                        </button>
                                        <button
                                            className={`setting-btn ${features.zenModeType === 'timer' ? 'active' : ''}`}
                                            onClick={() => setFeatures({ ...features, zenModeType: 'timer' })}
                                            style={{ fontSize: '0.75rem', padding: '0.4rem 0.8rem' }}
                                        >
                                            Timer
                                        </button>
                                    </div>
                                </div>

                                <div className="feature-card" style={{ marginTop: '0.75rem', background: 'rgba(255,255,255,0.02)', padding: '1rem', borderRadius: '1rem' }}>
                                    <div className="feature-info">
                                        <h3>Auto Fullscreen</h3>
                                        <p>Enter fullscreen automatically when Zen Mode starts.</p>
                                    </div>
                                    <div
                                        className={`toggle-switch ${features.zenAutoFullscreen ? 'active' : ''}`}
                                        onClick={() => setFeatures({ ...features, zenAutoFullscreen: !features.zenAutoFullscreen })}
                                    ></div>
                                </div>

                                <div className="feature-card" style={{ marginTop: '0.75rem', background: 'rgba(255,255,255,0.02)', padding: '1rem', borderRadius: '1rem' }}>
                                    <div className="feature-info">
                                        <h3>Zen Time Format</h3>
                                        <p>Switch between 12-hour and 24-hour display.</p>
                                    </div>
                                    <div className="setting-options" style={{ background: 'rgba(255,255,255,0.05)', padding: '4px', borderRadius: '0.6rem' }}>
                                        <button
                                            className={`setting-btn ${features.zenTimeFormat === '12h' ? 'active' : ''}`}
                                            onClick={() => setFeatures({ ...features, zenTimeFormat: '12h' })}
                                            style={{ fontSize: '0.75rem', padding: '0.4rem 0.8rem' }}
                                        >
                                            12H
                                        </button>
                                        <button
                                            className={`setting-btn ${features.zenTimeFormat === '24h' ? 'active' : ''}`}
                                            onClick={() => setFeatures({ ...features, zenTimeFormat: '24h' })}
                                            style={{ fontSize: '0.75rem', padding: '0.4rem 0.8rem' }}
                                        >
                                            24H
                                        </button>
                                    </div>
                                </div>

                                <div style={{ marginTop: '3rem' }}>
                                    <h3>Home</h3>
                                    <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.85rem', marginBottom: '1rem' }}>
                                        Personalize your landing experience.
                                    </p>
                                    <div className="feature-card" style={{ background: 'rgba(255,255,255,0.02)', padding: '1rem', borderRadius: '1rem' }}>
                                        <div className="feature-info">
                                            <h3>Time Format</h3>
                                            <p>Switch between 12-hour and 24-hour display on the Home screen.</p>
                                        </div>
                                        <div className="setting-options" style={{ background: 'rgba(255,255,255,0.05)', padding: '4px', borderRadius: '0.6rem' }}>
                                            <button
                                                className={`setting-btn ${features.homeTimeFormat === '12h' ? 'active' : ''}`}
                                                onClick={() => setFeatures({ ...features, homeTimeFormat: '12h' })}
                                                style={{ fontSize: '0.75rem', padding: '0.4rem 0.8rem' }}
                                            >
                                                12H
                                            </button>
                                            <button
                                                className={`setting-btn ${features.homeTimeFormat === '24h' ? 'active' : ''}`}
                                                onClick={() => setFeatures({ ...features, homeTimeFormat: '24h' })}
                                                style={{ fontSize: '0.75rem', padding: '0.4rem 0.8rem' }}
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

                    {activeTab === 'features' && (
                        <div className="dashboard-section">
                            <h2>Pro Features</h2>
                            <p style={{ color: 'rgba(255,255,255,0.7)', marginBottom: '1.5rem' }}>Enhance your focus experience.</p>

                            <div className="feature-card">
                                <div className="feature-info">
                                    <h3>Home Mode</h3>
                                    <p>Serene dashboard view with large clock and greetings.</p>
                                </div>
                                <div
                                    className={`toggle-switch ${appMode === 'home' ? 'active' : ''}`}
                                    onClick={() => onAppModeChange(appMode === 'home' ? 'focus' : 'home')}
                                ></div>
                            </div>

                            <div className="feature-card">
                                <div className="feature-info">
                                    <h3>Ambient Mode</h3>
                                    <p>Hide UI elements during focus sessions for complete immersion.</p>
                                </div>
                                <div
                                    className={`toggle-switch ${features.ambientMode ? 'active' : ''}`}
                                    onClick={() => setFeatures({ ...features, ambientMode: !features.ambientMode })}
                                ></div>
                            </div>

                            <div className="feature-card">
                                <div className="feature-info">
                                    <h3>Focus Sounds</h3>
                                    <p>Play ambient sounds or white noise to block distractions.</p>
                                </div>
                                <div
                                    className={`toggle-switch ${features.sound ? 'active' : ''}`}
                                    onClick={() => setFeatures({ ...features, sound: !features.sound })}
                                ></div>
                            </div>

                            <div className="feature-card">
                                <div className="feature-info">
                                    <h3>Inspirational Quotes</h3>
                                    <p>Show selected quote above the clock in fullscreen mode.</p>
                                </div>
                                <div
                                    className={`toggle-switch ${features.showQuoteInFullscreen ? 'active' : ''}`}
                                    onClick={() => setFeatures({ ...features, showQuoteInFullscreen: !features.showQuoteInFullscreen })}
                                ></div>
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
                                                background: quoteFont === f.id ? 'rgba(var(--color-accent-rgb), 0.15)' : 'rgba(255,255,255,0.03)',
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
                                            background: 'rgba(255,255,255,0.05)',
                                            border: '1px solid rgba(255,255,255,0.1)',
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
                                            background: selectedQuote === q ? 'rgba(var(--color-accent-rgb), 0.15)' : 'rgba(255,255,255,0.03)',
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
                                            background: selectedQuote === q ? 'rgba(var(--color-accent-rgb), 0.15)' : 'rgba(255,255,255,0.03)',
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
                        <div className="dashboard-section animate-fade-in" style={{ maxWidth: '500px', margin: '0 auto' }}>
                            <h2 className="flex-center" style={{ justifyContent: 'flex-start', gap: '0.5rem' }}>
                                <User size={20} /> Account & Sync
                            </h2>
                            <p style={{ marginBottom: '2rem', color: 'rgba(255,255,255,0.7)', fontSize: '0.9rem' }}>
                                {user ? 'Your progress is being synced to the cloud.' : 'Sign in to sync your tasks, habits, and stats across devices.'}
                            </p>

                            <div className="setting-card" style={{ padding: '0', overflow: 'hidden', background: 'rgba(255,255,255,0.02)' }}>
                                {!user ? (
                                    <div style={{ padding: '2.5rem 2rem', textAlign: 'center' }}>
                                        <div style={{ marginBottom: '1.5rem', opacity: 0.3 }}>
                                            <Sparkles size={48} />
                                        </div>
                                        <h3 style={{ marginBottom: '0.5rem' }}>Sync Your Focus</h3>
                                        <p style={{ fontSize: '0.85rem', opacity: 0.6, marginBottom: '2rem', lineHeight: 1.6 }}>
                                            Enable cross-device sync and protect your data. We use a 30-day retention policy for detailed session data to keep things fast and private.
                                        </p>
                                        <button
                                            className="google-signin-btn interactive-press"
                                            onClick={handleGoogleLogin}
                                            style={{
                                                width: '100%',
                                                padding: '0.75rem',
                                                borderRadius: '0.75rem',
                                                background: 'white',
                                                color: '#1a1a1a',
                                                fontWeight: 600,
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                gap: '0.75rem',
                                                border: 'none',
                                                cursor: 'pointer'
                                            }}
                                        >
                                            <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/layout/google.svg" alt="" width="18" />
                                            Sign in with Google
                                        </button>
                                    </div>
                                ) : (
                                    <div style={{ padding: '2rem' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '2rem' }}>
                                            <img
                                                src={user.photoURL || ''}
                                                alt=""
                                                style={{ width: 64, height: 64, borderRadius: '50%', border: '2px solid var(--color-accent)' }}
                                            />
                                            <div style={{ flex: 1 }}>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
                                                    <h3 style={{ margin: 0 }}>{user.displayName}</h3>
                                                    <span style={{
                                                        fontSize: '0.65rem',
                                                        fontWeight: 800,
                                                        padding: '2px 8px',
                                                        borderRadius: '1rem',
                                                        background: 'rgba(16, 185, 129, 0.15)',
                                                        color: '#10b981',
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        gap: '4px'
                                                    }}>
                                                        <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#10b981' }} />
                                                        SYNC ACTIVE
                                                    </span>
                                                </div>
                                                <p style={{ fontSize: '0.8rem', opacity: 0.6, margin: '2px 0 0 0' }}>{user.email}</p>
                                            </div>
                                            <button
                                                className="logout-btn interactive-press"
                                                onClick={handleLogout}
                                                style={{ padding: '0.5rem', borderRadius: '0.5rem', background: 'rgba(255,255,255,0.05)', border: 'none', color: '#ff6b6b' }}
                                                title="Sign Out"
                                            >
                                                <LogOut size={18} />
                                            </button>
                                        </div>

                                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem', marginBottom: '1.5rem' }}>
                                            <div style={{ textAlign: 'center', padding: '1rem', background: 'rgba(255,255,255,0.02)', borderRadius: '1rem' }}>
                                                <div style={{ fontSize: '0.7rem', opacity: 0.5, textTransform: 'uppercase', fontWeight: 700, marginBottom: '4px' }}>Retention</div>
                                                <div style={{ fontWeight: 600, fontSize: '0.9rem' }}>30 Days</div>
                                            </div>
                                            <div style={{ textAlign: 'center', padding: '1rem', background: 'rgba(255,255,255,0.02)', borderRadius: '1rem' }}>
                                                <div style={{ fontSize: '0.7rem', opacity: 0.5, textTransform: 'uppercase', fontWeight: 700, marginBottom: '4px' }}>Status</div>
                                                <div style={{
                                                    fontWeight: 600,
                                                    fontSize: '0.9rem',
                                                    color: syncStatus === 'error' ? '#ef4444' : (syncStatus === 'syncing' ? 'var(--color-accent)' : '#10b981')
                                                }}>
                                                    {syncStatus === 'syncing' ? 'Syncing...' : (syncStatus === 'error' ? 'Error' : 'Healthy')}
                                                </div>
                                            </div>
                                            <div style={{ textAlign: 'center', padding: '1rem', background: 'rgba(255,255,255,0.02)', borderRadius: '1rem' }}>
                                                <div style={{ fontSize: '0.7rem', opacity: 0.5, textTransform: 'uppercase', fontWeight: 700, marginBottom: '4px' }}>Updates</div>
                                                <div style={{ fontWeight: 600, fontSize: '0.9rem' }}>
                                                    {lastSyncedAt ? 'Recent' : 'Real-time'}
                                                </div>
                                            </div>
                                        </div>

                                        <button
                                            className="interactive-press"
                                            onClick={triggerSync}
                                            disabled={syncStatus === 'syncing'}
                                            style={{
                                                width: '100%',
                                                padding: '0.75rem',
                                                borderRadius: '0.75rem',
                                                background: 'rgba(var(--color-accent-rgb), 0.1)',
                                                border: '1px solid rgba(var(--color-accent-rgb), 0.2)',
                                                color: 'var(--color-accent)',
                                                fontWeight: 600,
                                                fontSize: '0.85rem',
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                gap: '0.5rem',
                                                cursor: 'pointer'
                                            }}
                                        >
                                            <RefreshCw size={16} className={syncStatus === 'syncing' ? 'animate-spin' : ''} />
                                            {syncStatus === 'syncing' ? 'Syncing Data...' : 'Sync Now'}
                                        </button>
                                    </div>
                                )}
                                {authError && <p style={{ padding: '1rem', color: '#ff6b6b', background: 'rgba(255,107,107,0.1)', textAlign: 'center', margin: 0, fontSize: '0.8rem' }}>{authError}</p>}
                            </div>

                            <div className="info-box" style={{ marginTop: '2rem', padding: '1rem', borderRadius: '1rem', background: 'rgba(var(--color-accent-rgb), 0.05)', border: '1px solid rgba(var(--color-accent-rgb), 0.1)', display: 'flex', gap: '0.75rem', alignItems: 'flex-start' }}>
                                <Info size={18} color="var(--color-accent)" style={{ marginTop: '2px' }} />
                                <p style={{ margin: 0, fontSize: '0.8rem', opacity: 0.7, lineHeight: 1.5 }}>
                                    Your data privacy is important. Granular session logs and completed tasks are automatically removed after 30 days to keep your local and cloud storage lean.
                                </p>
                            </div>

                            {/* Premium Timezone Selection UI */}
                            <div className="timezone-settings-container" style={{ marginTop: '3rem' }}>
                                <h4 className="settings-subtitle">
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

                    {activeTab === 'help' && (
                        <div className="dashboard-section" style={{ maxWidth: '900px', margin: '0 auto' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '2.5rem' }}>
                                <div style={{
                                    width: '56px',
                                    height: '56px',
                                    background: 'rgba(var(--color-accent-rgb), 0.1)',
                                    borderRadius: '16px',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    color: 'var(--color-accent)',
                                    border: '1px solid rgba(var(--color-accent-rgb), 0.2)'
                                }}>
                                    <Library size={28} />
                                </div>
                                <div>
                                    <h2 style={{ margin: 0, fontSize: '1.8rem' }}>User Guide</h2>
                                    <p style={{ margin: 0, color: 'rgba(255,255,255,0.5)', fontSize: '1rem' }}>Everything you need to master your focus.</p>
                                </div>
                            </div>

                            <div className="guide-grid">
                                {/* Workspace Modes */}
                                <div className="guide-section full-width">
                                    <h3 className="guide-header"><Monitor size={20} /> Workspace Modes</h3>
                                    <div className="guide-card-row">
                                        <div className="guide-mini-card">
                                            <div className="mini-card-icon home"><Home size={18} /></div>
                                            <div className="mini-card-content">
                                                <h4>Home Mode</h4>
                                                <p>Your main command center. View the large clock, greeting, and access all widgets (Task, Stats, Habits) directly for planning.</p>
                                            </div>
                                        </div>
                                        <div className="guide-mini-card">
                                            <div className="mini-card-icon zen"><Moon size={18} /></div>
                                            <div className="mini-card-content">
                                                <h4>Zen Mode</h4>
                                                <p>Minimalist experience for deep work. Automatically enters fullscreen, hides distractions, and features vertical AM/PM indicators.</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Focus Modes */}
                                <div className="guide-section">
                                    <h3 className="guide-header"><Zap size={20} /> Focus Modes</h3>
                                    <div className="guide-list">
                                        <div className="guide-item">
                                            <strong>Deep Work:</strong> 90-min sessions for complex projects.
                                        </div>
                                        <div className="guide-item">
                                            <strong>Pomodoro:</strong> 25-min focus with short breaks.
                                        </div>
                                        <div className="guide-item">
                                            <strong>52/17:</strong> Research-backed flow for high productivity.
                                        </div>
                                        <div className="guide-item">
                                            <strong>Custom:</strong> Set your own focus and break durations.
                                        </div>
                                    </div>
                                </div>

                                {/* Customization */}
                                <div className="guide-section">
                                    <h3 className="guide-header"><Sparkles size={20} /> Customization</h3>
                                    <div className="guide-list">
                                        <div className="guide-item">
                                            <strong>YouTube Wallpapers:</strong> Paste any link in the Wallpaper menu to focus with your favorite visuals.
                                        </div>
                                        <div className="guide-item">
                                            <strong>Video Audio:</strong> Toggle "Video Sound" to hear audio from YouTube or custom video backgrounds.
                                        </div>
                                        <div className="guide-item">
                                            <strong>Ambience:</strong> Mix layers (Rain, Forest, Binaural) in the Audio panel for perfect focus.
                                        </div>
                                    </div>
                                </div>

                                {/* Data & Sync */}
                                <div className="guide-section">
                                    <h3 className="guide-header"><Cloud size={20} /> Data & Sync</h3>
                                    <div className="guide-list">
                                        <div className="guide-item">
                                            <strong>Local Storage:</strong> Your daily stats, habits, tasks, quotes, and preferences are securely stored in your browser, ensuring fast performance and full functionality—no account required.
                                        </div>
                                        <div className="guide-item">
                                            <strong>Cloud Sync:</strong> Sign in with Google (Account tab) to sync your progress, streaks, and habits across all your devices.
                                        </div>
                                        <div className="guide-item">
                                            <strong>Daily Goals:</strong> Syncs your Daily Focus Target to keep you consistent everywhere.
                                        </div>
                                    </div>
                                </div>

                                {/* Mobile Experience */}
                                <div className="guide-section">
                                    <h3 className="guide-header"><Smartphone size={20} /> Mobile & Tools</h3>
                                    <div className="guide-list">
                                        <div className="guide-item">
                                            <strong>Mobile Tools:</strong> On small screens, tap the <strong>Grid icon</strong> at the bottom to access hidden widgets.
                                        </div>
                                        <div className="guide-item">
                                            <strong>Tablet View:</strong> Layout automatically adjusts to provide the best view of the timer and stats.
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Pro Tips */}
                            <div className="pro-tips-banner" style={{ marginTop: '3rem' }}>
                                <div className="tip-header"><Zap size={18} /> Pro Tip</div>
                                <p>Combine <strong>Zen Mode</strong> with <strong>Ambient Audio</strong> and a <strong>Lo-Fi YouTube background</strong> for the ultimate deep work setup. Don't forget to define your <strong>Primary Task</strong> before starting!</p>
                            </div>

                            {/* Privacy */}
                            <div style={{ marginTop: '3rem', textAlign: 'center', padding: '2rem', borderTop: '1px solid rgba(255,255,255,0.05)' }}>
                                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', color: 'rgba(255,255,255,0.4)', fontSize: '0.85rem' }}>
                                    <Shield size={14} /> Your data is private and secure. Study Timer is built for focus, not tracking.
                                </div>
                            </div>
                        </div>
                    )}

                    {activeTab === 'support' && (
                        <div className="dashboard-section" style={{ maxWidth: '600px', margin: '0 auto' }}>
                            <h2 style={{ marginBottom: '0.5rem' }}>Help & Support</h2>
                            <p style={{ marginBottom: '2rem', color: 'rgba(255,255,255,0.6)' }}>
                                Have a question or found a bug? We're here to help you stay focused.
                            </p>

                            {/* Support Form Section */}
                            <div className="support-form-container-new" style={{ padding: '2rem', borderRadius: '1.5rem', background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)' }}>
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
                                            background: 'rgba(255, 255, 255, 0.03)',
                                            border: '1px solid rgba(255, 255, 255, 0.1)',
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
                                    <div className="faq-card" style={{ padding: '1.2rem', borderRadius: '1rem', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.05)' }}>
                                        <div style={{ fontWeight: 800, fontSize: '0.85rem', marginBottom: '0.5rem', color: 'var(--color-accent)' }}>How do I change my Daily Focus Goal?</div>
                                        <p style={{ margin: 0, fontSize: '0.8rem', color: 'rgba(255,255,255,0.6)', lineHeight: 1.5 }}>
                                            Go to the <strong>Stats</strong> tab. Look for the "Daily Focus Target" adjuster in the top-right header—you can change it there instantly.
                                        </p>
                                    </div>

                                    <div className="faq-card" style={{ padding: '1.2rem', borderRadius: '1rem', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.05)' }}>
                                        <div style={{ fontWeight: 800, fontSize: '0.85rem', marginBottom: '0.5rem', color: 'var(--color-accent)' }}>What is the "Focus Score"?</div>
                                        <p style={{ margin: 0, fontSize: '0.8rem', color: 'rgba(255,255,255,0.6)', lineHeight: 1.5 }}>
                                            It shows your percentage progress towards your Daily Goal. If your goal is 240m and you've focused for 120m, your score will be 50%.
                                        </p>
                                    </div>

                                    <div className="faq-card" style={{ padding: '1.2rem', borderRadius: '1rem', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.05)' }}>
                                        <div style={{ fontWeight: 800, fontSize: '0.85rem', marginBottom: '0.5rem', color: 'var(--color-accent)' }}>How do I save my progress?</div>
                                        <p style={{ margin: 0, fontSize: '0.8rem', color: 'rgba(255,255,255,0.6)', lineHeight: 1.5 }}>
                                            Sign in with Google in the <strong>Account</strong> tab. This syncs your stats and streaks securely to the cloud.
                                        </p>
                                    </div>

                                    <div className="faq-card" style={{ padding: '1.2rem', borderRadius: '1rem', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.05)' }}>
                                        <div style={{ fontWeight: 800, fontSize: '0.85rem', marginBottom: '0.5rem', color: 'var(--color-accent)' }}>Where are my custom quotes?</div>
                                        <p style={{ margin: 0, fontSize: '0.8rem', color: 'rgba(255,255,255,0.6)', lineHeight: 1.5 }}>
                                            Custom quotes are currently stored in your local browser. They are not yet synced to account, but we're working on it!
                                        </p>
                                    </div>
                                </div>

                                <div style={{ marginTop: '2rem', textAlign: 'center' }}>
                                    <p style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.4)' }}>
                                        Still need help? Email us at <a href="mailto:support@studytimer.app" style={{ color: 'var(--color-accent)', textDecoration: 'none' }}>support@studytimer.app</a>
                                    </p>
                                </div>
                            </div>
                        </div>
                    )}

                    {activeTab === 'about' && (
                        <div className="dashboard-section" style={{ maxWidth: '600px', margin: '0 auto', textAlign: 'center', padding: '2rem 0' }}>
                            <div style={{
                                width: '64px',
                                height: '64px',
                                background: 'rgba(var(--color-accent-rgb), 0.1)',
                                borderRadius: '20px',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                margin: '0 auto 2rem auto',
                                color: 'var(--color-accent)',
                                border: '1px solid rgba(var(--color-accent-rgb), 0.2)'
                            }}>
                                <Info size={32} />
                            </div>

                            <h2 style={{ marginBottom: '2rem', fontSize: '1.8rem' }}>About Study Timer</h2>

                            <div style={{
                                background: 'rgba(255, 255, 255, 0.03)',
                                border: '1px solid rgba(255, 255, 255, 0.05)',
                                borderRadius: '1.5rem',
                                padding: '2.5rem',
                                lineHeight: '1.8',
                                color: 'rgba(255, 255, 255, 0.8)',
                                fontSize: '1.05rem',
                                display: 'flex',
                                flexDirection: 'column',
                                gap: '1.5rem'
                            }}>
                                <p style={{ margin: 0 }}>
                                    This is a personal study timer I built for my own deep work sessions.
                                </p>
                                <p style={{ margin: 0 }}>
                                    I’m sharing it publicly in case it helps someone else focus too.
                                </p>
                                <p style={{ margin: 0, padding: '1.5rem', background: 'rgba(var(--color-accent-rgb), 0.05)', borderRadius: '1rem', borderLeft: '4px solid var(--color-accent)' }}>
                                    It’s a hobby project — updates happen only when I need improvements for myself. Feedback is appreciated. Updates are made when they align with the app’s direction.
                                </p>
                                <p style={{
                                    margin: '1rem 0 0 0',
                                    fontWeight: 700,
                                    color: 'var(--color-accent)',
                                    textTransform: 'uppercase',
                                    letterSpacing: '0.1em',
                                    fontSize: '0.9rem'
                                }}>
                                    Simple. Intentional. Built for focus.
                                </p>
                            </div>

                            <div className="tooltip-container">
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
                                        <a href={`https://twitter.com/intent/tweet?text=${encodeURIComponent("Check out this awesome Study Timer!")}&url=${encodeURIComponent(window.location.href)}`} target="_blank" rel="noopener noreferrer" className="social-icon twitter" title="Share on Twitter">
                                            <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor">
                                                <path d="M18.901 1.153h3.68l-8.04 9.19L24 22.846h-7.406l-5.8-7.584-6.638 7.584H.474l8.6-9.83L0 1.154h7.594l5.243 6.932ZM17.61 20.644h2.039L6.486 3.24H4.298Z" />
                                            </svg>
                                        </a>
                                        <a href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(window.location.href)}`} target="_blank" rel="noopener noreferrer" className="social-icon facebook" title="Share on Facebook">
                                            <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor">
                                                <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
                                            </svg>
                                        </a>
                                        <a href={`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(window.location.href)}`} target="_blank" rel="noopener noreferrer" className="social-icon linkedin" title="Share on LinkedIn">
                                            <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor">
                                                <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6zM2 9h4v12H2z" /><circle cx="4" cy="4" r="2" />
                                            </svg>
                                        </a>
                                    </div>
                                </div>
                            </div>

                            <div style={{ marginTop: '3rem', opacity: 0.5, lineHeight: 1.4 }}>
                                <div style={{ fontWeight: 900, fontSize: '0.9rem', textTransform: 'uppercase', letterSpacing: '0.15em' }}>
                                    Study Timer ·
                                </div>
                                <div style={{ fontWeight: 900, fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.1em', opacity: 0.8 }}>
                                    Crafted by Himanshu
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
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
