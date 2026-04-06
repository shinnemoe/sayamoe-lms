import { initializeApp, getApps } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { initializeFirestore, memoryLocalCache } from 'firebase/firestore';

const firebaseConfig = {
    apiKey: "AIzaSyCC_2u9drn6W7YkitrLhWbCluwJ1DI60ls",
    authDomain: "sayamoe-english-app.firebaseapp.com",
    projectId: "sayamoe-english-app",
    storageBucket: "sayamoe-english-app.firebasestorage.app",
    messagingSenderId: "232966993471",
    appId: "1:232966993471:web:f0f8f957d1135785de2a8a"
};

const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];

export const auth = getAuth(app);
// Use memoryLocalCache to avoid IndexedDB issues on iOS Safari
export const db = initializeFirestore(app, {
    localCache: memoryLocalCache()
});
