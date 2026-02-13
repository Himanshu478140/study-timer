import { useState, useRef, useEffect } from 'react';
import { ChevronDown, Check, Sun, Moon, Zap, Trash2 } from 'lucide-react';
import './PremiumSelect.css';

interface Option {
    id: string;
    label: string | React.ReactNode;
    icon?: React.ReactNode;
}

interface PremiumSelectProps {
    options: Option[];
    value: string;
    onChange: (value: string) => void;
    placeholder?: string;
}

export const PremiumSelect = ({ options, value, onChange, placeholder = "Select...", onDelete }: PremiumSelectProps & { onDelete?: () => void }) => {
    const [isOpen, setIsOpen] = useState(false);
    const containerRef = useRef<HTMLDivElement>(null);

    const selectedOption = options.find(opt => opt.id === value);

    // Click outside to close
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    return (
        <div className="premium-select-container" ref={containerRef}>
            {/* Trigger Area */}
            <div
                className="select-trigger"
                onClick={() => setIsOpen(!isOpen)}
            >
                <div className="icon-box">
                    {selectedOption?.icon}
                    <span>{selectedOption?.label || placeholder}</span>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    {/* Integrated Delete Button */}
                    {onDelete && value && value !== 'create_new' && (
                        <div
                            onClick={(e) => {
                                e.stopPropagation();
                                onDelete();
                            }}
                            style={{
                                opacity: 0.6,
                                cursor: 'pointer',
                                display: 'flex',
                                padding: '4px'
                            }}
                            className="interactive-hover"
                            title="Delete Task"
                        >
                            <Trash2 size={16} />
                        </div>
                    )}

                    <ChevronDown
                        size={20}
                        style={{
                            transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)',
                            transition: 'transform 0.3s ease',
                            color: '#059669'
                        }}
                    />
                </div>
            </div>

            {/* Dropdown Panel */}
            {isOpen && (
                <div className="dropdown-panel">
                    {options.map((option) => {
                        const isSelected = option.id === value;
                        return (
                            <div
                                key={option.id}
                                className={`option-item ${isSelected ? 'selected' : ''}`}
                                onClick={() => {
                                    onChange(option.id);
                                    setIsOpen(false);
                                }}
                            >
                                <div className="icon-box">
                                    {isSelected ? <Check size={18} strokeWidth={3} /> : (option.icon || <div style={{ width: 18 }} />)}
                                    <span>{option.label}</span>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
};

// Demo/Usage Exporter to easily plug into App for preview
export const PremiumSelectDemo = () => {
    const [val, setVal] = useState('design');

    const options = [
        { id: 'design', label: 'Design System', icon: <Sun size={18} /> },
        { id: 'light', label: 'Light Mode', icon: <Sun size={18} /> },
        { id: 'dark', label: 'Dark Mode', icon: <Moon size={18} /> },
        { id: 'performance', label: 'High Power', icon: <Zap size={18} /> },
    ];

    return (
        <div style={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            height: '100%',
            width: '100%',
            background: '#f3f4f6' // Needed for neumorphism contrast
        }}>
            <PremiumSelect
                options={options}
                value={val}
                onChange={setVal}
            />
        </div>
    );
};
