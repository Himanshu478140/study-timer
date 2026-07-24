import { Dashboard, type DashboardTab } from '../Dashboard';
import { type WallpaperConfig } from '../../wallpaper/WallpaperSelector';

interface DashboardOverlayProps {
    isDashboardOpen: boolean;
    setIsDashboardOpen: (open: boolean) => void;
    wallpaper: WallpaperConfig;
    setWallpaper: (config: WallpaperConfig) => void;
    xp: number;
    level: number;
    streak: number;
    stats: any;
    clockFont: string;
    setClockFont: (font: string) => void;
    timerConfig: any;
    setTimerConfig: (config: any) => void;
    features: any;
    setFeatures: (features: any) => void;
    selectedQuote: string;
    setSelectedQuote: (quote: string) => void;
    customQuotes: string[];
    handleAddQuote: (quote: string) => void;
    handleRemoveQuote: (quote: string) => void;
    quoteFont: string;
    setQuoteFont: (font: string) => void;
    timezone: string;
    setTimezone: (tz: string) => void;
    dashboardTab: DashboardTab;
    customAvatar: string | null;
    setCustomAvatar: (avatar: string | null) => void;
    zenClockStyle: string;
    setZenClockStyle: (style: string) => void;
}

export const DashboardOverlay = ({
    isDashboardOpen,
    setIsDashboardOpen,
    wallpaper,
    setWallpaper,
    xp,
    level,
    streak,
    stats,
    clockFont,
    setClockFont,
    timerConfig,
    setTimerConfig,
    features,
    setFeatures,
    selectedQuote,
    setSelectedQuote,
    customQuotes,
    handleAddQuote,
    handleRemoveQuote,
    quoteFont,
    setQuoteFont,
    timezone,
    setTimezone,
    dashboardTab,
    customAvatar,
    setCustomAvatar,
    zenClockStyle,
    setZenClockStyle
}: DashboardOverlayProps) => {
    if (!isDashboardOpen) return null;

    return (
        <Dashboard
            isOpen={isDashboardOpen}
            onClose={() => setIsDashboardOpen(false)}
            wallpaper={wallpaper}
            onWallpaperSelect={setWallpaper}
            xp={xp}
            level={level}
            streak={streak}
            stats={stats}
            clockFont={clockFont}
            setClockFont={setClockFont}
            timerConfig={timerConfig}
            setTimerConfig={setTimerConfig}
            features={features}
            setFeatures={setFeatures}
            selectedQuote={selectedQuote}
            setSelectedQuote={setSelectedQuote}
            customQuotes={customQuotes}
            onAddQuote={handleAddQuote}
            onRemoveQuote={handleRemoveQuote}
            quoteFont={quoteFont}
            setQuoteFont={setQuoteFont}
            timezone={timezone}
            setTimezone={setTimezone}
            initialTab={dashboardTab}
            customAvatar={customAvatar}
            setCustomAvatar={setCustomAvatar}
            zenClockStyle={zenClockStyle}
            setZenClockStyle={setZenClockStyle}
        />
    );
};
