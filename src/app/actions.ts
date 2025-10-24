
'use server';

import { FieldValue } from 'firebase-admin/firestore';
import { db as lazilyGetDb } from '@/firebase/server';
import { adminAuth } from '@/firebase/admin';
import type { Issue, Plan, ProductionLine, Role, User } from '@/lib/types';
import { handleFirestoreError } from '@/lib/firestore-helpers';
import { sendEmail } from '@/lib/email';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.NEXT_STRIPE_SECRET_KEY!, {
  apiVersion: '2024-06-20',
});

const db = lazilyGetDb();

// --- Stripe Actions ---

export async function createCheckoutSession({
  customerId,
  priceId,
  metadata,
  successUrl,
  cancelUrl,
}: {
  customerId: string;
  priceId: string;
  metadata?: Record<string, string>;
  successUrl: string;
  cancelUrl: string;
}) {
  try {
    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      mode: 'subscription',
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      allow_promotion_codes: true, // if you want coupons or discounts
      subscription_data: {
        trial_settings: {
          end_behavior: { missing_payment_method: 'cancel' },
        },
        metadata,
      },
      success_url: successUrl,
      cancel_url: cancelUrl,
    });

    return { url: session.url };
  } catch (error: any) {
    console.error('Stripe session error:', error);
    throw new Error(error.message);
  }
}

export async function getCheckoutSession(sessionId: string) {
  try {
    const session = await stripe.checkout.sessions.retrieve(sessionId, { expand: ['subscription'] });
    return { session };
  } catch (err: any) {
    return { error: err.message };
  }
}

export async function getOrCreateStripeCustomer(email: string): Promise<Stripe.Customer> {
    const customers = await stripe.customers.list({ email, limit: 1 });
    if (customers.data.length > 0 && customers.data[0]) {
        return customers.data[0];
    }
    return await stripe.customers.create({ email });
}

// --- Data Fetching ---

export async function getProductionLines(orgId: string): Promise<ProductionLine[]> {
  if (!db) return [];
  try {
    const snapshot = await db.collection('productionLines').where('orgId', '==', orgId).get();
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as ProductionLine));
  } catch (error) {
    console.error(error);
    return [];
  }
}

export async function getAllUsers(orgId: string): Promise<User[]> {
  if (!db) return [];
  try {
    const snapshot = await db.collection('users').where('orgId', '==', orgId).get();
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as User));
  } catch (error) {
    console.error(error);
    return [];
  }
}

export async function getUserByEmail(email: string): Promise<User | null> {
  if (!db) return null;

  try {
    const snapshot = await db.collection('users').where('email', '==', email).get();

    if (snapshot.empty) return null;

    const doc = snapshot.docs[0];
    const data = doc.data() as Omit<User, 'id'>; // assert type for Firestore data

    return { id: doc.id, ...data };
  } catch (error) {
    console.error('Error fetching user by email:', error);
    return null; // return null instead of handleFirestoreError to match return type
  }
}

export async function getUserById(uid: string): Promise<User | null> {
  if (!db) return null;
  try {
    const docSnap = await db.collection('users').doc(uid).get();
    if (!docSnap.exists) return null;
    return { id: docSnap.id, ...docSnap.data() } as User;
  } catch (error) {
    console.error(error);
    return null;
  }
}

// --- User Actions ---

export async function addUser(userData: {
  firstName: string;
  lastName: string;
  email: string;
  role: Role;
  plan: Plan;
  orgId: string;
}) {
  if (!db || !adminAuth) return handleFirestoreError(new Error('Admin SDK not initialized'));

  try {
    const { email, firstName, lastName, role, plan, orgId } = userData;

    if (await getUserByEmail(email)) return { success: false, error: 'Email already exists' };

    const password = Math.random().toString(36).slice(-8);
    const userRecord = await adminAuth.createUser({ email, password, displayName: `${firstName} ${lastName}` });

    const newUser: Omit<User, 'id'> = {
      firstName,
      lastName,
      email,
      role,
      plan,
      orgId,
      notificationPreferences: { newIssue: false, issueResolved: false, muteSound: true },
      theme: 'system',
      address: '',
      city: '',
      postalCode: '',
      country: ''
    };

    await db.collection('users').doc(userRecord.uid).set(newUser);

    const resetLink = await adminAuth.generatePasswordResetLink(email);
    await sendEmail({ to: email, subject: "Welcome to AndonPro!", html: `<p>Set your password: <a href="${resetLink}">Click here</a></p>` });

    return { success: true, userId: userRecord.uid };
  } catch (err: any) {
    return handleFirestoreError(err);
  }
}

export async function editUser(userId: string, data: { firstName: string; lastName: string; email: string; role: Role }) {
  if (!db || !adminAuth) return handleFirestoreError(new Error('Admin SDK not initialized'));
  try {
    await db.collection('users').doc(userId).update(data);
    const authUser = await adminAuth.getUser(userId);
    if (authUser.email !== data.email) await adminAuth.updateUser(userId, { email: data.email });
    return { success: true };
  } catch (err) {
    return handleFirestoreError(err);
  }
}

export async function deleteUser(userId: string) {
  if (!db) return handleFirestoreError(new Error('Firestore not initialized'));
  try {
    await db.collection('users').doc(userId).delete();
    return { success: true };
  } catch (err) {
    return handleFirestoreError(err);
  }
}

export async function updateUserPlan(userId: string, newPlan: Plan, planData: Partial<User>) {
  if (!db) return handleFirestoreError(new Error('Firestore not initialized'));
  try {
    const userRef = db.collection('users').doc(userId);
    const userSnap = await userRef.get();
    if (!userSnap.exists) return { success: false, error: 'User not found' };

    const updateData: any = { ...planData, plan: newPlan };
    if (newPlan === 'starter') {
      updateData.subscriptionId = FieldValue.delete();
      updateData.subscriptionStartsAt = FieldValue.delete();
      updateData.subscriptionEndsAt = FieldValue.delete();
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
    if (!db) return handleFirestoreError(new Error('Firestore not initialized'));
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
    if (!adminAuth) return { success: false, message: 'Password reset service is unavailable.' };
    try {
        // We generate the link regardless of whether the user exists to prevent email enumeration
        const link = await adminAuth.generatePasswordResetLink(email);
        await sendEmail({ to: email, subject: "Reset your password", html: `<p>Reset your password here: <a href="${link}">${link}</a></p>` });
    } catch (error) {
        // Do not expose specific errors to the client
        console.error("Password reset error:", error);
    }
    // Always return a generic success message
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


export async function changePassword(email: string, currentPass: string, newPass: string) {
    if (!adminAuth) return { success: false, error: "Authentication service unavailable." };
    try {
        // This is a placeholder for a more secure verification method
        // In a real app, you would re-authenticate the user on the client before calling this
        return { success: true };
    } catch (error) {
        return handleFirestoreError(error);
    }
}

// --- Issue Actions ---

export async function reportIssue(issueData: Omit<Issue, 'id' | 'reportedAt' | 'reportedBy' | 'status'>, userEmail: string) {
  if (!db) return handleFirestoreError(new Error('Firestore not initialized'));
  try {
    const reporter = await getUserByEmail(userEmail);
    if (!reporter) return { success: false, error: 'Reporting user not found' };

    const newIssue = { ...issueData, status: 'reported', reportedAt: FieldValue.serverTimestamp(), reportedBy: { name: `${reporter.firstName} ${reporter.lastName}`, email: reporter.email } };
    if (newIssue.subCategory === '') delete newIssue.subCategory;

    const docRef = await db.collection('issues').add(newIssue);
    const issueId = docRef.id;

    // Notify admins/supervisors
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
  if (!db) return handleFirestoreError(new Error('Firestore not initialized'));
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

    // Notify reporter if resolved
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

// --- Production Line Actions ---

export async function createProductionLine(name: string, orgId: string) {
  if (!db) return handleFirestoreError(new Error('Firestore not initialized'));
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
  if (!db) return handleFirestoreError(new Error('Firestore not initialized'));
  try {
    await db.collection('productionLines').doc(lineId).update({ name: data.name, workstations: data.workstations.map(ws => ws.value) });
    return { success: true };
  } catch (err) {
    return handleFirestoreError(err);
  }
}

export async function deleteProductionLine(lineId: string) {
  if (!db) return handleFirestoreError(new Error('Firestore not initialized'));
  try {
    await db.collection('productionLines').doc(lineId).delete();
    return { success: true };
  } catch (err) {
    return handleFirestoreError(err);
  }
}
