import { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import { auth } from '../lib/firebase';
import { onAuthStateChanged, type User } from 'firebase/auth';

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
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);
    const [syncStatus, setSyncStatus] = useState<SyncStatus>('idle');
    const [lastSyncedAt, setLastSyncedAt] = useState<Date | null>(null);

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
            setUser(currentUser);
            setLoading(false);
            console.log("CloudSync: User state changed", currentUser?.email);
        });
        return () => unsubscribe();
    }, []);

    const triggerSync = async () => {
        if (!user) return;
        setSyncStatus('syncing');
        // This will be coordinated with other contexts
        // For now, it just signals a sync intent
        try {
            // Mock delay or wait for context signals
            setSyncStatus('synced');
            setLastSyncedAt(new Date());
        } catch (e) {
            setSyncStatus('error');
        }
    };

    return (
        <CloudSyncContext.Provider value={{
            user,
            loading,
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
