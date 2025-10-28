
import * as admin from "firebase-admin";
import type { App } from "firebase-admin/app";
import type { Auth } from "firebase-admin/auth";
import type { Firestore } from "firebase-admin/firestore";

let app: App | undefined;
let auth: Auth | undefined;
let db: Firestore | undefined;

/**
 * Lazily initializes and returns Firebase Admin services.
 * This ensures initialization only happens once and when needed.
 */
function getAdminServices(): { app?: App; auth?: Auth; db?: Firestore } {
  if (app) {
    return { app, auth, db };
  }

  try {
    const serviceAccountString = process.env.FIREBASE_SERVICE_ACCOUNT_ANDON_EF46A;
    if (!serviceAccountString) {
      throw new Error("Firebase Admin credentials are not configured.");
    }
    
    const serviceAccount = JSON.parse(serviceAccountString);
    if (serviceAccount.private_key) {
      serviceAccount.private_key = serviceAccount.private_key.replace(/\\n/g, '\n');
    }

    if (admin.apps.length > 0 && admin.apps[0]) {
      app = admin.apps[0];
    } else {
      app = admin.initializeApp({
        credential: admin.credential.cert(serviceAccount),
      });
    }
    
    auth = admin.auth(app);
    db = admin.firestore(app);
    
    console.log("✅ Firebase Admin SDK initialized successfully.");
    return { app, auth, db };

  } catch (error: any) {
    if (process.env.NODE_ENV === 'development') {
      console.error("Firebase Admin SDK initialization failed:", error.message);
    }
    // Instead of throwing, return empty object to allow build to continue
    // where server-side services may not be needed.
    return {};
  }
}

const { db: adminDb, auth: adminAuth } = getAdminServices();
export { adminDb, adminAuth };
