export interface ElectronAPI {
    minimize: () => void;
    maximize: () => void;
    close: () => void;
    showNotification: (title: string, body: string) => void;
    setWindowMode: (mode: 'full' | 'widget') => void;
    onModeChanged: (callback: (mode: 'full' | 'widget') => void) => () => void;
    onStartSession: (callback: () => void) => () => void;
    drive: {
        connect: () => Promise<{ success: boolean; email?: string; error?: string }>;
        disconnect: () => Promise<{ success: boolean; error?: string }>;
        status: () => Promise<{ connected: boolean; email?: string; error?: string }>;
        backup: (payload: any) => Promise<{ success: boolean; folderId?: string; error?: string }>;
        restore: () => Promise<{ success: boolean; data?: any; error?: string }>;
        onProgress: (callback: (status: string) => void) => () => void;
    };
}

declare global {
    interface Window {
        electronAPI?: ElectronAPI;
    }
}
