import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, Check } from 'lucide-react';

interface FrequencyDropdownProps {
    frequency: 'daily' | 'weekdays' | 'weekly' | 'custom';
    setFrequency: (freq: 'daily' | 'weekdays' | 'weekly' | 'custom') => void;
    isDropdownOpen: boolean;
    setIsDropdownOpen: (open: boolean) => void;
    dropdownRef: React.RefObject<HTMLDivElement | null>;
}

export const FrequencyDropdown = ({
    frequency,
    setFrequency,
    isDropdownOpen,
    setIsDropdownOpen,
    dropdownRef
}: FrequencyDropdownProps) => {
    return (
        <div className="ht-popup-select-container" ref={dropdownRef}>
            <button
                type="button"
                className={`ht-popup-select-trigger ${isDropdownOpen ? 'ht-popup-select-trigger--active' : ''}`}
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                aria-haspopup="listbox"
                aria-expanded={isDropdownOpen}
                aria-labelledby="panel-frequency-label"
            >
                <span>{frequency.charAt(0).toUpperCase() + frequency.slice(1)}</span>
                <ChevronDown className="ht-popup-select-trigger__arrow" size={16} />
            </button>

            <AnimatePresence>
                {isDropdownOpen && (
                    <motion.div
                        className="ht-popup-select-dropdown"
                        initial={{ opacity: 0, y: -8, scale: 0.95 }}
                        animate={{ opacity: 1, y: 4, scale: 1 }}
                        exit={{ opacity: 0, y: -8, scale: 0.95 }}
                        transition={{ duration: 0.15, ease: 'easeOut' }}
                        role="listbox"
                    >
                        {[
                            { value: 'daily', label: 'Daily' },
                            { value: 'weekdays', label: 'Weekdays' },
                            { value: 'weekly', label: 'Weekly' },
                            { value: 'custom', label: 'Custom' }
                        ].map(opt => {
                            const isSelected = frequency === opt.value;
                            return (
                                <button
                                    key={opt.value}
                                    type="button"
                                    className={`ht-popup-select-option ${isSelected ? 'ht-popup-select-option--active' : ''}`}
                                    onClick={() => {
                                        setFrequency(opt.value as any);
                                        setIsDropdownOpen(false);
                                    }}
                                    role="option"
                                    aria-selected={isSelected}
                                >
                                    <span>{opt.label}</span>
                                    {isSelected && <Check size={14} className="ht-popup-select-option__check" strokeWidth={3} />}
                                </button>
                            );
                        })}
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};
