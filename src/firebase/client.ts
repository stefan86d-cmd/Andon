"use client";

import { initializeApp, getApps, getApp, type FirebaseApp, type FirebaseOptions } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";

const firebaseConfig: FirebaseOptions = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

// Singleton pattern to initialize Firebase only once
function initializeFirebase() {
    if (getApps().length > 0) {
        return getApp();
    }
    
    // Check for missing keys only on the client-side
    if (typeof window !== 'undefined' && !firebaseConfig.apiKey) {
        console.error("Firebase config is missing API key. Make sure your environment variables are set correctly.");
    }
    
    return initializeApp(firebaseConfig);
}

function getClientInstances() {
    const app = initializeFirebase();
    const db = getFirestore(app);
    const auth = getAuth(app);
    return { app, db, auth };
}

// Exporting this function to be used in contexts/hooks
export { getClientInstances };

// Also exporting for direct use if needed, but getClientInstances is preferred
export const app = initializeFirebase();
export const db = getFirestore(app);
