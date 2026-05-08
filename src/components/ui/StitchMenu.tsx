import { motion, AnimatePresence } from 'framer-motion';
import { 
    LayoutGrid, Clock, BarChart2, Quote, Sparkles, User, 
    Info, HelpCircle, MessageSquare 
} from 'lucide-react';
import type { DashboardTab } from '../dashboard/Dashboard';
import './StitchMenu.css';

interface StitchMenuProps {
    isOpen: boolean;
    onClose: () => void;
    onOpenSection: (section: DashboardTab) => void;
}

export const StitchMenu = ({ isOpen, onClose, onOpenSection }: StitchMenuProps) => {
    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    {/* Backdrop */}
                    <div className="stitch-menu-backdrop" onClick={onClose} />
                    
                    {/* Menu Content */}
                    <motion.div 
                        initial={{ opacity: 0, scale: 0.95, y: -10 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: -10 }}
                        transition={{ duration: 0.2, ease: "easeOut" }}
                        className="stitch-menu-container"
                    >
                        <div className="stitch-menu-section">
                            <button className="stitch-menu-item" onClick={() => { onOpenSection('themes'); onClose(); }}>
                                <LayoutGrid size={18} />
                                <span>Themes</span>
                            </button>
                            <button className="stitch-menu-item" onClick={() => { onOpenSection('clock'); onClose(); }}>
                                <Clock size={18} />
                                <span>Clock</span>
                            </button>
                            <button className="stitch-menu-item" onClick={() => { onOpenSection('stats'); onClose(); }}>
                                <BarChart2 size={18} />
                                <span>Stats</span>
                            </button>
                            <button className="stitch-menu-item" onClick={() => { onOpenSection('quotes'); onClose(); }}>
                                <Quote size={18} />
                                <span>Quotes</span>
                            </button>
                            <button className="stitch-menu-item" onClick={() => { onOpenSection('features'); onClose(); }}>
                                <Sparkles size={18} />
                                <span>Features</span>
                            </button>
                        </div>

                        <div className="stitch-menu-divider" />

                        <div className="stitch-menu-section">
                            <button className="stitch-menu-item" onClick={() => { onOpenSection('account'); onClose(); }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%', alignItems: 'center' }}>
                                    <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
                                        <User size={18} />
                                        <span>Account</span>
                                    </div>
                                    <div className="notification-dot" />
                                </div>
                            </button>
                            <button className="stitch-menu-item" onClick={() => { onOpenSection('about'); onClose(); }}>
                                <Info size={18} />
                                <span>About</span>
                            </button>
                        </div>

                        <div className="stitch-menu-divider" />

                        <div className="stitch-menu-section">
                            <button className="stitch-menu-item" onClick={() => { onOpenSection('help'); onClose(); }}>
                                <HelpCircle size={18} />
                                <span>Help / Guide</span>
                            </button>
                            <button className="stitch-menu-item" onClick={() => { onOpenSection('support'); onClose(); }}>
                                <MessageSquare size={18} />
                                <span>Support</span>
                            </button>
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
};
