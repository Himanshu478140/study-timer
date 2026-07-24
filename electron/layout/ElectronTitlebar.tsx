import React, { useState } from 'react';
import { Minus, Square, X, Copy } from 'lucide-react';

export const ElectronTitlebar: React.FC = () => {
    const [isMaximized, setIsMaximized] = useState(false);

    const handleMinimize = () => {
        window.electronAPI?.minimize();
    };

    const handleMaximize = () => {
        window.electronAPI?.maximize();
        setIsMaximized(prev => !prev);
    };

    const handleClose = () => {
        window.electronAPI?.close();
    };

    return (
        <header className="electron-titlebar" aria-label="Window controls">
            {/* Draggable space on the left */}
            <div style={{ flex: 1, height: '100%' }}></div>

            <div className="electron-titlebar-actions">
                <button
                    className="electron-titlebar-btn"
                    onClick={handleMinimize}
                    title="Minimize Window"
                    aria-label="Minimize"
                >
                    <Minus size={14} aria-hidden="true" />
                </button>

                <button
                    className="electron-titlebar-btn"
                    onClick={handleMaximize}
                    title={isMaximized ? "Restore Window" : "Maximize Window"}
                    aria-label={isMaximized ? "Restore" : "Maximize"}
                >
                    {isMaximized ? (
                        <Copy size={12} aria-hidden="true" style={{ transform: 'rotate(180deg)' }} />
                    ) : (
                        <Square size={12} aria-hidden="true" />
                    )}
                </button>

                <button
                    className="electron-titlebar-btn close-btn"
                    onClick={handleClose}
                    title="Close Window (Runs in background)"
                    aria-label="Close"
                >
                    <X size={14} aria-hidden="true" />
                </button>
            </div>
        </header>
    );
};
