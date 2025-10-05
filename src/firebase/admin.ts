
import * as admin from 'firebase-admin';

// The service account key is expected to be a JSON string in the environment variable.
const serviceAccountString = process.env.FIREBASE_SERVICE_ACCOUNT_KEY;

if (!serviceAccountString) {
    // During local development, this variable might be missing. We can log a warning
    // but allow the app to run, as admin actions might not be used immediately.
    // In a production/deployment environment, this should be treated as a fatal error.
    console.warn('Missing FIREBASE_SERVICE_ACCOUNT_KEY environment variable. Firebase Admin features will fail.');
}

let app: admin.app.App;

if (!admin.apps.length) {
  if (serviceAccountString) {
      try {
        const serviceAccount = JSON.parse(serviceAccountString);
        app = admin.initializeApp({
            credential: admin.credential.cert(serviceAccount),
        });
      } catch (error) {
        console.error("Failed to parse FIREBASE_SERVICE_ACCOUNT_KEY. Ensure it's a valid JSON string.", error);
        // We throw here because if the key is present but invalid, it's a definite configuration error.
        throw new Error("Invalid FIREBASE_SERVICE_ACCOUNT_KEY.");
      }
  } else {
      // Initialize without credentials if the key is missing.
      // This allows the app to build, but any Admin SDK calls will fail.
      app = admin.initializeApp();
  }
} else {
    app = admin.apps[0]!;
}

export function getAdminApp() {
    return app;
}
