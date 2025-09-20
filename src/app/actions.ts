
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
import { adminAuth } from '@/lib/firebase-admin';

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
            return { error: 'A user with this email address already exists.' };
        }
        return { error: e.message || "Failed to create user." };
    }
}

export async function deleteUser(email: string) {
    try {
        await deleteUserData(email);
        revalidatePath('/users');
        return { success: true };
    } catch (e: any) {
        console.error(e);
        return { error: e.message || "Failed to delete user." };
    }
}

export async function editUser(originalEmail: string, data: { firstName: string, lastName: string, email: string, role: Role }) {
    try {
        await updateUserInDb(originalEmail, data);
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
