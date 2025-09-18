
"use server";

import { revalidatePath } from 'next/cache';
import { prioritizeIssue } from "@/ai/flows/prioritize-reported-issues";
import { addIssue as addIssueToData, addProductionLine, updateProductionLine, deleteProductionLine as deleteLine, deleteUser as deleteUserData, updateUser } from "@/lib/data";
import type { Issue, ProductionLine, Role, User } from "@/lib/types";
import { headers } from 'next/headers';

async function getCurrentUser(): Promise<User | null> {
    const headersList = headers();
    const userCookie = headersList.get('cookie');
    // In a real app, you'd parse the cookie and validate the session
    // For this mock, we'll just return a default user if there's any cookie
    if (userCookie) {
        const allUsers = (await import('@/lib/data')).allUsers;
        // This is a simplified mock. A real app would have a proper session management
        const adminUser = allUsers.find(u => u.email === 'alex.j@andon.io');
        return adminUser || null;
    }
    return null;
}


export async function suggestPriority(description: string) {
  if (!description) {
    return { error: "Please provide a description." };
  }
  try {
    const result = await prioritizeIssue({ description });
    return { priority: result.priorityLevel };
  } catch (e) {
    console.error(e);
    return { error: "Failed to get suggestion from AI." };
  }
}

export async function reportIssue(issueData: Omit<Issue, 'id' | 'reportedAt' | 'reportedBy' | 'status'>) {
    try {
        // This is a mock. In a real app, you would get the user from the session.
        const allUsers = (await import('@/lib/data')).allUsers;
        const currentUser = allUsers.find(u => u.email === 'sam.m@andon.io');
        if (!currentUser) {
            return { error: "Could not find current user."};
        }
        addIssueToData(issueData, currentUser);
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
