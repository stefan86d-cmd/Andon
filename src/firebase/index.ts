
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
  appId: "1:1035401871381:web:2c87b8f9e618844f2d7a2f",
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
