
import { firebaseConfig } from '@/firebase/config';
import { initializeApp, getApps, getApp, FirebaseApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import * as admin from 'firebase-admin';

// This function can be called from both server and client.
export function initializeFirebase() {
  if (typeof window === 'undefined') {
    // Server-side initialization
    if (admin.apps.length === 0) {
      try {
        // Attempt to initialize via Firebase App Hosting environment variables
        admin.initializeApp();
      } catch (e) {
        if (process.env.NODE_ENV === "production") {
          console.warn('Automatic Admin SDK initialization failed. Falling back to service account credentials if available.', e);
        }
        // Fallback for local dev or environments without auto-init
        if (process.env.SERVICE_ACCOUNT) {
           admin.initializeApp({
             credential: admin.credential.cert(JSON.parse(process.env.SERVICE_ACCOUNT)),
           });
        } else if (firebaseConfig.projectId) {
            // Fallback for emulators or local dev without a service account file
            admin.initializeApp({ projectId: firebaseConfig.projectId });
        } else {
            console.error("Firebase Admin SDK initialization failed. Service account or Project ID not found.");
        }
      }
    }
    const adminApp = admin.app();
    return {
        firebaseApp: null, // Client app instance is not available on server
        auth: adminApp, // Return the admin app instance for server-side auth operations
        firestore: admin.firestore(adminApp)
    };
  } else {
    // Client-side initialization
    if (!getApps().length) {
        initializeApp(firebaseConfig);
    }
    const clientApp = getApp();
    return {
        firebaseApp: clientApp,
        auth: getAuth(clientApp),
        firestore: getFirestore(clientApp)
    };
  }
}

export function getSdks(firebaseApp: FirebaseApp) {
  return {
    firebaseApp,
    auth: getAuth(firebaseApp),
    firestore: getFirestore(firebaseApp)
  };
}
