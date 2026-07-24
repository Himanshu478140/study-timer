import type { TimerConfig, DashboardFeatures } from '../types';
import { SmartAdjuster } from '../components/SmartAdjuster';
import { FeatureCard } from '../components/FeatureCard';
import { FontSelector } from '../components/FontSelector';
import { CLOCK_FONTS, ZEN_CLOCK_STYLES } from '../utils/constants';

interface ClockTabProps {
  timerConfig: TimerConfig;
  setTimerConfig: (config: TimerConfig) => void;
  features: DashboardFeatures;
  setFeatures: (features: DashboardFeatures) => void;
  clockFont: string;
  setClockFont: (font: string) => void;
  zenClockStyle: string;
  setZenClockStyle: (style: string) => void;
  
  focusError: boolean;
  setFocusError: (val: boolean) => void;
  breakError: boolean;
  setBreakError: (val: boolean) => void;
  activeBreakSettingMode: 'pomodoro' | 'flow' | 'deep_work';
  setActiveBreakSettingMode: (val: 'pomodoro' | 'flow' | 'deep_work') => void;
  getBreakMode: (m: 'pomodoro' | 'flow' | 'deep_work') => 'auto' | 'fixed';
  setBreakMode: (m: 'pomodoro' | 'flow' | 'deep_work', val: 'auto' | 'fixed') => void;
  getBreakDuration: (m: 'pomodoro' | 'flow' | 'deep_work') => number;
  setBreakDuration: (m: 'pomodoro' | 'flow' | 'deep_work', val: number) => void;
  getAutoBreakTime: (m: 'pomodoro' | 'flow' | 'deep_work') => number;
  isCustomPreset: (m: 'pomodoro' | 'flow' | 'deep_work') => boolean;
}

export const ClockTab = ({
  timerConfig,
  setTimerConfig,
  features,
  setFeatures,
  clockFont,
  setClockFont,
  zenClockStyle,
  setZenClockStyle,
  focusError,
  setFocusError,
  breakError,
  setBreakError,
  activeBreakSettingMode,
  setActiveBreakSettingMode,
  getBreakMode,
  setBreakMode,
  getBreakDuration,
  setBreakDuration,
  getAutoBreakTime,
  isCustomPreset
}: ClockTabProps) => {
  return (
    <div className="dashboard-section">
      <h2>Timer Settings</h2>
      <p style={{ color: 'rgba(255,255,255,0.7)', marginBottom: '1.5rem' }}>Customize your focus routine durations.</p>

      {/* Custom Focus Duration */}
      <div className="setting-group">
        <label>Custom Focus Duration</label>
        <div className="setting-options">
          {[15, 25, 45, 60, 90].map(m => (
            <button
              key={m}
              type="button"
              className={`setting-btn ${timerConfig.custom === m ? 'active' : ''}`}
              onClick={() => setTimerConfig({ ...timerConfig, custom: m })}
            >
              {m}m
            </button>
          ))}
        </div>
        
        <SmartAdjuster
          value={timerConfig.custom}
          max={1440}
          unit="min"
          hasError={focusError}
          onValueChange={(val) => setTimerConfig({ ...timerConfig, custom: val })}
          onErrorTrigger={() => {
            setFocusError(true);
            setTimeout(() => setFocusError(false), 400);
          }}
        />
      </div>

      {/* Custom Break Duration */}
      <div className="setting-group">
        <label>Custom Break Duration</label>
        <div className="setting-options">
          {[1, 5, 10, 15, 20].map(m => (
            <button
              key={m}
              type="button"
              className={`setting-btn ${timerConfig.customBreak === m ? 'active' : ''}`}
              onClick={() => setTimerConfig({ ...timerConfig, customBreak: m })}
            >
              {m}m
            </button>
          ))}
        </div>
        
        <SmartAdjuster
          value={timerConfig.customBreak}
          max={480}
          unit="min"
          hasError={breakError}
          onValueChange={(val) => setTimerConfig({ ...timerConfig, customBreak: val })}
          onErrorTrigger={() => {
            setBreakError(true);
            setTimeout(() => setBreakError(false), 400);
          }}
        />
      </div>

      {/* Break Duration Settings */}
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

      {/* Zen Clock */}
      <div style={{ marginTop: '3rem' }}>
        <h3>Zen Clock</h3>
        <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.85rem', marginBottom: '1rem' }}>
          Experience time with smooth animations and depth.
        </p>
        <div style={{ marginBottom: '2.5rem' }}>
          <FontSelector
            fonts={ZEN_CLOCK_STYLES}
            selectedFontId={zenClockStyle}
            onSelect={setZenClockStyle}
          />
        </div>

        {/* Feature Toggles */}
        <FeatureCard title="Zen Mode" description="Choose what to display in Zen Mode.">
          <div className="setting-pill">
            <button
              type="button"
              className={`setting-btn ${features.zenModeType === 'clock' ? 'active' : ''}`}
              onClick={() => setFeatures({ ...features, zenModeType: 'clock' })}
            >
              Clock
            </button>
            <button
              type="button"
              className={`setting-btn ${features.zenModeType === 'timer' ? 'active' : ''}`}
              onClick={() => setFeatures({ ...features, zenModeType: 'timer' })}
            >
              Timer
            </button>
          </div>
        </FeatureCard>

        <div style={{ height: '0.75rem' }} />

        <FeatureCard title="Zen Time Format" description="Switch between 12-hour and 24-hour display.">
          <div className="setting-pill">
            <button
              type="button"
              className={`setting-btn ${features.zenTimeFormat === '12h' ? 'active' : ''}`}
              onClick={() => setFeatures({ ...features, zenTimeFormat: '12h' })}
            >
              12H
            </button>
            <button
              type="button"
              className={`setting-btn ${features.zenTimeFormat === '24h' ? 'active' : ''}`}
              onClick={() => setFeatures({ ...features, zenTimeFormat: '24h' })}
            >
              24H
            </button>
          </div>
        </FeatureCard>

        {/* Relax */}
        <div style={{ marginTop: '3rem' }}>
          <h3>Relax</h3>
          <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.85rem', marginBottom: '1rem' }}>
            Personalize your landing experience.
          </p>
          <FeatureCard title="Time Format" description="Switch between 12-hour and 24-hour display on the Relax screen.">
            <div className="setting-pill">
              <button
                type="button"
                className={`setting-btn ${features.homeTimeFormat === '12h' ? 'active' : ''}`}
                onClick={() => setFeatures({ ...features, homeTimeFormat: '12h' })}
              >
                12H
              </button>
              <button
                type="button"
                className={`setting-btn ${features.homeTimeFormat === '24h' ? 'active' : ''}`}
                onClick={() => setFeatures({ ...features, homeTimeFormat: '24h' })}
              >
                24H
              </button>
            </div>
          </FeatureCard>
        </div>

        {/* Standard Typography */}
        <div style={{ marginTop: '3rem' }}>
          <h3>Standard Typography</h3>
          <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.85rem', marginBottom: '1rem' }}>
            Classic fonts for a clean and focused look.
          </p>
          <FontSelector
            fonts={CLOCK_FONTS}
            selectedFontId={clockFont}
            onSelect={setClockFont}
          />
        </div>
      </div>
    </div>
  );
};
