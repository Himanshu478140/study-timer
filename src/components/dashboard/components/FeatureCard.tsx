import React from 'react';

interface FeatureCardProps {
  title: string;
  description: string;
  children: React.ReactNode;
}

export const FeatureCard = ({ title, description, children }: FeatureCardProps) => {
  return (
    <div className="feature-card feature-row-card" style={{ background: 'rgba(18, 18, 22, 0.8)', border: '1px solid rgba(255, 255, 255, 0.08)', padding: '1rem', borderRadius: '1rem' }}>
      <div className="feature-info">
        <h3 style={{ margin: 0, fontSize: '0.95rem', fontWeight: 700 }}>{title}</h3>
        <p style={{ margin: '4px 0 0 0', fontSize: '0.8rem', color: 'rgba(255, 255, 255, 0.5)' }}>{description}</p>
      </div>
      {children}
    </div>
  );
};
