import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore, initializeFirestore, memoryLocalCache } from 'firebase/firestore';

const firebaseConfig = {
    apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY ?? "AIzaSyCC_2u9drn6W7YkitrLhWbCluwJ1DI60ls",
    authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN ?? "sayamoe-english-app.firebaseapp.com",
    projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID ?? "sayamoe-english-app",
    storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET ?? "sayamoe-english-app.firebasestorage.app",
    messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID ?? "232966993471",
    appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID ?? "1:232966993471:web:f0f8f957d1135785de2a8a"
};

const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();

export const auth = getAuth(app);

// Safely initialize Firestore — avoid "already initialized" error on hot reloads / SSR
function getDb() {
    try {
        // Try to initialize with memoryLocalCache (avoids IndexedDB issues on Safari/iOS)
        return initializeFirestore(app, {
            localCache: memoryLocalCache()
        });
    } catch {
        // Already initialized — just return the existing instance
        return getFirestore(app);
    }
}

export const db = getDb();
