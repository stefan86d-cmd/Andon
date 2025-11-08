
import * as admin from "firebase-admin";
import type { App } from "firebase-admin/app";
import type { Auth } from "firebase-admin/auth";
import type { Firestore } from "firebase-admin/firestore";

interface AdminInstances {
  auth: Auth;
  db: Firestore;
  app: App;
}

let instances: AdminInstances | undefined;

function initializeAdmin(): AdminInstances {
  if (instances) {
    return instances;
  }

  if (admin.apps.length > 0) {
    const app = admin.apps[0]!;
    instances = {
      app,
      auth: admin.auth(app),
      db: admin.firestore(app),
    };
    return instances;
  }

  try {
    const serviceAccountString = process.env.SERVICE_ACCOUNT_ANDON_EF46A;
    if (!serviceAccountString) {
      throw new Error("The SERVICE_ACCOUNT_ANDON_EF46A environment variable is not set.");
    }

    const serviceAccount = JSON.parse(serviceAccountString);
    if (serviceAccount.private_key) {
      serviceAccount.private_key = serviceAccount.private_key.replace(/\\n/g, '\n');
    }

    const app = admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
    });
    
    console.log("✅ Firebase Admin SDK initialized successfully.");

    instances = {
      app,
      auth: admin.auth(app),
      db: admin.firestore(app),
    };
    return instances;

  } catch (error: any) {
    console.error("❌ Firebase Admin SDK initialization failed:", error.message);
    throw new Error("Firebase Admin SDK failed to initialize. " + error.message);
  }
}

// Export getters that ensure initialization
// This pattern prevents the app from crashing if the module is imported but the instances aren't used.
// The error will only be thrown when adminDb or adminAuth are actually accessed.

const getAdminDb = (): Firestore => {
  return initializeAdmin().db;
}

const getAdminAuth = (): Auth => {
  return initializeAdmin().auth;
}

export { getAdminDb as adminDb, getAdminAuth as adminAuth };
