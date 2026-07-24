import { type WallpaperConfig } from '../../WallpaperSelector';
import { prettyName, getTypeLabel } from '../utils/wallpaperHelpers';
import { CATEGORY_META } from '../utils/category';

interface WallpaperHeroProps {
    wallpaper: WallpaperConfig;
    heroBg: {
        kind: 'solid' | 'gradient' | 'image';
        value: string;
        srcSet?: string;
    };
}

export const WallpaperHero = ({ wallpaper, heroBg }: WallpaperHeroProps) => {
    return (
        <div className="wg-hero" role="banner">
            {heroBg.kind === 'image' && heroBg.value && (
                <img 
                    className="wg-hero__image" 
                    src={heroBg.value} 
                    srcSet={heroBg.srcSet}
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 600px"
                    alt="" 
                    loading="lazy" 
                />
            )}
            {heroBg.kind === 'gradient' && (
                <div className="wg-hero__gradient-bg" style={{ background: heroBg.value }} />
            )}
            {heroBg.kind === 'solid' && (
                <div className="wg-hero__solid-bg" style={{ background: heroBg.value }} />
            )}
            <div className="wg-hero__overlay" />
            <div className="wg-hero__content">
                <span className="wg-hero__badge">Current Selection</span>
                <h2 className="wg-hero__name">{prettyName(wallpaper.id)}</h2>
                <p className="wg-hero__subtitle">
                    {CATEGORY_META[wallpaper.category]?.label ?? wallpaper.category} • {getTypeLabel(wallpaper)}
                </p>
            </div>
        </div>
    );
};
