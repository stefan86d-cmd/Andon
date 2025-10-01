
import { initializeApp, getApps } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

// --- IMPORTANT ---
// Paste your Firebase project's configuration object here.
const firebaseConfig = {
  apiKey: "AIzaSyCjUZRMo0iUJxRcyI4FREamMzaeuA2zn3A",
  authDomain: "andon-ef46a.firebaseapp.com",
  projectId: "andon-ef46a",
  storageBucket: "andon-ef46a.appspot.com",
  messagingSenderId: "1035401871381",
  appId: "PASTE_YOUR_APP_ID",
};

// Initialize Firebase
let app;
if (!getApps().length) {
  app = initializeApp(firebaseConfig);
} else {
  app = getApps()[0];
}

const auth = getAuth(app);
const db = getFirestore(app);

export { app, auth, db };
