
import { initializeApp, getApps } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: "studio-5908745554-37561.firebaseapp.com",
  projectId: "studio-5908745554-37561",
  storageBucket: "studio-5908745554-37561.appspot.com",
  messagingSenderId: "122772761857",
  appId: "1:122772761857:web:9ed040003bdcd05eae3f00",
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
