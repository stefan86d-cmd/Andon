const functions = require("firebase-functions");
const admin = require("firebase-admin");

let initialized = false;

try {
  const serviceAccountString = process.env.SERVICE_ACCOUNT_ANDON_EF46A;

  if (!serviceAccountString) {
    console.warn("⚠️ No SERVICE_ACCOUNT_ANDON_EF46A environment variable found.");
  } else {
    const serviceAccount = JSON.parse(serviceAccountString);
    if (serviceAccount.private_key) {
      serviceAccount.private_key = serviceAccount.private_key.replace(/\\n/g, "\n");
    }

    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
    });

    initialized = true;
    console.log("✅ Firebase Admin initialized successfully.");
  }
} catch (error) {
  console.error("❌ Error initializing Firebase Admin:", error.message);
}

exports.helloWorld = functions.https.onRequest((req, res) => {
  res.send(`Firebase Admin initialized: ${initialized}`);
});
