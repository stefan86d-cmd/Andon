
import { getFirestore, Firestore } from "firebase-admin/firestore";
import { getAdminApp } from "./admin";

let db: Firestore | undefined;

function getDb(): Firestore {
    if (!db) {
        const app = getAdminApp();
        if (!app) {
            // This will happen if the service account isn't available.
            // We throw an error here to make it clear that the server is not configured.
            throw new Error("FATAL: Firebase Admin SDK not initialized. Server-side database operations will fail.");
        }
        db = getFirestore(app);
    }
    return db;
}

// Export a proxy-like object that lazily gets the db instance.
// This ensures getDb() is only called when `db` is actually accessed.
const dbProxy = new Proxy({}, {
    get(_, prop) {
        const firestore = getDb();
        return Reflect.get(firestore, prop);
    }
}) as Firestore;


export { dbProxy as db };
