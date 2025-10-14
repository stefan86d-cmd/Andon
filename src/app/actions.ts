
'use server';

import {
  FieldValue,
  getFirestore,
  Timestamp,
} from 'firebase-admin/firestore';
import { db } from '@/firebase/server';
import { adminAuth } from '@/firebase/admin';
import type { Issue, Plan, ProductionLine, Role, User } from '@/lib/types';
import { handleFirestoreError } from '@/lib/firestore-helpers';
import { sendEmail } from '@/lib/email';
import { getAuth } from 'firebase/auth';

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
  if (!db) return handleFirestoreError(new Error('Firestore not initialized'));
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

    const newUser: Omit<User, 'id'> = {
      firstName,
      lastName,
      email,
      role,
      plan,
      address: '',
      country: '',
      orgId,
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
  if (!db) return handleFirestoreError(new Error('Firestore not initialized'));
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
    
    await userRef.update(planData);

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

        await sendEmail({
            to: user.email,
            subject: `Welcome to AndonPro, ${user.firstName}!`,
            html: `<h1>Welcome to AndonPro!</h1>
                   <p>Hello ${user.firstName},</p>
                   <p>Your account has been successfully created and you are now on the <strong>${planName}</strong> plan.</p>
                   <p>You can now log in and start exploring the features.</p>
                   <a href="${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/login">Log In Now</a>
                   <p>Thank you for joining AndonPro!</p>`
        });
        return { success: true };
    } catch(error) {
        return handleFirestoreError(error);
    }
}


// --- Password Actions ---

export async function requestPasswordReset(email: string) {
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

    const newIssue = {
      ...issueData,
      status: 'reported' as const,
      reportedAt: FieldValue.serverTimestamp(),
      reportedBy: { name: `${reporter.firstName} ${reporter.lastName}`, email: reporter.email },
    };

    const docRef = await db.collection('issues').add(newIssue);
    return { success: true, issueId: docRef.id };
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

    const updateData: any = {
      resolutionNotes: data.resolutionNotes,
      status: data.status,
      productionStopped: data.productionStopped,
    };

    if (data.status === 'resolved') {
      updateData.resolvedAt = FieldValue.serverTimestamp();
      updateData.resolvedBy = { name: `${resolver.firstName} ${resolver.lastName}`, email: resolver.email };
    }

    await db.collection('issues').doc(issueId).update(updateData);
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
