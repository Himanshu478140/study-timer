import { useState, useCallback, useRef } from 'react';

interface PiPOptions {
    width?: number;
    height?: number;
    onClose?: () => void;
}

export const useDocumentPiP = () => {
    const [pipWindow, setPipWindow] = useState<Window | null>(null);
    const pipWindowRef = useRef<Window | null>(null);

    const closePiP = useCallback(() => {
        if (pipWindowRef.current) {
            pipWindowRef.current.close();
            pipWindowRef.current = null;
            setPipWindow(null);
        }
    }, []);

    const requestPiP = useCallback(async ({ width = 300, height = 300, onClose }: PiPOptions = {}) => {
        // Check if supported
        if (!('documentPictureInPicture' in window)) {
            alert("Document Picture-in-Picture is not supported in this browser. Try Chrome or Edge.");
            return;
        }

        try {
            // Close existing if open
            if (pipWindowRef.current) {
                closePiP();
                return; // Toggle behavior
            }

            // @ts-ignore - TS might not know about documentPictureInPicture yet
            const win = await window.documentPictureInPicture.requestWindow({
                width,
                height,
            });

            // Copy style sheets
            // This is crucial for Tailwind/CSS modules to work in the new window
            [...document.styleSheets].forEach((styleSheet) => {
                try {
                    const cssRules = [...styleSheet.cssRules]
                        .map((rule) => rule.cssText)
                        .join('');
                    const style = document.createElement('style');
                    style.textContent = cssRules;
                    win.document.head.appendChild(style);
                } catch (e) {
                    const link = document.createElement('link');
                    link.rel = 'stylesheet';
                    link.type = styleSheet.type;
                    link.media = styleSheet.media.toString();
                    link.href = styleSheet.href || '';
                    win.document.head.appendChild(link);
                }
            });

            // Also copy links for external fonts/styles
            Array.from(document.head.querySelectorAll('link[rel="stylesheet"], style')).forEach((style) => {
                win.document.head.appendChild(style.cloneNode(true));
            });


            win.addEventListener('pagehide', () => {
                setPipWindow(null);
                pipWindowRef.current = null;
                if (onClose) onClose();
            });

            pipWindowRef.current = win;
            setPipWindow(win);

        } catch (err) {
            console.error("Failed to open PiP window:", err);
        }
    }, [closePiP]);

    return {
        pipWindow,
        requestPiP,
        closePiP
    };
};
