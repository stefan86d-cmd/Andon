import * as admin from "firebase-admin";

let adminApp: admin.app.App;

function initializeAdminApp() {
    if (admin.apps.length > 0) {
        return admin.app();
    }

    const serviceAccountString = process.env.FIREBASE_SERVICE_ACCOUNT_KEY;

    if (!serviceAccountString) {
        throw new Error("Missing FIREBASE_SERVICE_ACCOUNT_KEY env variable. Firebase Admin initialization failed.");
    }
  
    try {
        const serviceAccount = JSON.parse(serviceAccountString);
        return admin.initializeApp({
            credential: admin.credential.cert(serviceAccount),
        });
    } catch (error) {
        console.error("Failed to parse FIREBASE_SERVICE_ACCOUNT_KEY JSON.", error);
        throw new Error("Could not initialize Firebase Admin SDK.");
    }
}

function getAdminApp(): admin.app.App {
  if (!adminApp) {
    adminApp = initializeAdminApp();
  }
  return adminApp;
}

export const adminAuth = admin.auth(getAdminApp());
export const adminDb = admin.firestore(getAdminApp());
export const adminStorage = admin.storage(getAdminApp());

export default getAdminApp;