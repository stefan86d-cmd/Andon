
"use server";

import { revalidatePath } from 'next/cache';
import { addIssue as addIssueToData, addProductionLine, updateProductionLine, deleteProductionLine as deleteLine, deleteUser as deleteUserData, updateUser } from "@/lib/data";
import type { Issue, ProductionLine, Role, User } from "@/lib/types";

export async function reportIssue(issueData: Omit<Issue, 'id' | 'reportedAt' | 'reportedBy' | 'status'>, reportedBy: User) {
    try {
        if (!reportedBy) {
            return { error: "Could not find current user."};
        }
        addIssueToData(issueData, reportedBy);
        revalidatePath('/dashboard');
        revalidatePath('/issues');
        return { success: true };
    } catch (e) {
        console.error(e);
        return { error: "Failed to report issue." };
    }
}

export async function createProductionLine(name: string) {
    try {
        addProductionLine({ name });
        revalidatePath('/lines');
        revalidatePath('/dashboard');
        return { success: true };
    } catch (e) {
        console.error(e);
        return { error: "Failed to create production line." };
    }
}

export async function editProductionLine(lineId: string, data: { name: string, workstations: { value: string }[] }) {
    try {
        const workstationNames = data.workstations.map(ws => ws.value);
        updateProductionLine(lineId, { name: data.name, workstations: workstationNames });
        revalidatePath('/lines');
        return { success: true };
    } catch (e) {
        console.error(e);
        return { error: "Failed to update production line." };
    }
}

export async function deleteProductionLine(lineId: string) {
    try {
        deleteLine(lineId);
        revalidatePath('/lines');
        return { success: true };
    } catch (e) {
        console.error(e);
        return { error: "Failed to delete production line." };
    }
}

export async function deleteUser(email: string) {
    try {
        deleteUserData(email);
        revalidatePath('/users');
        return { success: true };
    } catch (e) {
        console.error(e);
        return { error: "Failed to delete user." };
    }
}

export async function editUser(originalEmail: string, data: { firstName: string, lastName: string, email: string, role: Role }) {
    try {
        updateUser(originalEmail, data);
        revalidatePath('/users');
        return { success: true };
    } catch (e) {
        console.error(e);
        return { error: "Failed to update user." };
    }
}
