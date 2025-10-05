
import { initializeApp, getApps } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";


const firebaseConfig = {

  apiKey: "AIzaSyCjUZRMo0iUJxRcyI4FREamMzaeuA2zn3A",
  authDomain: "andon-ef46a.firebaseapp.com",
  projectId: "andon-ef46a",
  storageBucket: "andon-ef46a.firebasestorage.app",
  messagingSenderId: "1035401871381",
  appId: "1:1035401871381:web:0809cb189809e69a874e1c"

};



let app;
if (!getApps().length) {
  app = initializeApp(firebaseConfig);
} else {
  app = getApps()[0];
}

const auth = getAuth(app);
const db = getFirestore(app);

export { app, auth, db };

