
import { headers } from "next/headers";
import { NextResponse } from "next/server";
import Stripe from "stripe";
import * as admin from "firebase-admin";
import { add } from "date-fns";

// --- Stripe Setup ---
const stripe = new Stripe(process.env.NEXT_STRIPE_SECRET_KEY!, {
  apiVersion: "2024-06-20",
});

const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET!;

// --- Firebase Admin Setup ---
if (!admin.apps.length) {
  const serviceAccountString = process.env.FIREBASE_SERVICE_ACCOUNT_ANDON_EF46A;
  if (serviceAccountString) {
    const serviceAccount = JSON.parse(serviceAccountString);
    if (serviceAccount.private_key) {
        serviceAccount.private_key = serviceAccount.private_key.replace(/\\n/g, '\n');
    }
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
    });
  } else {
    console.error("Firebase Admin SDK credentials are not configured.");
  }
}

const db = admin.firestore();

// --- Main Handler ---
export async function POST(req: Request) {
  const body = await req.text();
  const sig = (await headers()).get("stripe-signature");

  let event: Stripe.Event;

  try {
    if (!sig) throw new Error("Missing stripe-signature header");
    if (!endpointSecret) throw new Error("Stripe webhook secret not configured");
    event = stripe.webhooks.constructEvent(body, sig, endpointSecret);
  } catch (err: any) {
    console.error("❌ Webhook signature verification failed:", err.message);
    return new NextResponse(`Webhook Error: ${err.message}`, { status: 400 });
  }

  // Handle Checkout Success for both new subscriptions and one-time payments
  if (event.type === "checkout.session.completed") {
    const session = event.data.object as Stripe.Checkout.Session;
    const userId = session.metadata?.userId;
    const plan = session.metadata?.plan;
    const duration = parseInt(session.metadata?.duration || "1", 10);

    if (userId && plan) {
      try {
        const userRef = db.collection("users").doc(userId);
        
        let subscriptionId;
        let subscriptionStartsAt = new Date();
        let subscriptionEndsAt;

        if (session.mode === 'subscription') {
            const subscription = await stripe.subscriptions.retrieve(session.subscription as string);
            subscriptionId = subscription.id;
            subscriptionStartsAt = new Date(subscription.current_period_start * 1000);
            subscriptionEndsAt = new Date(subscription.current_period_end * 1000);
        } else if (session.mode === 'payment') {
            // Use the payment intent for one-time payments as a unique ID
            subscriptionId = session.payment_intent as string; 
            subscriptionEndsAt = add(subscriptionStartsAt, { months: duration });
        }
        
        if (!subscriptionId || !subscriptionEndsAt) {
          console.error("❌ Could not determine subscription ID or end date from checkout session:", session.id);
          return new NextResponse("Internal Server Error", { status: 500 });
        }

        const updates: Record<string, any> = {
          plan,
          subscriptionId,
          subscriptionStartsAt: admin.firestore.Timestamp.fromDate(subscriptionStartsAt),
          subscriptionEndsAt: admin.firestore.Timestamp.fromDate(subscriptionEndsAt),
          updatedAt: admin.firestore.FieldValue.serverTimestamp(),
        };

        await userRef.update(updates);

        console.log(`✅ User ${userId} successfully processed for plan ${plan}.`);
      } catch (error) {
        console.error("❌ Firestore update failed for checkout.session.completed:", error);
        return new NextResponse("Internal Server Error", { status: 500 });
      }
    }
  }

  // Handle Subscription Renewals for both event types
  if (event.type === "invoice.payment_succeeded" || (event.type as string) === 'invoice_payment.paid') {
    const invoice = event.data.object as Stripe.Invoice;
    const subscriptionId = invoice.subscription;

    if ((invoice.billing_reason === 'subscription_cycle' || invoice.billing_reason === 'subscription_create') && subscriptionId) {
        try {
            const subscription = await stripe.subscriptions.retrieve(subscriptionId as string);
            const userSnapshot = await db.collection("users").where("subscriptionId", "==", subscription.id).limit(1).get();

            if (!userSnapshot.empty) {
                const userId = userSnapshot.docs[0].id;
                await db.collection("users").doc(userId).update({
                    subscriptionStartsAt: admin.firestore.Timestamp.fromMillis(subscription.current_period_start * 1000),
                    subscriptionEndsAt: admin.firestore.Timestamp.fromMillis(subscription.current_period_end * 1000),
                    updatedAt: admin.firestore.FieldValue.serverTimestamp(),
                });
                console.log(`🔄 Subscription renewed for user ${userId}`);
            }
        } catch (error) {
            console.error("❌ Firestore update failed for invoice payment:", error);
            return new NextResponse("Internal Server Error", { status: 500 });
        }
    }
  }

  // Handle Subscription Cancellations
  if (event.type === "customer.subscription.deleted") {
    const subscription = event.data.object as Stripe.Subscription;
    
    try {
        const userSnapshot = await db.collection("users").where("subscriptionId", "==", subscription.id).limit(1).get();
        
        if (!userSnapshot.empty) {
            const userId = userSnapshot.docs[0].id;
            await db.collection("users").doc(userId).update({
                plan: "starter",
                subscriptionId: admin.firestore.FieldValue.delete(),
                subscriptionStartsAt: admin.firestore.FieldValue.delete(),
                subscriptionEndsAt: admin.firestore.FieldValue.delete(),
                updatedAt: admin.firestore.FieldValue.serverTimestamp(),
            });
            console.log(`🟥 Subscription canceled for user ${userId}`);
        }
    } catch (error) {
        console.error("❌ Firestore update failed for customer.subscription.deleted:", error);
        return new NextResponse("Internal Server Error", { status: 500 });
    }
  }

  return new NextResponse(JSON.stringify({ received: true }), { status: 200 });
}
