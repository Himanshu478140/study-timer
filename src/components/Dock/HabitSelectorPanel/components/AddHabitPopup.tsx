import React, { useState, useRef, useEffect } from 'react';
import { X, Dumbbell, Sprout, BookOpen, Palette } from 'lucide-react';
import { FrequencyDropdown } from './FrequencyDropdown';
import { ICON_TO_EMOJI } from '../utils/constants';

interface AddHabitPopupProps {
    onClose: () => void;
    onSubmit: (name: string, icon: string, goal: string, freq: 'daily' | 'weekdays' | 'weekly' | 'custom', activeDays: string[]) => void;
}

export const AddHabitPopup = ({ onClose, onSubmit }: AddHabitPopupProps) => {
    const [newHabitName, setNewHabitName] = useState('');
    const [selectedIcon, setSelectedIcon] = useState<'dumbbell' | 'sprout' | 'book' | 'palette'>('dumbbell');
    const [habitGoal, setHabitGoal] = useState('');
    const [frequency, setFrequency] = useState<'daily' | 'weekdays' | 'weekly' | 'custom'>('daily');
    const [selectedDays, setSelectedDays] = useState<Record<string, boolean>>({
        Mon: true,
        Tue: true,
        Wed: true,
        Thu: true,
        Fri: true,
        Sat: true,
        Sun: true
    });
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (!isDropdownOpen) return;
        const handleClickOutside = (e: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
                setIsDropdownOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [isDropdownOpen]);

    const handleSubmitLocal = (e: React.FormEvent) => {
        e.preventDefault();
        if (newHabitName.trim()) {
            const emoji = ICON_TO_EMOJI[selectedIcon] || '🧘';
            let activeDaysList: string[] = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
            if (frequency === 'custom') {
                activeDaysList = Object.keys(selectedDays).filter(d => selectedDays[d]);
            } else if (frequency === 'weekdays') {
                activeDaysList = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'];
            }
            onSubmit(newHabitName.trim(), emoji, habitGoal.trim(), frequency, activeDaysList);
        }
    };

    return (
        <form className="ht-popup" onSubmit={handleSubmitLocal}>
            <div className="ht-popup-header">
                <h3 className="ht-popup-title">New Habit</h3>
                <button
                    type="button"
                    className="ht-popup-close"
                    onClick={onClose}
                    aria-label="Close"
                >
                    <X size={14} />
                </button>
            </div>

            <div className="ht-popup-field">
                <label className="ht-popup-label" htmlFor="panel-habit-name">Habit Name</label>
                <input
                    id="panel-habit-name"
                    className="ht-popup-input"
                    type="text"
                    placeholder="e.g., Morning Yoga"
                    value={newHabitName}
                    onChange={e => setNewHabitName(e.target.value)}
                    autoFocus
                    required
                />
            </div>

            <div className="ht-popup-field">
                <span className="ht-popup-label">Icon</span>
                <div className="ht-popup-icon-row" role="radiogroup" aria-label="Select icon">
                    {(['dumbbell', 'sprout', 'book', 'palette'] as const).map(iconType => {
                        const Icon = iconType === 'dumbbell' ? Dumbbell :
                                     iconType === 'sprout' ? Sprout :
                                     iconType === 'book' ? BookOpen : Palette;
                        return (
                            <button
                                key={iconType}
                                type="button"
                                className={`ht-popup-icon-btn ${selectedIcon === iconType ? 'ht-popup-icon-btn--active' : ''}`}
                                onClick={() => setSelectedIcon(iconType)}
                                aria-label={`${iconType} icon`}
                                role="radio"
                                aria-checked={selectedIcon === iconType}
                            >
                                <Icon size={16} />
                            </button>
                        );
                    })}
                </div>
            </div>

            <div className="ht-popup-cols">
                <div className="ht-popup-field" style={{ zIndex: 110 }}>
                    <label className="ht-popup-label" id="panel-frequency-label">Frequency</label>
                    <FrequencyDropdown
                        frequency={frequency}
                        setFrequency={setFrequency}
                        isDropdownOpen={isDropdownOpen}
                        setIsDropdownOpen={setIsDropdownOpen}
                        dropdownRef={dropdownRef}
                    />
                </div>
                <div className="ht-popup-field">
                    <label className="ht-popup-label" htmlFor="panel-habit-goal">Goal</label>
                    <input
                        id="panel-habit-goal"
                        className="ht-popup-input"
                        type="text"
                        placeholder="e.g., 30 mins"
                        value={habitGoal}
                        onChange={e => setHabitGoal(e.target.value)}
                    />
                </div>
            </div>

            {frequency === 'custom' && (
                <div className="ht-popup-day-row">
                    <span className="ht-popup-day-label">DAYS</span>
                    <div className="ht-popup-day-chips" role="group" aria-label="Select active days">
                        {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map(day => {
                            const isActive = selectedDays[day];
                            const letter = day.charAt(0);
                            return (
                                <button
                                    key={day}
                                    type="button"
                                    className={`ht-popup-day-btn ${isActive ? 'ht-popup-day-btn--active' : ''}`}
                                    onClick={() => {
                                        setSelectedDays(prev => ({
                                            ...prev,
                                            [day]: !prev[day]
                                        }));
                                    }}
                                    aria-pressed={isActive}
                                    aria-label={`Toggle ${day}`}
                                >
                                    {letter}
                                </button>
                            );
                        })}
                    </div>
                </div>
            )}

            <div className="ht-popup-footer">
                <button
                    type="button"
                    className="ht-popup-btn--cancel"
                    onClick={onClose}
                >
                    Cancel
                </button>
                <button type="submit" className="ht-popup-btn--submit">
                    Add Habit
                </button>
            </div>
        </form>
    );
};
