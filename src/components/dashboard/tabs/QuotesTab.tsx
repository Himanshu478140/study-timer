import { useState } from 'react';
import { FontSelector } from '../components/FontSelector';
import { QuoteCard } from '../components/QuoteCard';
import { QUOTE_FONTS, PRESET_QUOTES } from '../utils/constants';

interface QuotesTabProps {
  selectedQuote: string;
  setSelectedQuote: (quote: string) => void;
  customQuotes: string[];
  onAddQuote: (quote: string) => void;
  onRemoveQuote: (quote: string) => void;
  quoteFont: string;
  setQuoteFont: (font: string) => void;
}

export const QuotesTab = ({
  selectedQuote,
  setSelectedQuote,
  customQuotes,
  onAddQuote,
  onRemoveQuote,
  quoteFont,
  setQuoteFont
}: QuotesTabProps) => {
  const [newQuoteText, setNewQuoteText] = useState('');

  const handleAdd = () => {
    if (newQuoteText.trim()) {
      onAddQuote(newQuoteText.trim());
      setNewQuoteText('');
    }
  };

  return (
    <div className="dashboard-section">
      <h2>Inspiration</h2>
      <p style={{ color: 'rgba(255,255,255,0.7)', marginBottom: '1.5rem' }}>Choose or add a quote that resonates with you today.</p>

      {/* Quote Typography Selection */}
      <div className="setting-group" style={{ marginBottom: '2rem' }}>
        <label style={{ display: 'block', marginBottom: '1rem', color: 'rgba(255,255,255,0.7)', fontSize: '0.8rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
          Quote Typography
        </label>
        <FontSelector
          fonts={QUOTE_FONTS}
          selectedFontId={quoteFont}
          sampleText="Aa"
          onSelect={setQuoteFont}
        />
      </div>

      {/* Add Custom Quote Input */}
      <div className="custom-quote-input-wrapper" style={{ marginBottom: '2rem' }}>
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <input
            type="text"
            placeholder="Add your own inspiration..."
            value={newQuoteText}
            onChange={(e) => setNewQuoteText(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') handleAdd();
            }}
            style={{
              flex: 1,
              padding: '0.8rem 1.2rem',
              borderRadius: '0.8rem',
              background: 'rgba(18, 18, 22, 0.8)',
              border: '1px solid rgba(255,255,255,0.12)',
              color: 'white',
              fontSize: '0.9rem'
            }}
          />
          <button
            type="button"
            onClick={handleAdd}
            className="interactive-press"
            style={{
              padding: '0 1.2rem',
              borderRadius: '0.8rem',
              background: 'var(--color-accent)',
              color: 'white',
              border: 'none',
              fontWeight: 600,
              cursor: 'pointer'
            }}
          >
            Add
          </button>
        </div>
      </div>

      <div className="quote-grid" style={{ display: 'grid', gap: '1rem' }}>
        {/* Preset Quotes */}
        {PRESET_QUOTES.map(q => (
          <QuoteCard
            key={q}
            quote={q}
            selectedQuote={selectedQuote}
            isCustom={false}
            onSelect={() => setSelectedQuote(q)}
          />
        ))}

        {/* Custom Quotes */}
        {customQuotes.map(q => (
          <QuoteCard
            key={q}
            quote={q}
            selectedQuote={selectedQuote}
            isCustom={true}
            onSelect={() => setSelectedQuote(q)}
            onRemove={() => onRemoveQuote(q)}
          />
        ))}
      </div>
    </div>
  );
};
