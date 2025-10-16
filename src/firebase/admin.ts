
import * as admin from "firebase-admin";

let adminApp: admin.app.App | undefined;

function initializeAdminApp() {
    if (admin.apps.length > 0) {
        return admin.app() as admin.app.App;
    }

    // This environment variable is set by Firebase Hosting during deployment.
    const serviceAccountString = process.env.FIREBASE_SERVICE_ACCOUNT_ANDON_EF46A;

    if (!serviceAccountString) {
        console.warn("FIREBASE_SERVICE_ACCOUNT_ANDON_EF46A is not set. Admin SDK will not be initialized. This is expected in client-side rendering.");
        return undefined;
    }
  
    try {
        const serviceAccount = JSON.parse(serviceAccountString);
        return admin.initializeApp({
            credential: admin.credential.cert(serviceAccount),
        });
    } catch (error) {
        console.error("Failed to parse service account JSON or initialize Firebase Admin SDK.", error);
        return undefined;
    }
}

function getAdminApp(): admin.app.App | undefined {
  if (!adminApp) {
    adminApp = initializeAdminApp();
  }
  return adminApp;
}

// These exports might return undefined if the admin app fails to initialize.
// Code using these must handle the possibility of them being unavailable.
export const adminAuth = getAdminApp() ? admin.auth(getAdminApp()) : undefined;
export const adminDb = getAdminApp() ? admin.firestore(getAdminApp()) : undefined;
export const adminStorage = getAdminApp() ? admin.storage(getAdminApp()) : undefined;

export { getAdminApp };
