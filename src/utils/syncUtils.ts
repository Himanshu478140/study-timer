import {
    doc,
    setDoc,
    collection,
    getDocs,
    query,
    where,
    deleteDoc,
    Timestamp,
    writeBatch
} from 'firebase/firestore';
import { db } from '../lib/firebase';

/**
 * 30-Day Retention Policy
 * Deletes documents in a collection that represent data older than 30 days.
 */
export const cleanupOldData = async (userId: string, collectionName: string, dateField: string = 'date') => {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    const thirtyDaysAgoStr = thirtyDaysAgo.toISOString().split('T')[0];

    const colRef = collection(db, 'users', userId, collectionName);
    const q = query(colRef, where(dateField, '<', thirtyDaysAgoStr));

    const snapshot = await getDocs(q);
    const batch = writeBatch(db);

    snapshot.docs.forEach((d) => {
        batch.delete(d.ref);
    });

    if (snapshot.size > 0) {
        await batch.commit();
        console.log(`Cloud Cleanup: Deleted ${snapshot.size} old docs from ${collectionName}`);
    }
};

/**
 * Syncs a single document to Firestore (User profile/stats/preferences)
 */
export const syncDoc = async (userId: string, docName: string, data: any) => {
    if (!userId) return;
    try {
        const userDoc = doc(db, 'users', userId);
        await setDoc(userDoc, {
            [docName]: data,
            lastSynced: Timestamp.now()
        }, { merge: true });
    } catch (e) {
        console.error(`Sync Error [${docName}]:`, e);
    }
};

/**
 * Syncs an entire collection item to Firestore
 * Used for individual sessions, habits, tasks, events
 */
export const syncCollectionItem = async (userId: string, collectionName: string, itemId: string, data: any) => {
    if (!userId || !itemId) return;
    try {
        const itemDoc = doc(db, 'users', userId, collectionName, itemId);
        await setDoc(itemDoc, {
            ...data,
            lastSynced: Timestamp.now()
        }, { merge: true });
    } catch (e) {
        console.error(`Sync Error [${collectionName}/${itemId}]:`, e);
    }
};

/**
 * Deletes a collection item from Firestore
 */
export const deleteCollectionItem = async (userId: string, collectionName: string, itemId: string) => {
    if (!userId || !itemId) return;
    try {
        const itemDoc = doc(db, 'users', userId, collectionName, itemId);
        await deleteDoc(itemDoc);
    } catch (e) {
        console.error(`Delete Error [${collectionName}/${itemId}]:`, e);
    }
};

/**
 * Loads all sub-collection data for a user
 */
export const loadCollection = async (userId: string, collectionName: string) => {
    if (!userId) return [];
    try {
        const colRef = collection(db, 'users', userId, collectionName);
        const snapshot = await getDocs(colRef);
        return snapshot.docs.map(d => ({ ...d.data(), id: d.id }));
    } catch (e) {
        console.error(`Load Error [${collectionName}]:`, e);
        return [];
    }
};

/**
 * Loads the main user document
 */
export const loadUserDoc = async (userId: string) => {
    if (!userId) return null;
    try {
        const userRef = doc(db, 'users', userId);
        const snapshot = await getDocs(query(collection(db, 'users'), where('__name__', '==', userRef.id)));
        if (!snapshot.empty) {
            return snapshot.docs[0].data();
        }
        return null;
    } catch (e) {
        console.error("Load User Doc Error:", e);
        return null;
    }
};
