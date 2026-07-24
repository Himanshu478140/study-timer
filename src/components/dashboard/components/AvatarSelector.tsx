import React from 'react';
import { Sparkles, User } from 'lucide-react';

interface AvatarSelectorProps {
  customAvatar: string | null;
  setCustomAvatar: (avatar: string | null) => void;
}

export const AvatarSelector = ({ customAvatar, setCustomAvatar }: AvatarSelectorProps) => {
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
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
  };

  return (
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
            onChange={handleFileChange}
            style={{ display: 'none' }}
          />
        </div>
      </div>
    </div>
  );
};
