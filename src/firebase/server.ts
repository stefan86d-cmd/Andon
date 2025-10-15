import { getAdminApp } from "./admin";
import { getFirestore, Firestore } from "firebase-admin/firestore";

let db: Firestore;

const app = getAdminApp();
db = getFirestore(app);

export { db };
