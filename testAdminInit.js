import * as admin from "firebase-admin";

const serviceAccountString = process.env.FIREBASE_SERVICE_ACCOUNT_ANDON_EF46A;

if (!serviceAccountString) {
  console.error("❌ FIREBASE_SERVICE_ACCOUNT_ANDON_EF46A not set");
  process.exit(1);
}

try {
  const serviceAccount = JSON.parse(serviceAccountString);
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
  });
  console.log("✅ Firebase Admin initialized successfully!");
} catch (e) {
  console.error("❌ Failed to initialize Admin SDK", e);
}
