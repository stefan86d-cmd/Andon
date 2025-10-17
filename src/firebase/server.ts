
import { getFirestore, Firestore } from "firebase-admin/firestore";
import { getAdminApp } from "./admin";

let db: Firestore | undefined;

function getDb(): Firestore | undefined {
    if (db) {
        return db;
    }

    const app = getAdminApp();
    if (!app) {
        // This will happen if the service account isn't available.
        // We return undefined instead of throwing to avoid crashing the server.
        return undefined;
    }
    db = getFirestore(app);
    return db;
}

// To avoid re-exporting `undefined` and allow for conditional use,
// we export the function itself. Components that need the admin db
// can call it and handle the possibility of it being unavailable.
const lazilyGetDb = () => getDb();

export { lazilyGetDb as db };
