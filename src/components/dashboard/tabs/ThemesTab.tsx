import { WallpaperGallery } from '../../wallpaper/WallpaperGallery';
import type { WallpaperConfig } from '../../wallpaper/WallpaperSelector';

interface ThemesTabProps {
  wallpaper: WallpaperConfig;
  onWallpaperSelect: (config: WallpaperConfig) => void;
}

export const ThemesTab = ({ wallpaper, onWallpaperSelect }: ThemesTabProps) => {
  return (
    <div className="dashboard-section">
      <WallpaperGallery currentId={wallpaper.id} wallpaper={wallpaper} onSelect={onWallpaperSelect} />
    </div>
  );
};
