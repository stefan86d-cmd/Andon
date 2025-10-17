
import * as admin from "firebase-admin";

let adminApp: admin.app.App | undefined;

function initializeAdminApp(): admin.app.App | undefined {
    // In a deployed environment, the service account should be available as an environment variable.
    // The check for admin.apps.length prevents re-initializing the app on hot reloads.
    if (admin.apps.length > 0) {
        return admin.app();
    }

    const serviceAccountString = process.env.FIREBASE_SERVICE_ACCOUNT_ANDON_EF46A;

    if (!serviceAccountString) {
        console.warn("FIREBASE_SERVICE_ACCOUNT_ANDON_EF46A is not set. Firebase Admin SDK will not be initialized. This is expected in client-side rendering but is an error on the server.");
        return undefined;
    }
  
    try {
        // We need to parse the JSON string from the environment variable.
        const serviceAccount = JSON.parse(serviceAccountString);
        return admin.initializeApp({
            credential: admin.credential.cert(serviceAccount),
        });
    } catch (error) {
        console.error("Failed to parse service account JSON or initialize Firebase Admin SDK.", error);
        // This is a critical failure. Throwing an error here will cause the server to fail
        // starting up, which is better than it running in a broken state.
        throw new Error("Could not initialize Firebase Admin SDK. Service account might be malformed.");
    }
}

function getAdminApp(): admin.app.App | undefined {
  if (!adminApp) {
    adminApp = initializeAdminApp();
  }
  return adminApp;
}

const app = getAdminApp();

// Conditionally export the admin services. They will be undefined if initialization fails.
export const adminAuth = app ? admin.auth(app) : undefined;
export const adminDb = app ? admin.firestore(app) : undefined;
export const adminStorage = app ? admin.storage(app) : undefined;

export { getAdminApp };
