'use server';

import {
  collection,
  doc,
  getDoc,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  serverTimestamp,
  query,
  where,
  Timestamp,
} from 'firebase/firestore';
import { db } from '@/firebase/server';
import { adminAuth } from '@/firebase/admin';
import type { Issue, Plan, ProductionLine, Role, User } from '@/lib/types';
import { getUserByEmail, getUserById } from '@/lib/data';
import { handleFirestoreError } from '@/lib/firestore-helpers';
import { sendEmail } from '@/lib/email';

// --- User Actions ---

export async function addUser(userData: {
  firstName: string;
  lastName: string;
  email: string;
  role: Role;
  plan: Plan;
  orgId: string;
}) {
  try {
    const { email, firstName, lastName, role, plan, orgId } = userData;

    // Check if user already exists in Firestore
    const existingUser = await getUserByEmail(email);
    if (existingUser) {
      return {
        success: false,
        error: 'A user with this email already exists.',
      };
    }
    
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
    
    // Send invitation email
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
  try {
    const userRef = doc(db, 'users', userId);
    await updateDoc(userRef, {
      ...userData,
    });

    // Also update Firebase Auth if email changed
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
  try {
    const userRef = doc(db, 'users', userId);
    await deleteDoc(userRef);
    // Note: We are not deleting the user from Firebase Auth to prevent data loss
    // and allow for re-activation. You could add that here if needed:
    // await adminAuth.deleteUser(userId);
    return { success: true };
  } catch (error) {
    return handleFirestoreError(error);
  }
}

export async function updateUserPlan(userId: string, newPlan: Plan) {
    try {
        const userRef = doc(db, "users", userId);
        await updateDoc(userRef, { plan: newPlan });
        return { success: true };
    } catch (error) {
        return handleFirestoreError(error);
    }
}


// --- Password Actions ---

export async function requestPasswordReset(email: string) {
  try {
    const user = await getUserByEmail(email);
    if (!user) {
      // Don't reveal if user exists.
      return { success: true, message: 'If this email is registered, you will receive a password reset link.' };
    }
    
    const resetLink = await adminAuth.generatePasswordResetLink(email);

    await sendEmail({
        to: email,
        subject: 'Reset Your AndonPro Password',
        html: `<p>Click the following link to reset your password:</p><a href="${resetLink}">Reset Password</a>`
    });

    return { success: true, message: 'If this email is registered, you will receive a password reset link.' };
  } catch (error) {
    // Log the actual error on the server but return a generic message
    console.error("Password reset request failed:", error);
    return { success: true, message: 'If this email is registered, you will receive a password reset link.' };
  }
}


export async function changePassword(email: string, currentPassword?: string, newPassword?: string) {
    try {
        // This is a placeholder. You'd need a more secure way to handle this,
        // as re-authenticating on the server is complex.
        // The recommended Firebase approach is to re-authenticate on the client.
        // For this action, we'll simulate success for demonstration.
        if (!currentPassword || !newPassword) {
            return { success: false, error: "Passwords not provided." };
        }
        
        console.log(`Password change requested for ${email}. In a real app, this would require re-authentication.`);
        
        return { success: true };
    } catch (error) {
        return handleFirestoreError(error);
    }
}


// --- Issue Actions ---

export async function reportIssue(issueData: Omit<Issue, 'id' | 'reportedAt' | 'reportedBy' | 'status'>, userEmail: string) {
  try {
    const reporter = await getUserByEmail(userEmail);
    if (!reporter) {
      return { success: false, error: "Reporting user not found." };
    }

    const newIssue = {
      ...issueData,
      status: "reported" as const,
      reportedAt: serverTimestamp(),
      reportedBy: {
        name: `${reporter.firstName} ${reporter.lastName}`,
        email: reporter.email,
      }
    };
    
    const docRef = await addDoc(collection(db, "issues"), newIssue);
    return { success: true, issueId: docRef.id };
  } catch (error) {
    return handleFirestoreError(error);
  }
}

export async function updateIssue(issueId: string, data: { resolutionNotes?: string, status: 'in_progress' | 'resolved', productionStopped: boolean }, userEmail: string) {
    try {
        const issueRef = doc(db, 'issues', issueId);
        const resolver = await getUserByEmail(userEmail);

        if (!resolver) {
            return { success: false, error: "Resolving user not found." };
        }

        const updateData: any = {
            resolutionNotes: data.resolutionNotes,
            status: data.status,
            productionStopped: data.productionStopped,
        };

        if (data.status === 'resolved') {
            updateData.resolvedAt = serverTimestamp();
            updateData.resolvedBy = {
                name: `${resolver.firstName} ${resolver.lastName}`,
                email: resolver.email,
            };
        }

        await updateDoc(issueRef, updateData);
        return { success: true };

    } catch (error) {
        return handleFirestoreError(error);
    }
}


// --- Production Line Actions ---

export async function createProductionLine(name: string, orgId: string) {
    try {
        // Check for existing line with the same name in the same org
        const linesRef = collection(db, 'productionLines');
        const q = query(linesRef, where("name", "==", name), where("orgId", "==", orgId));
        const querySnapshot = await getDocs(q);
        if (!querySnapshot.empty) {
            return { success: false, error: "A production line with this name already exists." };
        }

        const docRef = await addDoc(collection(db, "productionLines"), {
            name: name,
            workstations: [],
            orgId: orgId,
        });
        return { success: true, id: docRef.id };
    } catch (error) {
        return handleFirestoreError(error);
    }
}

export async function editProductionLine(lineId: string, data: { name: string; workstations: { value: string }[] }) {
  try {
    const lineRef = doc(db, 'productionLines', lineId);
    const workstationNames = data.workstations.map(ws => ws.value);
    
    await updateDoc(lineRef, {
      name: data.name,
      workstations: workstationNames,
    });
    
    return { success: true };
  } catch (error) {
    return handleFirestoreError(error);
  }
}

export async function deleteProductionLine(lineId: string) {
  try {
    const lineRef = doc(db, 'productionLines', lineId);
    await deleteDoc(lineRef);
    return { success: true };
  } catch (error) {
    return handleFirestoreError(error);
  }
}
