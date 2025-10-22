
'use server';

import {
  FieldValue,
  getFirestore,
  Timestamp,
} from 'firebase-admin/firestore';
import { db as lazilyGetDb } from '@/firebase/server';
import { adminAuth } from '@/firebase/admin';
import type { Issue, Plan, ProductionLine, Role, User } from '@/lib/types';
import { handleFirestoreError } from '@/lib/firestore-helpers';
import { sendEmail } from '@/lib/email';
import { getAuth } from 'firebase/auth';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.NEXT_STRIPE_SECRET_KEY!, {
  apiVersion: '2024-06-20',
});


const db = lazilyGetDb();

// --- Stripe Actions ---

export async function createCheckoutSession(
  userId: string,
  email: string,
  plan: Plan,
  duration: '1' | '12' | '24' | '48',
  currency: 'usd' | 'eur' | 'gbp',
  isNewUser: boolean
): Promise<{ clientSecret?: string; error?: string }> {
  if (!stripe) {
    return { error: 'Stripe is not initialized.' };
  }
  if (!process.env.NEXT_PUBLIC_BASE_URL) {
      return { error: "Base URL is not configured."}
  }

  const priceIdMap = {
      standard: process.env.STRIPE_PRICE_ID_STANDARD,
      pro: process.env.STRIPE_PRICE_ID_PRO,
      enterprise: process.env.STRIPE_PRICE_ID_ENTERPRISE,
  };

  const priceId = priceIdMap[plan as keyof typeof priceIdMap];

  if (!priceId) {
      return { error: `Price ID for plan '${plan}' is not configured.`};
  }

  const couponIdMap = {
      '12': process.env.STRIPE_COUPON_ID_12_MONTHS, 
      '24': process.env.STRIPE_COUPON_ID_24_MONTHS, 
      '48': process.env.STRIPE_COUPON_ID_48_MONTHS, 
  };
  
  const couponId = duration !== '1' ? couponIdMap[duration as keyof typeof couponIdMap] : undefined;

  const successUrl = `${process.env.NEXT_PUBLIC_BASE_URL}/checkout/success?session_id={CHECKOUT_SESSION_ID}`;
  
  const metadata = {
      userId,
      plan,
      duration,
      isNewUser: String(isNewUser),
  };

  try {
    const session = await stripe.checkout.sessions.create({
      ui_mode: 'embedded',
      payment_method_types: ['card'],
      line_items: [{
          price: priceId,
          quantity: 1,
      }],
      mode: 'subscription',
      customer_email: email,
      metadata,
      discounts: couponId ? [{ coupon: couponId }] : [],
      return_url: successUrl,
    });
    
    return { clientSecret: session.client_secret! };
  } catch (error: any) {
    console.error("Error creating Stripe Checkout session:", error);
    return { error: error.message };
  }
}

export async function getCheckoutSession(sessionId: string) {
    if (!stripe) {
        return { error: 'Stripe is not initialized.' };
    }
    try {
        const session = await stripe.checkout.sessions.retrieve(sessionId);
        return { session };
    } catch (error: any) {
        return { error: error.message };
    }
}


// --- Data fetching actions ---

export async function getProductionLines(orgId: string): Promise<ProductionLine[]> {
  if (!db) return [];
  try {
    const snapshot = await db.collection('productionLines').where('orgId', '==', orgId).get();
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as ProductionLine));
  } catch (error) {
    console.error('Error fetching production lines:', error);
    return [];
  }
}

export async function getAllUsers(orgId: string): Promise<User[]> {
  if (!db) return [];
  try {
    const snapshot = await db.collection('users').where('orgId', '==', orgId).get();
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as User));
  } catch (error) {
    console.error('Error fetching all users:', error);
    return [];
  }
}

export async function getUserByEmail(email: string): Promise<User | null> {
  if (!db) return null;
  try {
    const snapshot = await db.collection('users').where('email', '==', email).get();
    if (snapshot.empty) return null;
    const doc = snapshot.docs[0];
    return { id: doc.id, ...doc.data() } as User;
  } catch (error) {
    handleFirestoreError(error);
    return null;
  }
}

export async function getUserById(uid: string): Promise<User | null> {
  if (!db) return null;
  try {
    const docRef = db.collection('users').doc(uid);
    const docSnap = await docRef.get();
    if (!docSnap.exists) return null;
    return { id: docSnap.id, ...docSnap.data() } as User;
  } catch (error) {
    console.error(`Error fetching user by ID ${uid}:`, error);
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

    const existingUser = await getUserByEmail(email);
    if (existingUser) return { success: false, error: 'A user with this email already exists.' };

    const randomPassword = Math.random().toString(36).slice(-8);

    const userRecord = await adminAuth.createUser({
      email,
      password: randomPassword,
      displayName: `${firstName} ${lastName}`,
    });

    const newUser: Omit<User, 'id'|'subscriptionStartsAt'|'subscriptionEndsAt'|'address'|'city'|'postalCode'|'country'|'phone'> = {
      firstName,
      lastName,
      email,
      role,
      plan,
      orgId,
      notificationPreferences: { newIssue: false, issueResolved: false, muteSound: true },
      theme: 'system',
    };

    await db.collection('users').doc(userRecord.uid).set(newUser);

    const resetLink = await adminAuth.generatePasswordResetLink(email);
    await sendEmail({
      to: email,
      subject: "You're invited to AndonPro!",
      html: `<h1>Welcome to AndonPro</h1>
             <p>You have been invited to join your team on AndonPro.</p>
             <p>To get started, please set your password by clicking the link below:</p>
             <a href="${resetLink}">Set Your Password</a>
             <p>This link will expire in 24 hours.</p>`,
    });

    return { success: true, userId: userRecord.uid };
  } catch (error: any) {
    if (error.code === 'auth/email-already-exists') {
      return { success: false, error: 'A user with this email already exists in Firebase Authentication.' };
    }
    return handleFirestoreError(error);
  }
}

export async function editUser(
  userId: string,
  userData: { firstName: string; lastName: string; email: string; role: Role }
) {
  if (!db || !adminAuth) return handleFirestoreError(new Error('Admin SDK not initialized'));
  try {
    await db.collection('users').doc(userId).update(userData);

    const authUser = await adminAuth.getUser(userId);
    if (authUser.email !== userData.email) {
      await adminAuth.updateUser(userId, { email: userData.email });
    }

    return { success: true };
  } catch (error) {
    return handleFirestoreError(error);
  }
}

export async function deleteUser(userId: string) {
  if (!db) return handleFirestoreError(new Error('Firestore not initialized'));
  try {
    await db.collection('users').doc(userId).delete();
    return { success: true };
  } catch (error) {
    return handleFirestoreError(error);
  }
}

export async function updateUserPlan(userId: string, newPlan: Plan, planData: Partial<User>) {
  if (!db) return handleFirestoreError(new Error('Firestore not initialized'));
  try {
    const userRef = db.collection('users').doc(userId);
    const userSnap = await userRef.get();
    if (!userSnap.exists) {
        return { success: false, error: 'User not found.' };
    }
    const user = userSnap.data() as User;

    const updateData: any = { ...planData, plan: newPlan };
    
    // For starter plan, remove subscription dates
    if (newPlan === 'starter') {
        updateData.subscriptionId = FieldValue.delete();
        updateData.subscriptionEndsAt = FieldValue.delete();
        updateData.subscriptionStartsAt = FieldValue.delete();
    }
    
    await userRef.update(updateData);

    await sendEmail({
        to: user.email,
        subject: "Your AndonPro Plan Has Been Changed",
        html: `<h1>Subscription Update</h1>
               <p>Hello ${user.firstName},</p>
               <p>This email confirms that your AndonPro plan has been successfully changed to the <strong>${newPlan.charAt(0).toUpperCase() + newPlan.slice(1)}</strong> plan.</p>
               <p>Thank you for using AndonPro!</p>`
    });

    return { success: true };
  } catch (error) {
    return handleFirestoreError(error);
  }
}

export async function sendWelcomeEmail(userId: string) {
    if (!db) return handleFirestoreError(new Error('Firestore not initialized'));
    try {
        const user = await getUserById(userId);
        if (!user) {
            return { success: false, error: "User not found for welcome email."};
        }
        
        const planName = user.plan.charAt(0).toUpperCase() + user.plan.slice(1);
        const loginUrl = process.env.NEXT_PUBLIC_BASE_URL ? `${process.env.NEXT_PUBLIC_BASE_URL}/login` : 'http://localhost:3000/login';

        await sendEmail({
            to: user.email,
            subject: `Welcome to AndonPro, ${user.firstName}!`,
            html: `<h1>Welcome to AndonPro!</h1>
                   <p>Hi ${user.firstName},</p>
                   <p>Your account has been successfully created. You are on the <strong>${planName}</strong> plan.</p>
                   <p>You can now log in to your dashboard and start exploring the features:</p>
                   <a href="${loginUrl}" style="display: inline-block; padding: 10px 20px; font-size: 16px; color: #ffffff; background-color: #2962FF; text-decoration: none; border-radius: 5px;">Log In Now</a>
                   <p>Thank you for joining AndonPro!</p>`
        });
        return { success: true };
    } catch(error) {
        return handleFirestoreError(error);
    }
}


// --- Password Actions ---

export async function requestPasswordReset(email: string) {
  if (!adminAuth) {
    console.error('Password reset request failed: adminAuth not available.');
    // Still return success to prevent email enumeration
    return { success: true, message: 'If this email is registered, you will receive a password reset link.' };
  }
  try {
    const user = await getUserByEmail(email);
    const resetLink = user ? await adminAuth.generatePasswordResetLink(email) : null;

    if (user && resetLink) {
      await sendEmail({
        to: email,
        subject: 'Reset Your AndonPro Password',
        html: `<p>Click the following link to reset your password:</p><a href="${resetLink}">Reset Password</a>`,
      });
    }

    return { success: true, message: 'If this email is registered, you will receive a password reset link.' };
  } catch (error) {
    console.error('Password reset request failed:', error);
    return { success: true, message: 'If this email is registered, you will receive a password reset link.' };
  }
}

export async function sendPasswordChangedEmail(email: string) {
    try {
        await sendEmail({
            to: email,
            subject: 'Your AndonPro Password Has Been Changed',
            html: `<p>This is a confirmation that the password for your AndonPro account has been changed.</p>
                   <p>If you did not make this change, please contact our support team immediately.</p>`
        });
        return { success: true };
    } catch (error) {
        console.error('Password change confirmation email failed:', error);
        // Don't block the user flow for this
        return { success: true }; 
    }
}


export async function changePassword(email: string, currentPassword?: string, newPassword?: string) {
  if (!currentPassword || !newPassword) return { success: false, error: 'Passwords not provided.' };
  console.log(`Password change requested for ${email}. Re-authentication must happen client-side.`);
  return { success: true };
}

// --- Issue Actions ---

export async function reportIssue(issueData: Omit<Issue, 'id' | 'reportedAt' | 'reportedBy' | 'status'>, userEmail: string) {
  if (!db) return handleFirestoreError(new Error('Firestore not initialized'));
  try {
    const reporter = await getUserByEmail(userEmail);
    if (!reporter) return { success: false, error: 'Reporting user not found.' };

    const newIssue: any = {
      ...issueData,
      status: 'reported' as const,
      reportedAt: FieldValue.serverTimestamp(),
      reportedBy: { name: `${reporter.firstName} ${reporter.lastName}`, email: reporter.email },
    };
    
    // If subCategory is an empty string, remove it before saving
    if (newIssue.subCategory === '') {
        delete newIssue.subCategory;
    }

    const docRef = await db.collection('issues').add(newIssue);
    const issueId = docRef.id;

    // Send email notifications
    const usersSnapshot = await db.collection('users').where('orgId', '==', issueData.orgId).get();
    const users = usersSnapshot.docs.map(doc => doc.data() as User);
    const recipients = users.filter(user => (user.role === 'admin' || user.role === 'supervisor') && user.notificationPreferences?.newIssue);

    const dashboardUrl = process.env.NEXT_PUBLIC_BASE_URL ? `${process.env.NEXT_PUBLIC_BASE_URL}/issues` : 'http://localhost:3000/issues';

    for (const user of recipients) {
        await sendEmail({
            to: user.email,
            subject: `New Issue Reported: ${issueData.title}`,
            html: `<h1>New Issue Reported</h1>
                   <p>A new issue has been reported on the production line.</p>
                   <ul>
                     <li><strong>Title:</strong> ${issueData.title}</li>
                     <li><strong>Location:</strong> ${issueData.location}</li>
                     <li><strong>Priority:</strong> ${issueData.priority}</li>
                     <li><strong>Reported By:</strong> ${reporter.firstName} ${reporter.lastName}</li>
                   </ul>
                   <a href="${dashboardUrl}">View Issue Details</a>`
        });
    }

    return { success: true, issueId };
  } catch (error) {
    return handleFirestoreError(error);
  }
}

export async function updateIssue(
  issueId: string,
  data: { resolutionNotes?: string; status: 'in_progress' | 'resolved'; productionStopped: boolean },
  userEmail: string
) {
  if (!db) return handleFirestoreError(new Error('Firestore not initialized'));
  try {
    const resolver = await getUserByEmail(userEmail);
    if (!resolver) return { success: false, error: 'Resolving user not found.' };

    const issueRef = db.collection('issues').doc(issueId);
    const issueSnap = await issueRef.get();
    if (!issueSnap.exists) return { success: false, error: 'Issue not found.'};
    const issue = issueSnap.data() as Issue;

    const updateData: any = {
      resolutionNotes: data.resolutionNotes,
      status: data.status,
      productionStopped: data.productionStopped,
    };

    if (data.status === 'resolved') {
      updateData.resolvedAt = FieldValue.serverTimestamp();
      updateData.resolvedBy = { name: `${resolver.firstName} ${resolver.lastName}`, email: resolver.email };
    }

    await issueRef.update(updateData);

    // If the issue is resolved, notify the original reporter
    if (data.status === 'resolved' && issue.reportedBy.email) {
      const reporter = await getUserByEmail(issue.reportedBy.email);
      if (reporter && reporter.notificationPreferences?.issueResolved) {
         const dashboardUrl = process.env.NEXT_PUBLIC_BASE_URL ? `${process.env.NEXT_PUBLIC_BASE_URL}/issues` : 'http://localhost:3000/issues';
         await sendEmail({
           to: reporter.email,
           subject: `Your Reported Issue Has Been Resolved: ${issue.title}`,
           html: `<h1>Issue Resolved</h1>
                  <p>The issue you reported has been resolved.</p>
                  <ul>
                    <li><strong>Title:</strong> ${issue.title}</li>
                    <li><strong>Location:</strong> ${issue.location}</li>
                    <li><strong>Resolved By:</strong> ${resolver.firstName} ${resolver.lastName}</li>
                    <li><strong>Resolution Notes:</strong> ${data.resolutionNotes || 'N/A'}</li>
                  </ul>
                  <a href="${dashboardUrl}">View Details</a>`
         });
      }
    }


    return { success: true };
  } catch (error) {
    return handleFirestoreError(error);
  }
}

// --- Production Line Actions ---

export async function createProductionLine(name: string, orgId: string) {
  if (!db) return handleFirestoreError(new Error('Firestore not initialized'));
  try {
    const snapshot = await db.collection('productionLines').where('name', '==', name).where('orgId', '==', orgId).get();
    if (!snapshot.empty) return { success: false, error: 'A production line with this name already exists.' };

    const docRef = await db.collection('productionLines').add({ name, workstations: [], orgId });
    return { success: true, id: docRef.id };
  } catch (error) {
    return handleFirestoreError(error);
  }
}

export async function editProductionLine(lineId: string, data: { name: string; workstations: { value: string }[] }) {
  if (!db) return handleFirestoreError(new Error('Firestore not initialized'));
  try {
    const workstationNames = data.workstations.map(ws => ws.value);
    await db.collection('productionLines').doc(lineId).update({ name: data.name, workstations: workstationNames });
    return { success: true };
  } catch (error) {
    return handleFirestoreError(error);
  }
}

export async function deleteProductionLine(lineId: string) {
  if (!db) return handleFirestoreError(new Error('Firestore not initialized'));
  try {
    await db.collection('productionLines').doc(lineId).delete();
    return { success: true };
  } catch (error) {
    return handleFirestoreError(error);
  }
}
