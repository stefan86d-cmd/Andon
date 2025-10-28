
import type { Firestore } from "firebase-admin/firestore";
import { getAdminServices } from "./admin";

let db: Firestore | undefined;

function getDb(): Firestore | undefined {
    if (db) {
        return db;
    }
    
    try {
        // Use the lazy initializer from admin.ts
        const adminServices = getAdminServices();
        db = adminServices.db;
        return db;
    } catch (error) {
        // If initialization fails (e.g., missing env var), this will catch it.
        // We log the error but return undefined to avoid crashing the server.
        console.error("Failed to get Firestore instance from admin services:", error);
        return undefined;
    }
}

// To avoid re-exporting `undefined` and allow for conditional use,
// we export the function itself. Components that need the admin db
// can call it and handle the possibility of it being unavailable.
const lazilyGetDb = () => getDb();

export { lazilyGetDb as db };
