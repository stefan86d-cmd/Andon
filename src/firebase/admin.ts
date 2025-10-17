
import * as admin from "firebase-admin";
import * as dotenv from 'dotenv';
import * as path from 'path';

// Load environment variables from .env file
dotenv.config({ path: path.resolve(process.cwd(), '.env') });


let adminApp: admin.app.App | undefined;

function initializeAdminApp(): admin.app.App | undefined {
    if (admin.apps.length > 0) {
        return admin.app();
    }

    const serviceAccountString = process.env.FIREBASE_SERVICE_ACCOUNT_ANDON_EF46A;

    if (!serviceAccountString) {
        console.warn("FIREBASE_SERVICE_ACCOUNT_ANDON_EF46A is not set. Admin SDK will not be initialized.");
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

const app = getAdminApp();

export const adminAuth = app ? admin.auth(app) : undefined;
export const adminDb = app ? admin.firestore(app) : undefined;
export const adminStorage = app ? admin.storage(app) : undefined;

export { getAdminApp };
