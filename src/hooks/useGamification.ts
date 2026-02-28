import { useState, useEffect } from 'react';
import { auth } from '../lib/firebase';
import { onAuthStateChanged, type User } from 'firebase/auth';
import { syncDoc, loadUserDoc } from '../utils/syncUtils';

const XP_FACTOR = 100; // XP per level

export interface UserStats {
    xp: number;
    level: number;
    streak: number;
    lastSessionDate: string | null;
}

export const useGamification = () => {
    const [user, setUser] = useState<User | null>(null);
    const [stats, setStats] = useState<UserStats>(() => {
        const stored = localStorage.getItem('study-timer-stats');
        return stored ? JSON.parse(stored) : { xp: 0, level: 1, streak: 0, lastSessionDate: null };
    });

    const [notification, setNotification] = useState<string | null>(null);

    // Auth Listener
    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
            setUser(currentUser);
        });
        return () => unsubscribe();
    }, []);

    // Initial Cloud Load
    useEffect(() => {
        if (!user) return;

        const syncFromCloud = async () => {
            console.log("Cloud Sync: Syncing Gamification...");
            const cloudUserDoc = await loadUserDoc(user.uid);
            if (cloudUserDoc?.gamification) {
                const cloudStats = cloudUserDoc.gamification;
                setStats(prev => {
                    // Merge: Cloud takes precedence if XP is higher or dates match
                    if (cloudStats.xp > prev.xp) return cloudStats;

                    // If local is higher, push to cloud
                    syncDoc(user.uid, 'gamification', prev);
                    return prev;
                });
            } else {
                // First time user: push local stats to cloud
                syncDoc(user.uid, 'gamification', stats);
            }
        };

        syncFromCloud();
    }, [user]);

    useEffect(() => {
        localStorage.setItem('study-timer-stats', JSON.stringify(stats));
    }, [stats]);

    const awardXP = (amount: number) => {
        setStats((prev) => {
            const newXP = prev.xp + amount;
            const newLevel = Math.floor(newXP / XP_FACTOR) + 1;

            if (newLevel > prev.level) {
                setNotification(`Level Up! You represent level ${newLevel} now!`);
                setTimeout(() => setNotification(null), 5000);
            } else {
                setNotification(`+${amount} XP`);
                setTimeout(() => setNotification(null), 3000);
            }

            const updatedStats = {
                ...prev,
                xp: newXP,
                level: newLevel,
            };

            if (user) syncDoc(user.uid, 'gamification', updatedStats);
            return updatedStats;
        });
    };

    return {
        level: stats.level,
        xp: stats.xp,
        awardXP,
        notification
    };
};
