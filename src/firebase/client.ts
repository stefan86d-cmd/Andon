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

// Singleton pattern to initialize and get Firebase instances
function getClientInstances() {
    let app: FirebaseApp;

    if (getApps().length === 0) {
         if (!firebaseConfig.apiKey) {
            // This error will only be thrown on the client if the env vars are not set.
            throw new Error("Firebase config is missing API key. Make sure your environment variables are set correctly.");
        }
        app = initializeApp(firebaseConfig);
    } else {
        app = getApp();
    }
    
    const db = getFirestore(app);
    const auth = getAuth(app);
    return { app, db, auth };
}

// Exporting this function to be used in contexts/hooks
export { getClientInstances };
