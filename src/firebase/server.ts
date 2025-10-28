
import type { Firestore } from "firebase-admin/firestore";
import { getAdminServices } from "./admin";

let dbInstance: Firestore | undefined;

/**
 * Provides a lazily-initialized Firestore instance for server-side use.
 * Returns undefined if initialization fails, allowing for graceful error handling.
 */
function getDb(): Firestore | undefined {
    if (dbInstance) {
        return dbInstance;
    }

    try {
        const { db } = getAdminServices();
        if (db) {
            dbInstance = db;
            return dbInstance;
        }
        return undefined;
    } catch (error) {
        console.error("Failed to get Firestore instance from admin services:", error);
        return undefined;
    }
}

export { getDb as db };
