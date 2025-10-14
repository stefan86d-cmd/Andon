
import * as admin from 'firebase-admin';
import { getFirestore, Firestore } from 'firebase-admin/firestore';

let db: Firestore;

try {
  if (admin.apps.length === 0) {
    const serviceAccountKey = process.env.FIREBASE_SERVICE_ACCOUNT_KEY;
    if (!serviceAccountKey) {
        throw new Error("FIREBASE_SERVICE_ACCOUNT_KEY environment variable is not set.");
    }
    
    admin.initializeApp({
      credential: admin.credential.cert(JSON.parse(serviceAccountKey)),
      projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
    });
  }
  db = getFirestore();
} catch (error: any) {
  console.error(
    '❌ Firebase Admin initialization failed:',
    error.stack || error.message
  );
  // To prevent the app from crashing, db will be undefined, but functions using it must handle this.
}

export { db };
