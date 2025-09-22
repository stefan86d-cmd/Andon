
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
    addUser as addUserToData,
    getAllUsers,
    updateIssue as updateIssueInData,
} from "@/lib/data";
import { prioritizeIssue } from '@/ai/flows/prioritize-reported-issues';
import type { Issue, Role, User } from "@/lib/types";

// Mock implementation as Firebase Admin is disabled.

export async function reportIssue(issueData: Omit<Issue, 'id' | 'reportedAt' | 'reportedBy' | 'status' | 'productionStopped'>, reportedByEmail: string) {
    try {
        const reportedByUser = await getUserByEmail(reportedByEmail);
        if (!reportedByUser) {
            return { error: "Could not find current user."};
        }

        await addIssueToData({ ...issueData }, reportedByUser);
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

export async function addUser(data: { uid: string, firstName: string, lastName: string, email: string, role: Role, plan: User['plan'] }, tempPass?: string) {
    try {
        await addUserToData({
            uid: data.uid || `mock-uid-${Date.now()}`,
            ...data
        });

        revalidatePath('/users');
        return { success: true, message: `User ${data.email} processed successfully.` };
    } catch (e: any) {
        console.error("Error in addUser action:", e);
        return { error: e.message || "Failed to create or update user." };
    }
}


export async function deleteUser(email: string) {
    try {
        const user = await getUserByEmail(email);
        if (!user) {
            throw new Error("User not found in mock data.");
        }
        if (['alex.j@andon.io', 'sam.m@andon.io', 'maria.g@andon.io'].includes(email)) {
            throw new Error("Cannot delete default mock users.");
        }

        await deleteUserData(user.id);
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
        const resolvedByUser = await getUserByEmail(resolvedByEmail);
         if (!resolvedByUser) {
            return { error: "Could not find resolving user." };
        }
       
        await updateIssueInData(issueId, { ...data, resolvedBy: resolvedByUser });


        revalidatePath('/issues');
        revalidatePath('/dashboard');
        return { success: true };
    } catch (e: any) {
        console.error(e);
        return { error: e.message || "Failed to update issue." };
    }
}

export async function seedUsers() {
    const usersToSeed = [
        { uid: '0P6TMG7LyyWKatYHFNVXpVoRQSC2', firstName: 'Alex', lastName: 'Johnson', email: 'alex.j@andon.io', role: 'admin' as Role, plan: 'pro' as const },
        { uid: 'mock-sam', firstName: 'Sam', lastName: 'Miller', email: 'sam.m@andon.io', role: 'supervisor' as Role, plan: 'pro' as const },
        { uid: 'mock-maria', firstName: 'Maria', lastName: 'Garcia', email: 'maria.g@andon.io', role: 'operator' as Role, plan: 'pro' as const },
    ];

    let createdCount = 0;
    let existingCount = 0;

    try {
        const existingUsers = await getAllUsers();
        const existingEmails = new Set(existingUsers.map(u => u.email));

        for (const userData of usersToSeed) {
            if (existingEmails.has(userData.email)) {
                existingCount++;
            } else {
                await addUserToData(userData);
                createdCount++;
            }
        }
        revalidatePath('/users');
        return { success: true, message: `Seeding complete. Created: ${createdCount}, Existing: ${existingCount}.` };
    } catch (error: any) {
        console.error('Error seeding users:', error);
        return { error: "Firebase Admin SDK is disabled. Seeding is not possible. Using hardcoded mock users." };
    }
}
