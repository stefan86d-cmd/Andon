"use server";

import { revalidatePath } from 'next/cache';
import type { Plan, Role, User, UserRef } from "@/lib/types";
import { handleFirestoreError } from '@/lib/firestore-helpers';
import type { Issue } from '@/lib/types';
import { getUserByEmail } from '@/lib/data';


export async function setCustomUserClaims(uid: string, claims: { [key: string]: any }) {
    // This is a mock function. In a real app with a backend, this would interact with Firebase Admin SDK.
    console.log(`MOCK: Setting custom claims for UID ${uid}:`, claims);
    return { success: true };
}

export async function reportIssue(issueData: Omit<Issue, 'id' | 'reportedAt' | 'reportedBy' | 'status' | 'reportedBy' | 'resolvedBy'>, reportedByEmail: string) {
    console.log("MOCK: reportIssue called with:", issueData);
    revalidatePath('/dashboard');
    revalidatePath('/issues');
    revalidatePath('/line-status');
    return { success: true };
}

export async function createProductionLine(name: string) {
    console.log("MOCK: createProductionLine called with:", name);
    revalidatePath('/lines');
    revalidatePath('/dashboard');
    return { success: true };
}

export async function editProductionLine(lineId: string, data: { name: string, workstations: { value: string }[] }) {
    console.log("MOCK: editProductionLine called for", lineId, "with:", data);
    revalidatePath('/lines');
    return { success: true };
}

export async function deleteProductionLine(lineId: string) {
    console.log("MOCK: deleteProductionLine called for:", lineId);
    revalidatePath('/lines');
    return { success: true };
}

export async function addUser(data: { uid: string, firstName: string, lastName: string, email: string, role: Role, plan: User['plan'], address?: string, country?: string, phone?: string }) {
    console.log("MOCK: addUser called with:", data);
    await setCustomUserClaims(data.uid, { role: data.role });
    revalidatePath('/users');
    return { success: true, message: `User ${data.email} created successfully.` };
}


export async function deleteUser(uid: string) {
    console.log("MOCK: deleteUser called for:", uid);
    revalidatePath('/users');
    return { success: true };
}

export async function editUser(uid: string, data: { firstName: string, lastName: string, email: string, role: Role }) {
    console.log("MOCK: editUser called for", uid, "with:", data);
    await setCustomUserClaims(uid, { role: data.role });
    revalidatePath('/users');
    return { success: true };
}

export async function updateUserPlan(uid: string, newPlan: Plan) {
    console.log(`MOCK: updateUserPlan called for ${uid} to plan ${newPlan}`);
    revalidatePath('/settings');
    revalidatePath('/users');
    revalidatePath('/lines');
    return { success: true, message: `Plan updated to ${newPlan}.` };
}


export async function updateIssue(issueId: string, data: {
    status: 'in_progress' | 'resolved',
    resolutionNotes: string,
    productionStopped: boolean,
}, resolvedByEmail: string) {
    console.log("MOCK: updateIssue called for", issueId, "with:", data);
    revalidatePath('/issues');
    revalidatePath('/dashboard');
    return { success: true };
}

export async function changePassword(userEmail: string, currentPassword: string, newPassword: string) {
    // This is a mock function. In a real app, this would be handled securely.
    if (currentPassword !== 'password') {
        return { success: false, error: 'Incorrect current password.' };
    }
    console.log(`MOCK: Password for ${userEmail} would be changed here.`);
    return { success: true };
}

export async function requestPasswordReset(email: string) {
    console.log(`MOCK: Password reset requested for: ${email}.`);
    return { success: true, message: 'If an account with this email exists, a password reset link has been sent.' };
}

export async function resetPassword(token: string, newPassword: string) {
    console.log(`MOCK: Password has been reset successfully.`);
    return { success: true, message: 'Your password has been reset successfully.' };
}