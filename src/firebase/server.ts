import { getAdminApp } from "./admin";
import { getFirestore, Firestore } from "firebase-admin/firestore";

let db: Firestore;

try {
  const app = getAdminApp();
  db = getFirestore(app);
} catch (error) {
  console.error("❌ Firestore initialization failed:", error);
  // Fallback: create a dummy Firestore object to satisfy TypeScript
  db = {} as Firestore;
}

export { db };
