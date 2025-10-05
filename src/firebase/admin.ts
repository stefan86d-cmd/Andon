
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
            throw new Error("Invalid FIREBASE_SERVICE_ACCOUNT_KEY.");
        }
    } else {
        // This case is for local development or environments where the key isn't set.
        // It allows the app to build, but admin features will fail if used.
        console.warn('Missing FIREBASE_SERVICE_ACCOUNT_KEY environment variable. Firebase Admin features will fail.');
        // Initialize without credentials if the key is missing to allow builds to pass.
        admin.initializeApp();
    }
}

// Export the initialized admin app instance.
const adminApp = admin.apps[0];
const adminDb = adminApp ? admin.firestore(adminApp) : null;
const adminAuth = adminApp ? admin.auth(adminApp) : null;

export const getAdminApp = () => {
    if (!adminApp) {
        throw new Error("Firebase Admin App is not initialized. Check your environment variables.");
    }
    return adminApp;
};

export { adminDb, adminAuth };
