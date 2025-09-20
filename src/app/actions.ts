
"use server";

import { revalidatePath } from 'next/cache';
import { 
    addIssue as addIssueToData, 
    addProductionLine as addProductionLineToData, 
    updateProductionLine as updateProductionLineInData, 
    deleteProductionLine as deleteLine, 
    deleteUser as deleteUserData, 
    updateUser as updateUserInDb,
    getUserByEmail,
    addUser as addUserToData
} from "@/lib/data";
import type { Issue, Role, User } from "@/lib/types";
import { db } from '@/lib/firebase';
import { doc, updateDoc } from 'firebase/firestore';
import * as admin from 'firebase-admin';

if (!admin.apps.length) {
  try {
    admin.initializeApp({
      credential: admin.credential.applicationDefault(),
    });
  } catch (error) {
    console.log('Firebase admin initialization error', error);
  }
}
const adminAuth = admin.auth();

export async function reportIssue(issueData: Omit<Issue, 'id' | 'reportedAt' | 'reportedBy' | 'status'>, reportedByEmail: string) {
    try {
        const reportedByUser = await getUserByEmail(reportedByEmail);
        if (!reportedByUser) {
            return { error: "Could not find current user."};
        }
        await addIssueToData(issueData, reportedByUser);
        revalidatePath('/dashboard');
        revalidatePath('/issues');
        revalidatePath('/line-status');
        return { success: true };
    } catch (e: any) {
        console.error(e);
        return { error: e.message || "Failed to report issue." };
    }
}

export async function createProductionLine(name: string) {
    try {
        await addProductionLineToData({ name });
        revalidatePath('/lines');
        revalidatePath('/dashboard');
        return { success: true };
    } catch (e: any) {
        console.error(e);
        return { error: e.message || "Failed to create production line." };
    }
}

export async function editProductionLine(lineId: string, data: { name: string, workstations: { value: string }[] }) {
    try {
        const workstationNames = data.workstations.map(ws => ws.value);
        await updateProductionLineInData(lineId, { name: data.name, workstations: workstationNames });
        revalidatePath('/lines');
        return { success: true };
    } catch (e: any) {
        console.error(e);
        return { error: e.message || "Failed to update production line." };
    }
}

export async function deleteProductionLine(lineId: string) {
    try {
        await deleteLine(lineId);
        revalidatePath('/lines');
        return { success: true };
    } catch (e: any) {
        console.error(e);
        return { error: e.message || "Failed to delete production line." };
    }
}

export async function addUser(data: { firstName: string, lastName: string, email: string, role: Role }, tempPass: string) {
    try {
        // Create user in Firebase Auth
        const userRecord = await adminAuth.createUser({
            email: data.email,
            emailVerified: true,
            password: tempPass,
            displayName: `${data.firstName} ${data.lastName}`,
        });

        // Add user profile to Firestore
        await addUserToData({
            uid: userRecord.uid,
            ...data
        });

        revalidatePath('/users');
        return { success: true };
    } catch (e: any) {
        console.error(e);
        if (e.code === 'auth/email-already-exists') {
             // If the user already exists in Auth, we might be trying to seed our default users.
            // Let's try to get the user and ensure their data is in Firestore.
            try {
                const userRecord = await adminAuth.getUserByEmail(data.email);
                await addUserToData({ uid: userRecord.uid, ...data });
                revalidatePath('/users');
                return { success: true, message: "User already existed in Auth, ensured Firestore profile exists." };
            } catch (innerError: any) {
                 return { error: innerError.message || "User exists in Auth, but failed to update Firestore." };
            }
        }
        return { error: e.message || "Failed to create user." };
    }
}

export async function deleteUser(email: string) {
    try {
        const user = await getUserByEmail(email);
        if (!user) {
            throw new Error("User not found in Firestore.");
        }
        if (['alex.j@andon.io', 'sam.m@andon.io', 'maria.g@andon.io'].includes(email)) {
            throw new Error("Cannot delete default admin, supervisor, or operator roles.");
        }

        await deleteUserData(user.id);
        await adminAuth.deleteUser(user.id);
        revalidatePath('/users');
        return { success: true };
    } catch (e: any) {
        console.error(e);
        return { error: e.message || "Failed to delete user." };
    }
}

export async function editUser(originalEmail: string, data: { firstName: string, lastName: string, email: string, role: Role }) {
    try {
        const user = await getUserByEmail(originalEmail);
        if (!user) {
           throw new Error("User not found.");
        }
   
        const authUpdatePayload: any = {
            displayName: `${data.firstName} ${data.lastName}`,
        };
        if (originalEmail !== data.email) {
            authUpdatePayload.email = data.email;
        }

        await adminAuth.updateUser(user.id, authUpdatePayload);
        await updateUserInDb(user.id, data);
        revalidatePath('/users');
        return { success: true };
    } catch (e: any) {
        console.error(e);
        return { error: e.message || "Failed to update user." };
    }
}

export async function updateIssue(issueId: string, data: {
    status: 'in_progress' | 'resolved',
    resolutionNotes: string,
    productionStopped: boolean,
}, resolvedByEmail: string) {
    try {
        const issueRef = doc(db, 'issues', issueId);
        const updateData: any = {
            status: data.status,
            resolutionNotes: data.resolutionNotes,
            productionStopped: data.productionStopped,
        };

        if (data.status === 'resolved') {
            const resolvedByUser = await getUserByEmail(resolvedByEmail);
            if (!resolvedByUser) {
                return { error: "Could not find resolving user." };
            }
            updateData.resolvedAt = new Date();
            updateData.resolvedBy = { email: resolvedByUser.email, name: resolvedByUser.name, avatarUrl: resolvedByUser.avatarUrl };
        }

        await updateDoc(issueRef, updateData);

        revalidatePath('/issues');
        revalidatePath('/dashboard');
        return { success: true };
    } catch (e: any) {
        console.error(e);
        return { error: e.message || "Failed to update issue." };
    }
}
