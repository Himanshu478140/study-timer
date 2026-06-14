export interface ElectronAPI {
    minimize: () => void;
    maximize: () => void;
    close: () => void;
    showNotification: (title: string, body: string) => void;
    setWindowMode: (mode: 'full' | 'widget') => void;
    appReady: () => void;
    onModeChanged: (callback: (mode: 'full' | 'widget') => void) => () => void;
    onStartSession: (callback: () => void) => () => void;
}

declare global {
    interface Window {
        electronAPI?: ElectronAPI;
    }
}
