
import * as admin from "firebase-admin";
import type { App } from "firebase-admin/app";
import type { Auth } from "firebase-admin/auth";
import type { Firestore } from "firebase-admin/firestore";

let app: App | undefined;
let auth: Auth | undefined;
let db: Firestore | undefined;

try {
  const serviceAccountString = process.env.FIREBASE_SERVICE_ACCOUNT_ANDON_EF46A;
  if (!serviceAccountString) {
    throw new Error("The FIREBASE_SERVICE_ACCOUNT_ANDON_EF46A environment variable is not set.");
  }

  const serviceAccount = JSON.parse(serviceAccountString);
  if (serviceAccount.private_key) {
    serviceAccount.private_key = serviceAccount.private_key.replace(/\\n/g, '\n');
  }

  if (admin.apps.length === 0) {
    app = admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
    });
  } else {
    app = admin.apps[0]!;
  }

  auth = admin.auth(app);
  db = admin.firestore(app);

  console.log("✅ Firebase Admin SDK initialized successfully.");

} catch (error: any) {
  // We log this error but do not throw it, allowing the build to proceed.
  // The serverless functions that need the Admin SDK will fail at runtime if this initialization fails.
  if (process.env.NODE_ENV === 'development' || process.env.VERCEL) {
    console.error("Firebase Admin SDK initialization failed:", error.message);
  } else {
    // In other environments, we might want to be quieter or handle differently.
    // For now, logging a warning.
    console.warn("Firebase Admin SDK not initialized. This is expected during client-side builds.");
  }
}

export { db as adminDb, auth as adminAuth };
