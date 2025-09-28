
"use server";

import type { Plan, Role, User, UserRef } from "@/lib/types";
import { handleFirestoreError } from '@/lib/firestore-helpers';
import type { Issue } from '@/lib/types';
import { getUserByEmail, getUserById } from '@/lib/data';

// --- All actions are now mock/no-op as Firebase has been removed. ---

export async function setCustomUserClaims(uid: string, claims: { [key:string]: any }) {
    console.log(`MOCK (Action): Setting custom claims for UID ${uid}:`, claims);
    return { success: true };
}

export async function seedDatabase() {
    return { success: false, error: 'Database seeding is disabled.' };
}

export async function reportIssue(issueData: Omit<Issue, 'id' | 'reportedAt' | 'status' | 'reportedBy' | 'resolvedBy' >, reportedByEmail: string) {
    console.log("MOCK: reportIssue called", issueData);
    return { success: true };
}

export async function createProductionLine(name: string, orgId: string) {
    console.log("MOCK: createProductionLine called", name);
    return { success: true };
}

export async function editProductionLine(lineId: string, data: { name: string, workstations: { value: string }[] }) {
    console.log("MOCK: editProductionLine called", lineId, data);
    return { success: true };
}

export async function deleteProductionLine(lineId: string) {
    console.log("MOCK: deleteProductionLine called", lineId);
    return { success: true };
}

export async function addUser(data: { uid: string, firstName: string, lastName: string, email: string, role: Role, plan: User['plan'], orgId: string, address?: string, country?: string, phone?: string }) {
    console.log("MOCK: addUser called", data);
    return { success: true, message: `User ${data.email} created successfully (mock).` };
}

export async function deleteUser(uid: string) {
    console.log("MOCK: deleteUser called", uid);
    return { success: true };
}

export async function editUser(uid: string, data: { firstName: string, lastName: string, email: string, role: Role }) {
    console.log("MOCK: editUser called", uid, data);
    return { success: true };
}

export async function updateUserPlan(uid: string, newPlan: Plan) {
    console.log("MOCK: updateUserPlan called", uid, newPlan);
    return { success: true, message: `Plan updated to ${newPlan} (mock).` };
}

export async function updateIssue(issueId: string, data: {
    status: 'in_progress' | 'resolved',
    resolutionNotes: string,
    productionStopped: boolean,
}, resolvedByEmail: string) {
    console.log("MOCK: updateIssue called", issueId, data);
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

export async function changePassword(email: string, current: string, newPass: string) {
    console.log("MOCK: Password changed successfully for", email);
    return { success: true };
}
