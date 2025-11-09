
import { NextResponse } from "next/server";
import Stripe from "stripe";
import { adminDb } from "@/firebase/admin";
import { Timestamp, FieldValue } from "firebase-admin/firestore";
import { sendWelcomeEmail } from "@/lib/server-actions";
import { priceIdToPlan } from "@/lib/stripe-prices";
import type { Plan } from "@/lib/types";

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
  
  const db = adminDb();

  // ---------------------------------------------------------------------------
  // ✅ CHECKOUT COMPLETED (subscription start)
  // ---------------------------------------------------------------------------
  if (event.type === "checkout.session.completed") {
    const session = event.data.object as Stripe.Checkout.Session;
    
    // IMPORTANT: Get userId from client_reference_id, not metadata
    const userId = session.client_reference_id;
    const isNewUser = session.metadata?.isNewUser === 'true'; // Keep metadata for this flag

    if (!userId) {
      console.error("❌ checkout.session.completed: Missing client_reference_id (userId).");
      return new NextResponse("Webhook Error: Missing client_reference_id", { status: 400 });
    }

    if (session.mode === "subscription") {
      try {
        const subscription = await stripe.subscriptions.retrieve(session.subscription as string);
        
        // Determine the plan from the price ID
        const priceId = subscription.items.data[0]?.price.id;
        if (!priceId) {
            console.error(`❌ checkout.session.completed: No price ID found for subscription ${subscription.id}`);
            return new NextResponse("Webhook Error: Could not determine plan from subscription", { status: 400 });
        }
        const plan: Plan | undefined = priceIdToPlan[priceId];

        if (!plan) {
            console.error(`❌ checkout.session.completed: Could not map price ID "${priceId}" to a known plan.`);
            return new NextResponse("Webhook Error: Unknown price ID", { status: 400 });
        }
        
        const userRef = db.collection("users").doc(userId);

        const updates = {
          plan,
          subscriptionId: subscription.id,
          subscriptionStatus: 'active' as const,
          subscriptionStartsAt: Timestamp.fromMillis(subscription.current_period_start * 1000),
          subscriptionEndsAt: Timestamp.fromMillis(subscription.current_period_end * 1000),
          updatedAt: FieldValue.serverTimestamp(),
        };

        await userRef.update(updates);
        console.log(`✅ Subscription started for user ${userId} (${plan})`);
        
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
        const userSnapshot = await db
          .collection("users")
          .where("subscriptionId", "==", subscription.id)
          .limit(1)
          .get();

        if (!userSnapshot.empty) {
          const userId = userSnapshot.docs[0].id;
          await db.collection("users").doc(userId).update({
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
      const userSnapshot = await db
        .collection("users")
        .where("subscriptionId", "==", subscriptionId)
        .limit(1)
        .get();

      if (!userSnapshot.empty) {
        const userId = userSnapshot.docs[0].id;
        await db.collection("users").doc(userId).update({
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
      const userSnapshot = await db
        .collection("users")
        .where("subscriptionId", "==", subscription.id)
        .limit(1)
        .get();

      if (!userSnapshot.empty) {
        const userId = userSnapshot.docs[0].id;
        await db.collection("users").doc(userId).update({
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
