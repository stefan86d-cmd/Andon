
import * as admin from 'firebase-admin';

// Ensure the app is not already initialized
if (!admin.apps.length) {
    const serviceAccountString = process.env.FIREBASE_SERVICE_ACCOUNT_KEY;
    if (serviceAccountString) {
        try {
            const serviceAccount = JSON.parse(serviceAccountString);
            admin.initializeApp({
                credential: admin.credential.cert(serviceAccount),
            });
        } catch (error) {
            console.error("Failed to parse FIREBASE_SERVICE_ACCOUNT_KEY. Ensure it's a valid JSON string.", error);
            // Don't throw here, let getAdminApp handle the uninitialized state
        }
    } else {
        // This case is for local development or environments where the key isn't set.
        // It allows the app to build, but admin features will fail if used.
        console.warn('Missing FIREBASE_SERVICE_ACCOUNT_KEY environment variable. Firebase Admin features will fail if used.');
    }
}

// Export the initialized admin app instance.
const adminApp = admin.apps[0] || null;

export const getAdminApp = () => {
    if (!adminApp) {
        // This will now be the single point of failure if initialization fails,
        // which is easier to debug.
        throw new Error("Firebase Admin App is not initialized. Check your environment variables and server logs.");
    }
    return adminApp;
};
