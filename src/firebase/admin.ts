import * as admin from "firebase-admin";

// Keep a single shared instance across hot reloads and serverless cold starts.
let adminApp: admin.app.App;

function getAdminApp(): admin.app.App {
  if (!admin.apps.length) {
    try {
      // Try to initialize using the default credentials available in Firebase Hosting/Cloud Functions.
      adminApp = admin.initializeApp();
      console.log("✅ Initialized Firebase Admin with default credentials");
    } catch (defaultInitError) {
      console.warn(
        "⚠️ Failed to initialize with default credentials. Trying manual service account..."
      );

      // Fallback: for local dev or cross-project use, check if env variable is provided
      const serviceAccountString = process.env.FIREBASE_SERVICE_ACCOUNT_ANDON_EF46A;

      if (!serviceAccountString) {
        console.error(
          "❌ No service account found in environment variables. Firebase Admin cannot initialize."
        );
        throw new Error(
          "Firebase Admin SDK failed to initialize — missing service account."
        );
      }

      try {
        const serviceAccount = JSON.parse(serviceAccountString);
        adminApp = admin.initializeApp({
          credential: admin.credential.cert(serviceAccount),
        });
        console.log("✅ Initialized Firebase Admin with manual service account");
      } catch (manualError) {
        console.error("❌ Invalid service account JSON.", manualError);
        throw manualError;
      }
    }
  } else {
    adminApp = admin.app();
  }

  return adminApp;
}

// Initialize once and export reusable instances
const app = getAdminApp();

export const adminAuth = admin.auth(app);
export const adminDb = admin.firestore(app);
export const adminStorage = admin.storage(app);

export { getAdminApp };
