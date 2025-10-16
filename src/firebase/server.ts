
import { getFirestore, Firestore } from "firebase-admin/firestore";
import { getAdminApp } from "./admin";

let db: Firestore;

// Lazily initialize the Firestore instance
function getDb() {
    if (!db) {
        const app = getAdminApp();
        if (!app) {
            // This will happen if the service account isn't available.
            // We can either throw an error or handle it gracefully depending on the app's needs.
            // For now, we'll log a warning and subsequent DB calls will fail.
            console.error("FATAL: Firebase Admin SDK not initialized. Server-side database operations will fail.");
            // A mock/empty Firestore instance could be returned here to prevent crashes,
            // but for now, we'll let it fail to make the issue obvious.
        }
        db = getFirestore(app);
    }
    return db;
}


// Export a getter function instead of the instance directly.
// Or, for simplicity in the rest of the app, we can export a proxy or just the initialized instance.
// For this app, let's keep it simple and just initialize it, but the lazy getter is a good pattern.
const app = getAdminApp();
if (app) {
    db = getFirestore(app);
} else {
    // If the app is not initialized, db will be undefined.
    // The parts of the app that use `db` will need to handle this.
    // In this project, `actions.ts` checks for `db` before using it.
    console.warn("Firestore database (server-side) not initialized because Firebase Admin app failed to initialize.");
}


export { db };
