import { Clock } from 'lucide-react';
import { TIMEZONES } from '../utils/constants';

interface TimezoneSelectorProps {
  timezone: string;
  onSelect: (tz: string) => void;
}

export const TimezoneSelector = ({ timezone, onSelect }: TimezoneSelectorProps) => {
  return (
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
                  onClick={() => onSelect(tz.id)}
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
  );
};
