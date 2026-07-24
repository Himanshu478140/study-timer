import { Sparkles, Github } from 'lucide-react';

interface AboutTabProps {
  copied: boolean;
  setCopied: (copied: boolean) => void;
}

export const AboutTab = ({ copied, setCopied }: AboutTabProps) => {
  const handleCopyLink = (e: React.MouseEvent) => {
    e.preventDefault();
    navigator.clipboard.writeText("https://focora-timer.vercel.app/");
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
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

        {/* Tier 1 — The one-liner */}
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

        {/* Tier 2 — The context */}
        <p style={{
          margin: 0,
          fontSize: '1.05rem',
          fontWeight: 400,
          lineHeight: '1.6',
          color: 'rgba(255, 255, 255, 0.6)'
        }}>
          Built for myself, shared publicly. No features for features' sake.
        </p>

        {/* Tier 3 — The blockquote disclaimer */}
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
                type="button"
                onClick={handleCopyLink}
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
  );
};
