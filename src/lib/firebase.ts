
import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyB2GWsEfRVVhwVl-arUo6Px26jLb4WKMQg",
  authDomain: "studio-5908745554-37561.firebaseapp.com",
  projectId: "studio-5908745554-37561",
  storageBucket: "studio-5908745554-37561.appspot.com",
  messagingSenderId: "122772761857",
  appId: "1:122772761857:web:9ed040003bdcd05eae3f00",
};

// Initialize Firebase
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();

const auth = getAuth(app);
const db = getFirestore(app);

export { app, auth, db };
