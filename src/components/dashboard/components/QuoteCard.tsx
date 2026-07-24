import { X } from 'lucide-react';

interface QuoteCardProps {
  quote: string;
  selectedQuote: string;
  isCustom: boolean;
  onSelect: () => void;
  onRemove?: () => void;
}

export const QuoteCard = ({
  quote,
  selectedQuote,
  isCustom,
  onSelect,
  onRemove
}: QuoteCardProps) => {
  const isActive = selectedQuote === quote;

  return (
    <div
      className={`quote-selection-card ${isCustom ? 'custom' : 'preset'} ${isActive ? 'active' : ''}`}
      onClick={onSelect}
      style={{
        padding: '1.5rem',
        background: isActive ? 'rgba(var(--color-accent-rgb), 0.25)' : 'rgba(18, 18, 22, 0.85)',
        border: `1px solid ${isActive ? 'var(--color-accent)' : 'rgba(255,255,255,0.08)'}`,
        borderRadius: '1rem',
        cursor: 'pointer',
        transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
        position: 'relative'
      }}
    >
      <p style={{
        margin: 0,
        fontSize: '1rem',
        fontStyle: 'italic',
        color: isActive ? 'white' : 'rgba(255,255,255,0.7)',
        fontWeight: isActive ? 600 : 400,
        paddingRight: isCustom ? '2.5rem' : '0'
      }}>
        "{quote}"
      </p>

      {isCustom && onRemove && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            onRemove();
          }}
          style={{
            position: 'absolute',
            right: '1rem',
            top: '50%',
            transform: 'translateY(-50%)',
            background: 'rgba(255,50,50,0.15)',
            color: '#ff6b6b',
            border: 'none',
            padding: '0.4rem',
            borderRadius: '0.4rem',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}
          title="Delete Quote"
        >
          <X size={14} />
        </button>
      )}

      {isActive && (
        <div style={{
          position: 'absolute',
          top: '0.5rem',
          right: isCustom ? '3rem' : '0.5rem',
          background: 'var(--color-accent)',
          padding: '2px 8px',
          borderRadius: '1rem',
          fontSize: '0.6rem',
          fontWeight: 800,
          textTransform: 'uppercase'
        }}>Active</div>
      )}
    </div>
  );
};
