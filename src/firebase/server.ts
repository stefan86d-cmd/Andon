
import { adminDb } from "./admin";
import type { Firestore } from "firebase-admin/firestore";

// This function will now be the single point of entry for getting the DB instance on the server.
// It ensures that initialization is handled correctly before returning the instance.
function getDb(): Firestore | undefined {
    try {
        return adminDb();
    } catch (error) {
        console.error("Failed to get Firestore instance from adminDb:", error);
        return undefined;
    }
}

export { getDb as db };
