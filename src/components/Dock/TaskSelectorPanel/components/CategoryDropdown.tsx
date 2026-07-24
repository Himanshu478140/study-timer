import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CATEGORIES, getCategoryIcon, getCategoryIconClass } from '../constants';
import type { CategoryDropdownProps } from '../types';

export const CategoryDropdown = ({ value, onChange, className = 'task-panel__cat-select' }: CategoryDropdownProps) => {
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleClickOutside = (e: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const selectedCategory = value;

    const handleSelect = (cat: string) => {
        onChange(cat);
        setIsOpen(false);
    };

    const isInline = className.includes('inline');
    const menuStyles: React.CSSProperties = isInline
        ? {
              position: 'absolute',
              bottom: '100%',
              left: 0,
              right: 0,
              marginBottom: '4px',
              minWidth: '120px',
              background: 'var(--fp-bg, rgba(18, 18, 22, 0.98))',
              border: '1px solid var(--fp-border, rgba(255, 255, 255, 0.06))',
              borderRadius: '0.5rem',
              padding: '0.25rem',
              margin: 0,
              listStyle: 'none',
              zIndex: 10000,
              boxShadow: '0 8px 24px rgba(0,0,0,0.3)',
              display: 'flex',
              flexDirection: 'column',
              gap: '2px'
          }
        : {
              position: 'absolute',
              top: '100%',
              left: 0,
              right: 0,
              marginTop: '4px',
              minWidth: '120px',
              background: 'var(--tp-bg, rgba(18, 18, 22, 0.98))',
              border: '1px solid var(--tp-card-border, rgba(255, 255, 255, 0.06))',
              borderRadius: '0.5rem',
              padding: '0.25rem',
              margin: 0,
              listStyle: 'none',
              zIndex: 10000,
              boxShadow: '0 8px 24px rgba(0,0,0,0.3)',
              display: 'flex',
              flexDirection: 'column',
              gap: '2px'
          };

    const prefersReduced = typeof window !== 'undefined' ? window.matchMedia('(prefers-reduced-motion: reduce)').matches : false;
    const transitionProps = prefersReduced ? { duration: 0 } : { duration: 0.15, ease: 'easeOut' as const };
    const animateProps = prefersReduced ? { opacity: 1 } : { opacity: 1, y: 0, scale: 1 };
    const initialProps = prefersReduced ? { opacity: 0 } : { opacity: 0, y: isInline ? 8 : -8, scale: 0.96 };
    const exitProps = prefersReduced ? { opacity: 0 } : { opacity: 0, y: isInline ? 8 : -8, scale: 0.96 };

    return (
        <div ref={dropdownRef} className={`custom-dropdown ${className}-wrapper`} style={{ position: 'relative', display: 'inline-block' }}>
            <button
                type="button"
                className={`custom-dropdown__trigger ${className}`}
                onClick={() => setIsOpen(!isOpen)}
                aria-haspopup="listbox"
                aria-expanded={isOpen}
                style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.375rem',
                    textAlign: 'left'
                }}
            >
                <span className="custom-dropdown__trigger-icon" style={{ display: 'flex', alignItems: 'center' }}>
                    {getCategoryIcon(selectedCategory)}
                </span>
                <span className="custom-dropdown__trigger-label">{selectedCategory}</span>
                <span className="custom-dropdown__trigger-arrow">▼</span>
            </button>

            <AnimatePresence>
                {isOpen && (
                    <motion.ul
                        role="listbox"
                        initial={initialProps}
                        animate={animateProps}
                        exit={exitProps}
                        transition={transitionProps}
                        className="custom-dropdown__menu"
                        style={menuStyles}
                    >
                        {CATEGORIES.map(cat => (
                            <li
                                key={cat}
                                role="option"
                                aria-selected={cat === selectedCategory}
                                onClick={() => handleSelect(cat)}
                                className={`custom-dropdown__item ${cat === selectedCategory ? 'custom-dropdown__item--selected' : ''}`}
                                style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '0.5rem',
                                    padding: '0.375rem 0.5rem',
                                    fontSize: '0.6875rem',
                                    fontWeight: 600,
                                    borderRadius: '0.375rem',
                                    cursor: 'pointer',
                                    transition: 'all 0.15s ease',
                                    color: cat === selectedCategory ? 'var(--color-accent, #818cf8)' : 'var(--tp-text-secondary)',
                                    background: cat === selectedCategory ? 'rgba(129, 140, 248, 0.08)' : 'transparent',
                                    textTransform: 'uppercase',
                                    letterSpacing: '0.05em'
                                }}
                            >
                                <span className={`custom-dropdown__item-icon ${getCategoryIconClass(cat)}`} style={{ display: 'flex', alignItems: 'center' }}>
                                    {getCategoryIcon(cat)}
                                </span>
                                <span>{cat}</span>
                            </li>
                        ))}
                    </motion.ul>
                )}
            </AnimatePresence>
        </div>
    );
};