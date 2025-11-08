
'use server';

import type { Issue, Plan, ProductionLine, Role, User } from '@/lib/types';
import { handleFirestoreError } from '@/lib/firestore-helpers';
import { sendEmail } from '@/lib/email';
import { adminAuth, adminDb } from '@/firebase/admin';
import { FieldValue, Firestore } from 'firebase-admin/firestore';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.NEXT_STRIPE_SECRET_KEY!, {
  apiVersion: '2024-06-20',
});

export async function getUserByEmail(email: string): Promise<User | null> {
  const db = adminDb();
  try {
    const snapshot = await db.collection('users').where('email', '==', email).get();
    if (snapshot.empty) return null;
    const doc = snapshot.docs[0];
    return { id: doc.id, ...(doc.data() as Omit<User, 'id'>) };
  } catch (err) {
    console.error('Error fetching user by email:', err);
    return null;
  }
}

export async function getUserById(uid: string): Promise<User | null> {
  const db = adminDb();
  try {
    const docSnap = await db.collection('users').doc(uid).get();
    if (!docSnap.exists) return null;
    return { id: docSnap.id, ...docSnap.data() } as User;
  } catch (err) {
    console.error(err);
    return null;
  }
}

export async function addUser(userData: {
  firstName: string;
  lastName: string;
  email: string;
  role: Role;
  plan: Plan;
  orgId: string;
}) {
  const db = adminDb();
  const auth = adminAuth();
  try {
    const { email, firstName, lastName, role, plan, orgId } = userData;
    if (await getUserByEmail(email)) return { success: false, error: 'Email already exists' };

    const password = Math.random().toString(36).slice(-8);
    const userRecord = await auth.createUser({ email, password, displayName: `${firstName} ${lastName}` });

    const newUser: Omit<User, 'id'> = {
      firstName,
      lastName,
      email,
      role,
      plan: userData.plan,
      orgId,
      notificationPreferences: { newIssue: false, issueResolved: false, muteSound: true },
      theme: 'light',
      address: '',
      city: '',
      postalCode: '',
      country: ''
    };

    await db.collection('users').doc(userRecord.uid).set(newUser);
    const resetLink = await auth.generatePasswordResetLink(email);
    
    const emailHtml = `
      <p><b>Welcome to AndonPro</b></p>
      <p>You have been invited to join your team on AndonPro.</p>
      <p>To get started, please set your password by clicking the link below:</p>
      <p><a href="${resetLink}">Set Your Password</a></p>
      <p>This link will expire in 24 hours.</p>
    `;

    await sendEmail({ to: email, subject: "Welcome to AndonPro!", html: emailHtml });
    return { success: true, userId: userRecord.uid };
  } catch (err: any) {
    return handleFirestoreError(err);
  }
}

export async function editUser(userId: string, data: { firstName: string; lastName: string; email: string; role: Role }) {
  const db = adminDb();
  const auth = adminAuth();
  try {
    await db.collection('users').doc(userId).update(data);
    const authUser = await auth.getUser(userId);
    if (authUser.email !== data.email) await auth.updateUser(userId, { email: data.email });
    return { success: true };
  } catch (err) {
    return handleFirestoreError(err);
  }
}

export async function deleteUser(userId: string) {
  const db = adminDb();
  const auth = adminAuth();
  try {
    await db.collection('users').doc(userId).delete();
    // Also delete from Firebase Auth
    await auth.deleteUser(userId);
    return { success: true };
  } catch (err) {
    return handleFirestoreError(err);
  }
}

export async function updateUserPlan(userId: string, newPlan: Plan, planData: Partial<User>) {
  const db = adminDb();
  try {
    const userRef = db.collection('users').doc(userId);
    const userSnap = await userRef.get();
    if (!userSnap.exists) return { success: false, error: 'User not found' };

    const updateData: any = { ...planData, plan: newPlan };
    if (newPlan === 'starter') {
      updateData.subscriptionId = FieldValue.delete();
      updateData.subscriptionStartsAt = FieldValue.delete();
      updateData.subscriptionEndsAt = FieldValue.delete();
      updateData.stripeCustomerId = FieldValue.delete();
    }

    await userRef.update(updateData);
    const user = userSnap.data() as User;
    await sendEmail({ to: user.email, subject: "Plan Changed", html: `<p>Your plan has been updated to ${newPlan}</p>` });
    return { success: true };
  } catch (err) {
    return handleFirestoreError(err);
  }
}

export async function sendWelcomeEmail(userId: string) {
  try {
    const user = await getUserById(userId);
    if (!user) return { success: false, error: "User not found" };

    await sendEmail({
      to: user.email,
      subject: "Welcome to AndonPro!",
      html: `<h1>Welcome, ${user.firstName}!</h1><p>Your account is ready. <a href="${process.env.NEXT_PUBLIC_BASE_URL}/dashboard">Go to your dashboard</a>.</p>`
    });
    return { success: true };
  } catch (err: any) {
    return handleFirestoreError(err);
  }
}

export async function requestPasswordReset(email: string) {
  const auth = adminAuth();
  try {
    const link = await auth.generatePasswordResetLink(email);
    await sendEmail({ to: email, subject: "Reset your password", html: `<p>You can reset your password by clicking this link: <a href="${link}">${link}</a></p>` });
  } catch (error: any) {
    // Don't reveal if an email doesn't exist.
    if (error.code !== 'auth/user-not-found') {
      console.error("Password reset error:", error);
    }
  }
  return { success: true, message: "If an account exists for this email, a password reset link has been sent." };
}

export async function sendPasswordChangedEmail(email: string) {
  try {
    await sendEmail({
      to: email,
      subject: "Your Password Has Been Changed",
      html: "<p>Your password for AndonPro has been successfully changed. If you did not make this change, please contact our support team immediately.</p>",
    });
    return { success: true };
  } catch (err) {
    return handleFirestoreError(err);
  }
}


// ---------------- Issue Actions ----------------

export async function reportIssue(issueData: Omit<Issue, 'id' | 'reportedAt' | 'reportedBy' | 'status'>, userEmail: string) {
  const db = adminDb();
  try {
    const reporter = await getUserByEmail(userEmail);
    if (!reporter) return { success: false, error: 'Reporting user not found' };

    const newIssue = { ...issueData, status: 'reported', reportedAt: FieldValue.serverTimestamp(), reportedBy: { name: `${reporter.firstName} ${reporter.lastName}`, email: reporter.email } };
    if (newIssue.subCategory === '') delete newIssue.subCategory;

    const docRef = await db.collection('issues').add(newIssue);
    const issueId = docRef.id;

    const usersSnapshot = await db.collection('users').where('orgId', '==', issueData.orgId).get();
    const recipients = usersSnapshot.docs.map(d => d.data() as User).filter(u => ['admin', 'supervisor'].includes(u.role) && u.notificationPreferences?.newIssue);
    const dashboardUrl = `${process.env.NEXT_PUBLIC_BASE_URL ?? 'http://localhost:3000'}/issues`;

    for (const user of recipients) {
      await sendEmail({ to: user.email, subject: `New Issue: ${issueData.title}`, html: `<p>View issue: <a href="${dashboardUrl}">${issueData.title}</a></p>` });
    }

    return { success: true, issueId };
  } catch (err) {
    return handleFirestoreError(err);
  }
}

export async function updateIssue(issueId: string, data: { resolutionNotes?: string; status: 'in_progress' | 'resolved'; productionStopped: boolean }, userEmail: string) {
  const db = adminDb();
  try {
    const resolver = await getUserByEmail(userEmail);
    if (!resolver) return { success: false, error: 'Resolving user not found' };

    const issueRef = db.collection('issues').doc(issueId);
    const issueSnap = await issueRef.get();
    if (!issueSnap.exists) return { success: false, error: 'Issue not found' };
    const issue = issueSnap.data() as Issue;

    const updateData: any = { ...data };
    if (data.status === 'resolved') {
      updateData.resolvedAt = FieldValue.serverTimestamp();
      updateData.resolvedBy = { name: `${resolver.firstName} ${resolver.lastName}`, email: resolver.email };
    }

    await issueRef.update(updateData);

    if (data.status === 'resolved') {
      const reporter = await getUserByEmail(issue.reportedBy.email);
      if (reporter && reporter.notificationPreferences?.issueResolved) {
        const dashboardUrl = `${process.env.NEXT_PUBLIC_BASE_URL ?? 'http://localhost:3000'}/issues`;
        await sendEmail({ to: reporter.email, subject: `Your issue resolved: ${issue.title}`, html: `<p>View issue: <a href="${dashboardUrl}">${issue.title}</a></p>` });
      }
    }

    return { success: true };
  } catch (err) {
    return handleFirestoreError(err);
  }
}

// ---------------- Production Line Actions ----------------

export async function getProductionLines(orgId: string): Promise<ProductionLine[]> {
  const db = adminDb();
  try {
    const snapshot = await db.collection('productionLines').where('orgId', '==', orgId).get();
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as ProductionLine));
  } catch (err) {
    console.error(err);
    return [];
  }
}

export async function createProductionLine(name: string, orgId: string) {
  const db = adminDb();
  try {
    const snapshot = await db.collection('productionLines').where('name', '==', name).where('orgId', '==', orgId).get();
    if (!snapshot.empty) return { success: false, error: 'Production line exists' };
    const docRef = await db.collection('productionLines').add({ name, workstations: [], orgId });
    return { success: true, id: docRef.id };
  } catch (err) {
    return handleFirestoreError(err);
  }
}

export async function editProductionLine(lineId: string, data: { name: string; workstations: { value: string }[] }) {
  const db = adminDb();
  try {
    await db.collection('productionLines').doc(lineId).update({ name: data.name, workstations: data.workstations.map(ws => ws.value) });
    return { success: true };
  } catch (err) {
    return handleFirestoreError(err);
  }
}

export async function deleteProductionLine(lineId: string) {
  const db = adminDb();
  try {
    await db.collection('productionLines').doc(lineId).delete();
    return { success: true };
  } catch (err) {
    return handleFirestoreError(err);
  }
}

// ---------------- Users List ----------------

export async function getAllUsers(orgId: string): Promise<User[]> {
  const db = adminDb();
  try {
    const snapshot = await db.collection('users').where('orgId', '==', orgId).get();
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as User));
  } catch (error) {
    console.error(error);
    return [];
  }
}


// ---------------- Subscription Actions ----------------

export async function cancelSubscription(userId: string, subscriptionId: string) {
    const db = adminDb();

    try {
        const subscription = await stripe.subscriptions.update(subscriptionId, {
            cancel_at_period_end: true,
        });

        await db.collection('users').doc(userId).update({
            subscriptionStatus: 'canceled'
        });

        return { success: true, subscription };
    } catch (error: any) {
        console.error("Stripe cancellation error:", error);
        return { success: false, error: error.message };
    }
}


// ---------------- Registration Actions ----------------
export async function cancelRegistrationAndDeleteUser(userId: string) {
  const auth = adminAuth();
  try {
    await auth.deleteUser(userId);
    return { success: true };
  } catch (err) {
    return handleFirestoreError(err);
  }
}

// ---------------- Stripe & Checkout Actions ----------------

export async function getOrCreateStripeCustomer(userId: string, email: string): Promise<{ id: string }> {
  const db = adminDb();

  const userRef = db.collection('users').doc(userId);
  const userSnapshot = await userRef.get();
  const userData = userSnapshot.data() as User | undefined;

  // 1. If user has a Stripe ID and it's valid, return it.
  if (userData?.stripeCustomerId) {
    try {
      const stripeCustomer = await stripe.customers.retrieve(userData.stripeCustomerId);
      if (stripeCustomer && !stripeCustomer.deleted) {
        return { id: stripeCustomer.id };
      }
    } catch (error) {
      console.warn(`Stripe customer ID ${userData.stripeCustomerId} for user ${userId} is invalid. A new one will be created.`);
    }
  }

  // 2. Create a new Stripe customer.
  const newCustomer = await stripe.customers.create({
    email,
    metadata: { userId },
  });

  // 3. Save the new customer ID to Firestore.
  await userRef.update({ stripeCustomerId: newCustomer.id });

  return { id: newCustomer.id };
}

export async function getPriceDetails(priceId: string) {
  if (!priceId) return null;

  try {
    const price = await stripe.prices.retrieve(priceId);
    if (!price || !price.product) return null;

    const product = await stripe.products.retrieve(price.product as string);
    if (!product) return null;

    return {
      price: (price.unit_amount || 0) / 100,
      currency: price.currency,
      plan: product.metadata.plan || 'unknown',
      duration: product.metadata.duration || '1',
    };
  } catch (error) {
    console.error("Error fetching Stripe price details:", error);
    return null;
  }
}

export async function createCheckoutSession({
  customerId,
  plan,
  duration,
  currency,
  metadata = {},
  returnPath,
}: {
  customerId: string;
  plan: Plan;
  duration: string;
  currency: string;
  metadata?: Record<string, string>;
  returnPath?: string;
}) {
  if (!customerId) throw new Error("Customer ID is required");
  if (!plan || plan === 'starter') throw new Error("A valid, non-starter plan is required.");
  if (!currency) throw new Error("Currency is required");
  
  const priceIdMap: Record<Exclude<Plan, 'starter' | 'custom'>, Record<string, string>> = {
    standard: {
      usd: 'price_1SPNLkCKFYqU3RzmZhRSbLM9',
      eur: 'price_1SPNA1CKFYqU3Rzm2XZEmQFR',
      gbp: 'price_1SPNPJCKFYqU3Rzm5KFKS4l9',
    },
    pro: {
      usd: 'price_1SPNMSCKFYqU3Rzm6COoQBOC',
      eur: 'price_1SPNBbCKFYqU3RzmrE3IRkyz',
      gbp: 'price_1SPNQ1CKFYqU3RzmjiwhweIL',
    },
    enterprise: {
      usd: 'price_1SPNNRCKFYqU3RzmJLR5wDnF',
      eur: 'price_1SPNCdCKFYqU3RzmOsFnGBky',
      gbp: 'price_1SQoMYCKFYqU3RzmpzctK1XO',
    },
  };

  try {
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL;
    if (!baseUrl) throw new Error("NEXT_PUBLIC_BASE_URL is not defined.");

    const priceId = priceIdMap[plan as Exclude<Plan, 'starter' | 'custom'>]?.[currency];

    if (!priceId) {
      throw new Error(`Stripe price ID for ${plan} in ${currency} not found.`);
    }

    const couponMap: Record<string, string | undefined> = {
      '12': process.env.STRIPE_COUPON_20_OFF,
      '24': process.env.STRIPE_COUPON_30_OFF,
      '48': process.env.STRIPE_COUPON_40_OFF,
    };
    
    const couponId = couponMap[duration];
    const discounts = [];
    if (couponId) {
        discounts.push({ coupon: couponId });
    }

    const returnUrl = returnPath
      ? `${baseUrl}${returnPath}`
      : `${baseUrl}/dashboard?payment_success=true&session_id={CHECKOUT_SESSION_ID}`;

    const sessionParams: Stripe.Checkout.SessionCreateParams = {
      mode: 'subscription',
      customer: customerId,
      line_items: [{ price: priceId, quantity: 1 }],
      discounts: discounts,
      ui_mode: 'embedded',
      return_url: returnUrl,
      metadata,
      subscription_data: { metadata },
      customer_update: { address: 'auto' },
      automatic_tax: { enabled: true },
    };

    const session = await stripe.checkout.sessions.create(sessionParams);

    console.log(`✅ Stripe checkout session created: ${session.id} with ${discounts.length > 0 ? `coupon ${couponId}` : 'no coupon'}`);
    return { clientSecret: session.client_secret };

  } catch (err: any) {
    console.error("❌ Stripe checkout session creation failed:", err);
    throw new Error(err.message || "Failed to create Stripe checkout session.");
  }
};


export async function sendContactEmail({ name, email, message }: { name: string; email: string; message: string; }) {
    const supportEmail = 'support@andonpro.com';
    const emailHtmlToSupport = `
        <p>You have received a new contact form submission from:</p>
        <ul>
            <li><strong>Name:</strong> ${name}</li>
            <li><strong>Email:</strong> ${email}</li>
        </ul>
        <p><strong>Message:</strong></p>
        <p>${message}</p>
    `;

    const emailHtmlToUser = `
        <p>Hello ${name},</p>
        <p>Thank you for contacting AndonPro. We have received your message and will get back to you as soon as possible.</p>
        <p>Here is a copy of your message:</p>
        <blockquote style="border-left: 2px solid #ccc; padding-left: 1rem; margin-left: 1rem; font-style: italic;">
            ${message}
        </blockquote>
        <p>Best regards,<br/>The AndonPro Team</p>
    `;

    try {
        // Send email to support
        await sendEmail({
            to: supportEmail,
            subject: `New Contact Form Submission from ${name}`,
            html: emailHtmlToSupport,
        });

        // Send confirmation email to user
        await sendEmail({
            to: email,
            subject: 'Thank You for Contacting AndonPro',
            html: emailHtmlToUser,
        });

        return { success: true };
    } catch (error) {
        console.error('Failed to send contact email:', error);
        return { success: false, error: 'Failed to send your message. Please try again later.' };
    }
}
