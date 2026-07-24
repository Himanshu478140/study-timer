import { type TypeFilter } from '../hooks/useWallpaperFilters';
import { type ToneFilter } from '../utils/wallpaperHelpers';
import { TONE_COLORS } from '../utils/category';

interface FilterBarProps {
    typeFilter: TypeFilter;
    setTypeFilter: (t: TypeFilter) => void;
    toneFilter: ToneFilter;
    setToneFilter: (t: ToneFilter) => void;
}

export const FilterBar = ({
    typeFilter,
    setTypeFilter,
    toneFilter,
    setToneFilter
}: FilterBarProps) => {
    return (
        <nav className="wg-filters" aria-label="Wallpaper filters">
            {/* Type row */}
            <div className="wg-filter-row" role="group" aria-label="Type filter">
                {(['all', 'static', 'animated'] as TypeFilter[]).map(t => (
                    <button
                        key={t}
                        className={`wg-chip ${typeFilter === t ? 'active' : ''}`}
                        onClick={() => setTypeFilter(t)}
                        aria-pressed={typeFilter === t}
                    >
                        {t === 'all' ? 'All Types' : t.charAt(0).toUpperCase() + t.slice(1)}
                    </button>
                ))}
            </div>
            {/* Tone row */}
            <div className="wg-filter-row" role="group" aria-label="Tone filter">
                <button
                    className={`wg-chip ${toneFilter === 'all' ? 'active' : ''}`}
                    onClick={() => setToneFilter('all')}
                    aria-pressed={toneFilter === 'all'}
                >
                    All Tones
                </button>
                {(Object.keys(TONE_COLORS) as Exclude<ToneFilter, 'all'>[]).map(t => (
                    <button
                        key={t}
                        className={`wg-chip wg-chip--tone ${toneFilter === t ? 'active' : ''}`}
                        onClick={() => setToneFilter(t)}
                        aria-pressed={toneFilter === t}
                    >
                        <span className="wg-tone-dot" style={{ background: TONE_COLORS[t] }} />
                        {t.charAt(0).toUpperCase() + t.slice(1)}
                    </button>
                ))}
            </div>
        </nav>
    );
};
