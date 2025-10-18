
import * as admin from "firebase-admin";

// Keep a single shared instance across hot reloads and serverless cold starts.
let adminApp: admin.app.App;

function getAdminApp(): admin.app.App {
  if (!admin.apps.length) {
    try {
      // For production environments (like Firebase Hosting/Cloud Functions),
      // the SDK will automatically discover credentials.
      adminApp = admin.initializeApp();
      console.log("✅ Initialized Firebase Admin with default credentials");
    } catch (defaultInitError) {
      console.warn(
        "⚠️ Failed to initialize with default credentials. Trying manual service account for local development..."
      );

      // For local development, fall back to the service account environment variable.
      const serviceAccountString = process.env.FIREBASE_SERVICE_ACCOUNT_ANDON_EF46A;

      if (!serviceAccountString) {
        console.error(
          "❌ No service account found in environment variables. Firebase Admin cannot initialize for local development. Ensure FIREBASE_SERVICE_ACCOUNT_ANDON_EF46A is set in your .env.local file."
        );
        throw new Error(
          "Firebase Admin SDK failed to initialize — missing service account for local development."
        );
      }

      try {
        const serviceAccount = JSON.parse(serviceAccountString);
        adminApp = admin.initializeApp({
          credential: admin.credential.cert(serviceAccount),
        });
        console.log("✅ Initialized Firebase Admin with manual service account for local development");
      } catch (manualError) {
        console.error("❌ Invalid service account JSON in environment variable.", manualError);
        throw manualError;
      }
    }
  } else {
    // If already initialized, use the existing app instance.
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
