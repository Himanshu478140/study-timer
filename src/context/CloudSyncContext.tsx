import { createContext, useContext, useState, type ReactNode } from 'react';
import { type User } from 'firebase/auth';

export type SyncStatus = 'idle' | 'syncing' | 'synced' | 'error';

interface CloudSyncContextType {
    user: User | null;
    loading: boolean;
    syncStatus: SyncStatus;
    setSyncStatus: (status: SyncStatus) => void;
    lastSyncedAt: Date | null;
    setLastSyncedAt: (date: Date | null) => void;
    triggerSync: () => Promise<void>;
}

const CloudSyncContext = createContext<CloudSyncContextType | undefined>(undefined);

export const CloudSyncProvider = ({ children }: { children: ReactNode }) => {
    const [syncStatus, setSyncStatus] = useState<SyncStatus>('idle');
    const [lastSyncedAt, setLastSyncedAt] = useState<Date | null>(null);

    const triggerSync = async () => {
        // No-op since cloud sync is disabled
    };

    return (
        <CloudSyncContext.Provider value={{
            user: null,
            loading: false,
            syncStatus,
            setSyncStatus,
            lastSyncedAt,
            setLastSyncedAt,
            triggerSync
        }}>
            {children}
        </CloudSyncContext.Provider>
    );
};

export const useCloudSync = () => {
    const context = useContext(CloudSyncContext);
    if (context === undefined) {
        throw new Error('useCloudSync must be used within a CloudSyncProvider');
    }
    return context;
};
