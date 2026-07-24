/**
 * Support tab displaying quick help questions, developer contacts, and storage guidelines.
 */
export const SupportTab = () => {
  return (
    <div className="dashboard-section animate-fade-in" style={{ maxWidth: '800px', margin: '0 auto' }}>
      <h2 style={{ marginBottom: '0.5rem' }}>Help & Support</h2>
      <p style={{ marginBottom: '2rem', color: 'rgba(255,255,255,0.6)' }}>
        Have a question, feedback, or found a bug? Email me directly at <a href="mailto:feedbackhimanshu065@gamil.com" style={{ color: 'var(--color-accent)', textDecoration: 'none' }}>feedbackhimanshu065@gamil.com</a>
      </p>

      {/* Quick FAQ Section */}
      <div className="faq-container-new" style={{ marginTop: '0' }}>
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
  );
};
