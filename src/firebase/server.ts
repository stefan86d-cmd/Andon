
import { adminDb } from "./admin";
import type { Firestore } from "firebase-admin/firestore";

function getDb(): Firestore | undefined {
    return adminDb;
}

export { getDb as db };
