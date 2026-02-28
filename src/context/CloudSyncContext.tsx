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
    syncTrigger: number;
}

const CloudSyncContext = createContext<CloudSyncContextType | undefined>(undefined);

export const CloudSyncProvider = ({ children }: { children: ReactNode }) => {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);
    const [syncStatus, setSyncStatus] = useState<SyncStatus>('idle');
    const [lastSyncedAt, setLastSyncedAt] = useState<Date | null>(null);
    const [syncTrigger, setSyncTrigger] = useState(0);

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

        // Increment trigger to notify other contexts to pull from cloud
        setSyncTrigger(prev => prev + 1);

        // We'll set a timeout to reset status to 'synced' if contexts don't report back
        // In a more complex app, we might wait for context signals
        setTimeout(() => {
            setSyncStatus('synced');
            setLastSyncedAt(new Date());
        }, 1500);
    };

    return (
        <CloudSyncContext.Provider value={{
            user,
            loading,
            syncStatus,
            setSyncStatus,
            lastSyncedAt,
            setLastSyncedAt,
            triggerSync,
            syncTrigger
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
