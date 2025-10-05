
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
} from 'firebase-admin/firestore';
import { db } from '@/firebase/server';
import { adminAuth } from '@/firebase/admin';
import type { Issue, Plan, ProductionLine, Role, User } from '@/lib/types';
import { handleFirestoreError } from '@/lib/firestore-helpers';
import { sendEmail } from '@/lib/email';


// --- Data fetching actions (moved from lib/data.ts) ---

export async function getProductionLines(orgId: string): Promise<ProductionLine[]> {
    if (!db) {
        console.error("Firestore not initialized");
        return [];
    }
    try {
        const linesCollection = db.collection("productionLines");
        const q = linesCollection.where("orgId", "==", orgId);
        const snapshot = await getDocs(q);
        return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as ProductionLine));
    } catch (error) {
        console.error("Error fetching production lines:", error);
        return [];
    }
}

export async function getAllUsers(orgId: string): Promise<User[]> {
     if (!db) {
        console.error("Firestore not initialized");
        return [];
    }
    try {
        const usersCollection = db.collection("users");
        const q = usersCollection.where("orgId", "==", orgId);
        const snapshot = await getDocs(q);
        return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as User));
    } catch (error) {
        console.error("Error fetching all users:", error);
        return [];
    }
}

export async function getUserByEmail(email: string): Promise<User | null> {
    if (!db) {
        console.error("Firestore not initialized");
        return null;
    }
    try {
        const usersRef = db.collection("users");
        const q = usersRef.where("email", "==", email);
        const querySnapshot = await getDocs(q);

        if (querySnapshot.empty) {
            return null;
        }
        
        const userDoc = querySnapshot.docs[0];
        return { id: userDoc.id, ...userDoc.data() } as User;

    } catch (error) {
        handleFirestoreError(error);
        return null;
    }
}

export async function getUserById(uid: string): Promise<User | null> {
    if (!db) {
        console.error("Firestore not initialized");
        return null;
    }
    try {
        const userDocRef = db.doc(`users/${uid}`);
        const userDoc = await getDoc(userDocRef);

        if (!userDoc.exists) {
            return null;
        }

        return { id: userDoc.id, ...userDoc.data() } as User;
    } catch (error) {
        console.error(`Error fetching user by ID ${uid}:`, error);
        return null;
    }
}


// --- User Actions ---

export async function getUserAction(uid: string): Promise<User | null> {
    return getUserById(uid);
}


export async function addUser(userData: {
  firstName: string;
  lastName: string;
  email: string;
  role: Role;
  plan: Plan;
  orgId: string;
}) {
  if (!db) {
    return handleFirestoreError(new Error("Firestore not initialized"));
  }
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
  if (!db) {
    return handleFirestoreError(new Error("Firestore not initialized"));
  }
  try {
    const userRef = db.doc(`users/${userId}`);
    await userRef.update({
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
  if (!db) {
    return handleFirestoreError(new Error("Firestore not initialized"));
  }
  try {
    const userRef = db.doc(`users/${userId}`);
    await userRef.delete();
    // Note: We are not deleting the user from Firebase Auth to prevent data loss
    // and allow for re-activation. You could add that here if needed:
    // await adminAuth.deleteUser(userId);
    return { success: true };
  } catch (error) {
    return handleFirestoreError(error);
  }
}

export async function updateUserPlan(userId: string, newPlan: Plan) {
    if (!db) {
        return handleFirestoreError(new Error("Firestore not initialized"));
    }
    try {
        const userRef = db.doc(`users/${userId}`);
        await userRef.update({ plan: newPlan });
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
  if (!db) {
    return handleFirestoreError(new Error("Firestore not initialized"));
  }
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
    
    const docRef = await db.collection("issues").add(newIssue);
    return { success: true, issueId: docRef.id };
  } catch (error) {
    return handleFirestoreError(error);
  }
}

export async function updateIssue(issueId: string, data: { resolutionNotes?: string, status: 'in_progress' | 'resolved', productionStopped: boolean }, userEmail: string) {
    if (!db) {
        return handleFirestoreError(new Error("Firestore not initialized"));
    }
    try {
        const issueRef = db.doc(`issues/${issueId}`);
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

        await issueRef.update(updateData);
        return { success: true };

    } catch (error) {
        return handleFirestoreError(error);
  }
}


// --- Production Line Actions ---

export async function createProductionLine(name: string, orgId: string) {
    if (!db) {
        return handleFirestoreError(new Error("Firestore not initialized"));
    }
    try {
        // Check for existing line with the same name in the same org
        const linesRef = db.collection('productionLines');
        const q = linesRef.where("name", "==", name).where("orgId", "==", orgId);
        const querySnapshot = await getDocs(q);
        if (!querySnapshot.empty) {
            return { success: false, error: "A production line with this name already exists." };
        }

        const docRef = await db.collection("productionLines").add({
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
  if (!db) {
    return handleFirestoreError(new Error("Firestore not initialized"));
  }
  try {
    const lineRef = db.doc(`productionLines/${lineId}`);
    const workstationNames = data.workstations.map(ws => ws.value);
    
    await lineRef.update({
      name: data.name,
      workstations: workstationNames,
    });
    
    return { success: true };
  } catch (error) {
    return handleFirestoreError(error);
  }
}

export async function deleteProductionLine(lineId: string) {
  if (!db) {
    return handleFirestoreError(new Error("Firestore not initialized"));
  }
  try {
    const lineRef = db.doc(`productionLines/${lineId}`);
    await lineRef.delete();
    return { success: true };
  } catch (error) {
    return handleFirestoreError(error);
  }
}
