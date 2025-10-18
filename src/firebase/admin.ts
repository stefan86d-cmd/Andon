
import * as admin from "firebase-admin";

// This will hold the single initialized instance of the Firebase App.
let adminApp: admin.app.App;

/**
 * Initializes and returns the Firebase Admin App instance.
 * It ensures that the app is initialized only once.
 */
function getAdminApp(): admin.app.App {
  // If the app is already initialized, return it.
  if (admin.apps.length > 0 && admin.apps[0]) {
    return admin.apps[0];
  }

  // Retrieve the service account JSON from environment variables.
  const serviceAccountString = process.env.FIREBASE_SERVICE_ACCOUNT_ANDON_EF46A;

  // Check if the service account variable is set.
  if (!serviceAccountString) {
    console.error(
      "❌ Firebase Admin SDK initialization failed: The FIREBASE_SERVICE_ACCOUNT_ANDON_EF46A environment variable is not set."
    );
    throw new Error("Firebase Admin credentials are not configured.");
  }

  try {
    // Parse the service account string into a JSON object.
    const serviceAccount = JSON.parse(serviceAccountString);

    // Initialize the Firebase Admin App with the parsed credentials.
    adminApp = admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
    });

    console.log("✅ Firebase Admin SDK initialized successfully.");
    return adminApp;

  } catch (error) {
    console.error("❌ Firebase Admin SDK initialization failed due to an error:", error);
    // Re-throw the error to ensure the server fails loudly if configuration is wrong.
    throw new Error("Failed to initialize Firebase Admin SDK. Check your service account credentials.");
  }
}

// Initialize the app immediately and export the services.
// This ensures that any credential errors are caught at startup.
const app = getAdminApp();

export const adminAuth = admin.auth(app);
export const adminDb = admin.firestore(app);
export const adminStorage = admin.storage(app);

// Also export the app getter for any advanced use cases.
export { getAdminApp };
