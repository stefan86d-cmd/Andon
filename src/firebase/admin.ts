
import * as admin from "firebase-admin";
import type { App } from "firebase-admin/app";
import type { Auth } from "firebase-admin/auth";
import type { Firestore } from "firebase-admin/firestore";

let app: App | undefined;
let auth: Auth | undefined;
let db: Firestore | undefined;

function initializeAdminApp(): App {
  if (admin.apps.length > 0 && admin.apps[0]) {
    return admin.apps[0];
  }

  const serviceAccountString = process.env.FIREBASE_SERVICE_ACCOUNT_ANDON_EF46A;

  if (!serviceAccountString) {
    console.error(
      "❌ Firebase Admin SDK initialization failed: The FIREBASE_SERVICE_ACCOUNT_ANDON_EF46A environment variable is not set."
    );
    throw new Error("Firebase Admin credentials are not configured.");
  }

  try {
    const serviceAccount = JSON.parse(serviceAccountString);

    if (serviceAccount.private_key) {
      serviceAccount.private_key = serviceAccount.private_key.replace(/\\n/g, '\n');
    }

    const newApp = admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
    });

    console.log("✅ Firebase Admin SDK initialized successfully.");
    return newApp;
  } catch (error: any) {
    console.error("❌ Firebase Admin SDK initialization failed due to an error:", error);
    if (error instanceof SyntaxError) {
      console.error("This is likely due to a malformed JSON string in your FIREBASE_SERVICE_ACCOUNT_ANDON_EF46A environment variable.");
    }
    throw new Error(`Failed to initialize Firebase Admin SDK. Details: ${error.message}`);
  }
}

/**
 * Lazily initializes and returns Firebase Admin services.
 * This ensures initialization only happens once and when needed.
 */
export function getAdminServices(): { app: App; auth: Auth; db: Firestore } {
  if (!app) {
    app = initializeAdminApp();
    auth = admin.auth(app);
    db = admin.firestore(app);
  }
  // These are guaranteed to be defined after the block above.
  return { app, auth: auth!, db: db! };
}
