
"use client";

import { initializeApp, getApps, getApp, type FirebaseApp, type FirebaseOptions } from "firebase/app";
import { getFirestore } from "firebase/firestore";

const firebaseConfig: FirebaseOptions = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID
};

function getFirebaseApp(): FirebaseApp {
    if (getApps().length > 0) {
        return getApp();
    }
    
    // Check for missing keys only on the client-side
    if (typeof window !== 'undefined' && !firebaseConfig.apiKey) {
        console.error("Firebase config is missing API key.");
    }
    
    return initializeApp(firebaseConfig);
}

// Lazy-initialized instances
let app: FirebaseApp | null = null;
let db: ReturnType<typeof getFirestore> | null = null;

function getClientInstances() {
    if (!app) {
        app = getFirebaseApp();
        db = getFirestore(app);
    }
    return { app, db };
}

export { getClientInstances };
