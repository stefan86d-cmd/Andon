import { getAdminApp } from "./admin";
import { getFirestore, Firestore } from "firebase-admin/firestore";

let db: Firestore;

try {
  const app = getAdminApp();
  db = getFirestore(app);
} catch (error) {
  console.error("❌ Firestore initialization failed:", error);
  // To prevent the app from crashing, we will not assign null
  // but functions using db will have to handle the possibility of it being uninitialized.
}

export { db };
