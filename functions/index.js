// ===== Dependencies =====
const functions = require("firebase-functions");
const admin = require("firebase-admin");
const express = require("express");
const cors = require("cors");
const Stripe = require("stripe");

// ===== Express App Setup =====
const app = express();
app.use(cors({ origin: true }));

// Stripe requires the raw body for webhook verification
app.use("/stripe-webhook", express.raw({ type: "application/json" }));
app.use(express.json());

// ===== Firebase Admin Initialization =====
let initialized = false;
let db = null;

try {
  const serviceAccountString = process.env.SERVICE_ACCOUNT_ANDON_EF46A;

  if (!serviceAccountString) {
    console.warn("⚠️ SERVICE_ACCOUNT_ANDON_EF46A not found. Running in limited mode.");
  } else {
    const serviceAccount = JSON.parse(serviceAccountString);
    if (serviceAccount.private_key) {
      serviceAccount.private_key = serviceAccount.private_key.replace(/\\n/g, "\n");
    }

    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
    });

    db = admin.firestore();
    initialized = true;
    console.log("✅ Firebase Admin SDK initialized successfully");
  }
} catch (error) {
  console.error("❌ Failed to initialize Firebase Admin:", error.message);
}

// ===== Stripe Initialization =====
const stripeSecret = process.env.NEXT_STRIPE_SECRET_KEY;
const stripeWebhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

if (!stripeSecret) console.warn("⚠️ NEXT_STRIPE_SECRET_KEY missing");
const stripe = stripeSecret ? new Stripe(stripeSecret) : null;

// ===== Routes =====

// 🩺 Health check
app.get("/", (req, res) => {
  res.status(200).send({
    status: "ok",
    firebaseAdminInitialized: initialized,
    stripeInitialized: !!stripe,
    env: process.env.NODE_ENV || "unknown",
  });
});

// 👤 Create User (admin only)
app.post("/createUser", async (req, res) => {
  if (!initialized) return res.status(500).send("Firebase Admin not initialized");
  try {
    const { email, password, role, orgId } = req.body;
    if (!email || !password) return res.status(400).send("Email and password are required");

    const userRecord = await admin.auth().createUser({ email, password });
    await db.collection("users").doc(userRecord.uid).set({
      email,
      role: role || "operator",
      orgId: orgId || "default",
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
    });

    res.status(201).send({ uid: userRecord.uid });
  } catch (err) {
    console.error("❌ Error creating user:", err);
    res.status(500).send(err.message);
  }
});

// ⚙️ Create Issue
app.post("/createIssue", async (req, res) => {
  if (!initialized) return res.status(500).send("Firebase Admin not initialized");
  try {
    const { title, description, orgId } = req.body;
    if (!title || !orgId) return res.status(400).send("Missing required fields");

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
    console.error("❌ Error creating issue:", err);
    res.status(500).send(err.message);
  }
});

// 💰 Stripe Webhook (handles subscriptions + one-time payments)
app.post("/stripe-webhook", async (req, res) => {
  if (!stripe || !stripeWebhookSecret) {
    console.error("❌ Stripe not configured correctly");
    return res.status(500).send("Stripe not configured");
  }

  const sig = req.headers["stripe-signature"];
  let event;

  try {
    event = stripe.webhooks.constructEvent(req.body, sig, stripeWebhookSecret);
  } catch (err) {
    console.error("❌ Webhook signature verification failed:", err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  try {
    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object;
        console.log("💰 Checkout completed:", session.id);

        // 🔹 Example: Update Firestore with subscription info
        if (db && session.customer_email) {
          const userRef = db.collection("users").where("email", "==", session.customer_email);
          const snap = await userRef.get();
          if (!snap.empty) {
            const userDoc = snap.docs[0];
            await userDoc.ref.update({
              subscriptionStatus: "active",
              lastPayment: admin.firestore.FieldValue.serverTimestamp(),
              stripeSessionId: session.id,
            });
          }
        }
        break;
      }

      case "invoice.payment_succeeded":
        console.log("✅ Invoice payment succeeded");
        break;

      case "invoice.payment_failed":
        console.warn("⚠️ Payment failed:", event.data.object.customer_email);
        break;

      default:
        console.log(`Unhandled event type ${event.type}`);
    }

    res.json({ received: true });
  } catch (err) {
    console.error("❌ Error handling Stripe webhook:", err);
    res.status(500).send("Internal Server Error");
  }
});

// ===== Export Cloud Function =====
exports.api = functions
  .region("europe-west4")
  .runWith({ memory: "512MB", timeoutSeconds: 60 })
  .https.onRequest(app);
