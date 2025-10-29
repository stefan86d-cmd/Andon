const functions = require("firebase-functions");
const admin = require("firebase-admin");
const express = require("express");
const cors = require("cors");

const app = express();
app.use(cors({ origin: true }));

let initialized = false;

// ✅ Initialize Firebase Admin
try {
  const serviceAccountString = process.env.SERVICE_ACCOUNT_ANDON_EF46A;

  if (!serviceAccountString) {
    console.warn("⚠️ SERVICE_ACCOUNT_ANDON_EF46A not found. Running in client-safe mode.");
  } else {
    const serviceAccount = JSON.parse(serviceAccountString);
    if (serviceAccount.private_key) {
      serviceAccount.private_key = serviceAccount.private_key.replace(/\\n/g, "\n");
    }

    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
    });

    initialized = true;
    console.log("✅ Firebase Admin SDK initialized successfully");
  }
} catch (error) {
  console.error("❌ Failed to initialize Firebase Admin:", error.message);
}

const db = initialized ? admin.firestore() : null;

// 🩺 Health check
app.get("/", (req, res) => {
  res.status(200).send({
    status: "ok",
    firebaseAdminInitialized: initialized,
    env: process.env.NODE_ENV || "unknown",
  });
});

// 👤 Create user endpoint (admin only)
app.post("/createUser", async (req, res) => {
  if (!initialized) return res.status(500).send("Firebase Admin not initialized");
  try {
    const { email, password, role, orgId } = req.body;
    if (!email || !password) {
      return res.status(400).send("Email and password are required");
    }

    const userRecord = await admin.auth().createUser({ email, password });
    await db.collection("users").doc(userRecord.uid).set({
      email,
      role: role || "operator",
      orgId: orgId || "default",
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
    });

    res.status(201).send({ uid: userRecord.uid });
  } catch (err) {
    console.error(err);
    res.status(500).send(err.message);
  }
});

// ⚙️ Add issue endpoint
app.post("/createIssue", async (req, res) => {
  if (!initialized) return res.status(500).send("Firebase Admin not initialized");
  try {
    const { title, description, orgId } = req.body;
    if (!title || !orgId) {
      return res.status(400).send("Missing required fields");
    }

    const newIssue = {
      title,
      description: description || "",
      orgId,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      status: "open",
    };

    const docRef = await db.collection("issues").add(newIssue);
    res.status(201).send({ id: docRef.id });
  } catch (err) {
    console.error(err);
    res.status(500).send(err.message);
  }
});

// 🚀 Export the Express app as an HTTPS function
exports.api = functions.region("europe-west4").https.onRequest(app);
