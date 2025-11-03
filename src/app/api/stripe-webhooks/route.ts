
import { NextResponse } from "next/server";
import Stripe from "stripe";
import { adminDb } from "@/firebase/admin";
import { Timestamp, FieldValue } from "firebase-admin/firestore";
import { sendWelcomeEmail } from "@/lib/server-actions";

const stripe = new Stripe(process.env.NEXT_STRIPE_SECRET_KEY!, {
  apiVersion: "2024-06-20",
});

const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET!;

export async function POST(req: Request) {
  const body = await req.text();
  const sig = req.headers.get("stripe-signature");
  let event: Stripe.Event;

  try {
    if (!sig) throw new Error("Missing stripe-signature header");
    if (!endpointSecret) throw new Error("Stripe webhook secret not configured");
    event = stripe.webhooks.constructEvent(body, sig, endpointSecret);
  } catch (err: any) {
    console.error("❌ Webhook signature verification failed:", err.message);
    return new NextResponse(`Webhook Error: ${err.message}`, { status: 400 });
  }

  if (!adminDb) {
    console.error("❌ Firebase Admin DB is not initialized.");
    return new NextResponse("Internal Server Error: Firebase not configured.", { status: 500 });
  }

  // ---------------------------------------------------------------------------
  // ✅ CHECKOUT COMPLETED (subscription start)
  // ---------------------------------------------------------------------------
  if (event.type === "checkout.session.completed") {
    const session = event.data.object as Stripe.Checkout.Session;
    const userId = session.metadata?.userId;
    const plan = session.metadata?.plan;
    const isNewUser = session.metadata?.isNewUser === 'true';

    if (userId && plan && session.mode === "subscription") {
      try {
        const userRef = adminDb.collection("users").doc(userId);
        const subscription = await stripe.subscriptions.retrieve(session.subscription as string);

        const updates = {
          plan,
          subscriptionId: subscription.id,
          subscriptionStatus: subscription.status,
          subscriptionStartsAt: Timestamp.fromMillis(subscription.current_period_start * 1000),
          subscriptionEndsAt: Timestamp.fromMillis(subscription.current_period_end * 1000),
          updatedAt: FieldValue.serverTimestamp(),
        };

        await userRef.update(updates);
        console.log(`✅ Subscription started for user ${userId} (${plan})`);
        
        // Send a welcome email if this is a new user's first subscription
        if (isNewUser) {
          await sendWelcomeEmail(userId);
          console.log(`💌 Welcome email sent to new subscriber ${userId}`);
        }
        
      } catch (error) {
        console.error("❌ Firestore update failed for checkout.session.completed:", error);
        return new NextResponse("Internal Server Error", { status: 500 });
      }
    }
  }
  
  // ---------------------------------------------------------------------------
  // 🔄 SUBSCRIPTION RENEWAL / INVOICE PAID
  // ---------------------------------------------------------------------------
  if (event.type === "invoice.payment_succeeded") {
    const invoice = event.data.object as Stripe.Invoice;
    const subscriptionId = invoice.subscription;

    if (subscriptionId) {
      try {
        const subscription = await stripe.subscriptions.retrieve(subscriptionId as string);
        const userSnapshot = await adminDb
          .collection("users")
          .where("subscriptionId", "==", subscription.id)
          .limit(1)
          .get();

        if (!userSnapshot.empty) {
          const userId = userSnapshot.docs[0].id;
          await adminDb.collection("users").doc(userId).update({
            subscriptionStatus: subscription.status,
            subscriptionStartsAt: Timestamp.fromMillis(subscription.current_period_start * 1000),
            subscriptionEndsAt: Timestamp.fromMillis(subscription.current_period_end * 1000),
            updatedAt: FieldValue.serverTimestamp(),
          });
          console.log(`🔁 Subscription invoice paid for user ${userId}`);
        }
      } catch (error) {
        console.error("❌ Renewal update failed:", error);
        return new NextResponse("Internal Server Error", { status: 500 });
      }
    }
  }

  // ---------------------------------------------------------------------------
  // ⚠️ PAYMENT FAILED
  // ---------------------------------------------------------------------------
  if (event.type === "invoice.payment_failed") {
    const invoice = event.data.object as Stripe.Invoice;
    const subscriptionId = invoice.subscription;
    if (subscriptionId) {
      const userSnapshot = await adminDb
        .collection("users")
        .where("subscriptionId", "==", subscriptionId)
        .limit(1)
        .get();

      if (!userSnapshot.empty) {
        const userId = userSnapshot.docs[0].id;
        await adminDb.collection("users").doc(userId).update({
          subscriptionStatus: "payment_failed",
          updatedAt: FieldValue.serverTimestamp(),
        });
        console.warn(`⚠️ Payment failed for user ${userId}`);
      }
    }
  }

  // ---------------------------------------------------------------------------
  // 🟥 SUBSCRIPTION CANCELED
  // ---------------------------------------------------------------------------
  if (event.type === "customer.subscription.deleted") {
    const subscription = event.data.object as Stripe.Subscription;

    try {
      const userSnapshot = await adminDb
        .collection("users")
        .where("subscriptionId", "==", subscription.id)
        .limit(1)
        .get();

      if (!userSnapshot.empty) {
        const userId = userSnapshot.docs[0].id;
        await adminDb.collection("users").doc(userId).update({
          plan: "starter",
          subscriptionStatus: "canceled",
          subscriptionId: FieldValue.delete(),
          subscriptionStartsAt: FieldValue.delete(),
          subscriptionEndsAt: FieldValue.delete(),
          updatedAt: FieldValue.serverTimestamp(),
        });
        console.log(`🟥 Subscription canceled for user ${userId}`);
      }
    } catch (error) {
      console.error("❌ Cancellation update failed:", error);
      return new NextResponse("Internal Server Error", { status: 500 });
    }
  }

  return new NextResponse(JSON.stringify({ received: true }), { status: 200 });
}
