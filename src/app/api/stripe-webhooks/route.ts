import { NextResponse } from "next/server";
import Stripe from "stripe";
import { adminDb } from "@/firebase/admin";
import { Timestamp, FieldValue } from "firebase-admin/firestore";

const stripe = new Stripe(process.env.NEXT_STRIPE_SECRET_KEY!, {
  apiVersion: "2024-06-20",
});

const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET!;

// Utility to add months to a given date
const addMonths = (date: Date, months: number): Date => {
  const newDate = new Date(date);
  newDate.setMonth(newDate.getMonth() + months);
  return newDate;
};

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
  // ✅ CHECKOUT COMPLETED (first purchase / subscription start)
  // ---------------------------------------------------------------------------
  if (event.type === "checkout.session.completed") {
    const session = event.data.object as Stripe.Checkout.Session;
    const userId = session.metadata?.userId;
    const plan = session.metadata?.plan;
    const duration = parseInt(session.metadata?.duration || "1", 10);

    if (userId && plan) {
      try {
        const userRef = adminDb.collection("users").doc(userId);

        let subscriptionId: string | null = null;
        let subscriptionStartsAt = new Date();
        let subscriptionEndsAt = new Date();

        if (session.mode === "subscription") {
          const subscription = await stripe.subscriptions.retrieve(
            session.subscription as string
          );
          subscriptionId = subscription.id;
          subscriptionStartsAt = new Date(subscription.current_period_start * 1000);
          subscriptionEndsAt = new Date(subscription.current_period_end * 1000);

          // 🧩 Detect upfront prepaid setup using a long trial
          const updates: Record<string, any> = {
            plan,
            subscriptionId,
            subscriptionStartsAt: Timestamp.fromDate(subscriptionStartsAt),
            subscriptionEndsAt: Timestamp.fromDate(subscriptionEndsAt),
            updatedAt: FieldValue.serverTimestamp(),
            subscriptionStatus: subscription.status,
          };

          if (subscription.trial_end && subscription.trial_end * 1000 > Date.now()) {
            updates.trialEndsAt = Timestamp.fromMillis(subscription.trial_end * 1000);
            updates.isPrepaid = true;
          } else {
            updates.isPrepaid = false;
          }

          await userRef.update(updates);
          console.log(`✅ Subscription started for user ${userId} (${plan})`);
        }

        // Handle one-time upfront purchase (if any legacy payment mode)
        if (session.mode === "payment") {
          subscriptionId = session.payment_intent as string;
          subscriptionEndsAt = addMonths(subscriptionStartsAt, duration);

          await userRef.update({
            plan,
            subscriptionId,
            subscriptionStartsAt: Timestamp.fromDate(subscriptionStartsAt),
            subscriptionEndsAt: Timestamp.fromDate(subscriptionEndsAt),
            isPrepaid: true,
            updatedAt: FieldValue.serverTimestamp(),
            subscriptionStatus: "active",
          });

          console.log(`✅ One-time prepaid plan recorded for user ${userId}`);
        }
      } catch (error) {
        console.error("❌ Firestore update failed for checkout.session.completed:", error);
        return new NextResponse("Internal Server Error", { status: 500 });
      }
    }
  }

  // ---------------------------------------------------------------------------
  // 🔄 SUBSCRIPTION RENEWAL (monthly continuation or prepaid → regular)
  // ---------------------------------------------------------------------------
  if (event.type === "invoice.payment_succeeded") 
    
    {
    const invoice = event.data.object as Stripe.Invoice;
    const subscriptionId = invoice.subscription;

    if (
      (invoice.billing_reason === "subscription_cycle" ||
        invoice.billing_reason === "subscription_create") &&
      subscriptionId
    ) {
      try {
        const subscription = await stripe.subscriptions.retrieve(subscriptionId as string);
        const userSnapshot = await adminDb
          .collection("users")
          .where("subscriptionId", "==", subscription.id)
          .limit(1)
          .get();

        if (!userSnapshot.empty) {
          const userId = userSnapshot.docs[0].id;
          const userDoc = userSnapshot.docs[0].data();

          const updates: Record<string, any> = {
            subscriptionStartsAt: Timestamp.fromMillis(subscription.current_period_start * 1000),
            subscriptionEndsAt: Timestamp.fromMillis(subscription.current_period_end * 1000),
            updatedAt: FieldValue.serverTimestamp(),
            subscriptionStatus: subscription.status,
          };

          // 🧩 Transition from prepaid → normal monthly
          if (userDoc.isPrepaid && userDoc.trialEndsAt && Date.now() > userDoc.trialEndsAt.toMillis()) {
            updates.isPrepaid = false;
            updates.trialEndsAt = FieldValue.delete();
          }

          await adminDb.collection("users").doc(userId).update(updates);
          console.log(`🔁 Subscription renewed for user ${userId}`);
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
          trialEndsAt: FieldValue.delete(),
          isPrepaid: FieldValue.delete(),
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
