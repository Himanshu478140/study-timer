import { useEffect, useRef } from 'react';

interface SlidePanelProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
}

export const SlidePanel = ({ isOpen, onClose, title, children }: SlidePanelProps) => {
  const panelRef = useRef<HTMLDivElement>(null);

  // Close on Escape
  useEffect(() => {
    if (!isOpen) return;
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', handleKey);
    return () => document.removeEventListener('keydown', handleKey);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className="slide-panel__backdrop"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Panel */}
      <div
        ref={panelRef}
        className="slide-panel"
        role="dialog"
        aria-modal="true"
        aria-label={title}
      >
        <header className="slide-panel__header">
          <h2 className="slide-panel__title">{title}</h2>
          <button
            className="slide-panel__close"
            onClick={onClose}
            aria-label="Close panel"
          >
            ✕
          </button>
        </header>
        <div className="slide-panel__body">
          {children}
        </div>
      </div>
    </>
  );
};
