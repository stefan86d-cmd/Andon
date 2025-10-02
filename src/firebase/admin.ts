
import * as admin from 'firebase-admin';

const serviceAccount = process.env.FIREBASE_SERVICE_ACCOUNT_KEY;

if (!serviceAccount) {
    throw new Error('Missing FIREBASE_SERVICE_ACCOUNT_KEY environment variable');
}

let app: admin.app.App;

if (admin.apps.length === 0) {
    app = admin.initializeApp({
        credential: admin.credential.cert(JSON.parse(serviceAccount)),
    });
} else {
    app = admin.apps[0]!;
}


export function getAdminApp() {
    return app;
}
