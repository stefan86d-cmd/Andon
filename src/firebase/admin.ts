
import * as admin from "firebase-admin";
import type { App } from "firebase-admin/app";
import type { Auth } from "firebase-admin/auth";
import type { Firestore } from "firebase-admin/firestore";

let app: App | undefined;
let auth: Auth | undefined;
let db: Firestore | undefined;

function initializeAdmin() {
  if (admin.apps.length > 0) {
    app = admin.apps[0]!;
  } else {
    try {
      const serviceAccountString = process.env.SERVICE_ACCOUNT_ANDON_EF46A;
      if (!serviceAccountString) {
        throw new Error("The SERVICE_ACCOUNT_ANDON_EF46A environment variable is not set.");
      }

      const serviceAccount = JSON.parse(serviceAccountString);
      if (serviceAccount.private_key) {
        serviceAccount.private_key = serviceAccount.private_key.replace(/\\n/g, '\n');
      }

      app = admin.initializeApp({
        credential: admin.credential.cert(serviceAccount),
      });
      console.log("✅ Firebase Admin SDK initialized successfully.");

    } catch (error: any) {
      console.error("Firebase Admin SDK initialization failed:", error.message);
      // Do not proceed to set auth and db if initialization failed
      return;
    }
  }

  auth = admin.auth(app);
  db = admin.firestore(app);
}

// Lazy initialization
function getAdminInstances() {
  if (!app) {
    initializeAdmin();
  }
  return { adminDb: db, adminAuth: auth };
}

// Export getters that ensure initialization
Object.defineProperty(exports, "adminDb", {
    get: () => getAdminInstances().adminDb,
    enumerable: true,
});

Object.defineProperty(exports, "adminAuth", {
    get: () => getAdminInstances().adminAuth,
    enumerable: true,
});
