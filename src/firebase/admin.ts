
import * as admin from 'firebase-admin';

// The service account key is expected to be a JSON string in the environment variable.
const serviceAccountString = process.env.FIREBASE_SERVICE_ACCOUNT_KEY;

if (!serviceAccountString) {
    throw new Error('Missing FIREBASE_SERVICE_ACCOUNT_KEY environment variable. It should be a JSON string.');
}

let app: admin.app.App;

if (admin.apps.length === 0) {
    // Parse the JSON string from the environment variable to a service account object.
    const serviceAccount = JSON.parse(serviceAccountString);
    app = admin.initializeApp({
        credential: admin.credential.cert(serviceAccount),
    });
} else {
    app = admin.apps[0]!;
}

export function getAdminApp() {
    return app;
}
