
"use server";

import { revalidatePath } from 'next/cache';
import { 
    addIssue as addIssueToData, 
    addProductionLine as addProductionLineToData, 
    updateProductionLine as updateProductionLineInData, 
    deleteProductionLine as deleteLine, 
    getUserByEmail,
    getAllUsers as getAllUsersFromData,
} from "@/lib/data";
import type { Issue, Role, User } from "@/lib/types";
import { getFirestore, doc, setDoc, deleteDoc, updateDoc } from 'firebase/firestore';
import { initializeFirebase } from '@/firebase';
import { handleFirestoreError } from '@/lib/firestore-helpers';

// Mock implementation as Firebase Admin is disabled.

export async function reportIssue(issueData: Omit<Issue, 'id' | 'reportedAt' | 'reportedBy' | 'status' | 'productionStopped' | 'description'>, reportedByEmail: string) {
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

export async function addUser(data: { uid: string, firstName: string, lastName: string, email: string, role: Role, plan: User['plan'] }) {
    const { firestore } = initializeFirebase();
    const newUser: Omit<User, 'id'> = {
        name: `${data.firstName} ${data.lastName}`,
        email: data.email,
        role: data.role,
        plan: data.plan,
        avatarUrl: ''
    };
    const userDocRef = doc(firestore, "users", data.uid);
    
    setDoc(userDocRef, newUser).catch(error => handleFirestoreError(error, {
        operation: 'create',
        path: userDocRef.path,
        requestResourceData: newUser,
    }));
    
    revalidatePath('/users');
    return { success: true, message: `User ${data.email} created successfully.` };
}


export async function deleteUser(uid: string) {
    const { firestore } = initializeFirebase();
    const userDocRef = doc(firestore, "users", uid);
    
    deleteDoc(userDocRef).catch(error => handleFirestoreError(error, {
        operation: 'delete',
        path: userDocRef.path,
    }));
    
    revalidatePath('/users');
    return { success: true };
}

export async function editUser(uid: string, data: { firstName: string, lastName: string, email: string, role: Role }) {
    const { firestore } = initializeFirebase();
    const userRef = doc(firestore, "users", uid);

    const updatedData = {
        name: `${data.firstName} ${data.lastName}`,
        email: data.email,
        role: data.role,
    };

    updateDoc(userRef, updatedData).catch(error => handleFirestoreError(error, {
        operation: 'update',
        path: userRef.path,
        requestResourceData: updatedData,
    }));

    revalidatePath('/users');
    return { success: true };
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
        { id: 'c7TuJzUOWUVt1CALp1jGI1cAmZU2', name: 'Alex Johnson', email: 'alex.j@andon.io', role: 'admin' as Role, plan: 'standard' as const, avatarUrl: '' },
        { id: 'dQhiONEA3fTXfd3p6Sa7Z15tGQD3', name: 'Sam Miller', email: 'sam.m@andon.io', role: 'supervisor' as Role, plan: 'pro' as const, avatarUrl: '' },
        { id: 'BPBNYzsv2LZnAyqNjEonV7a07I33', name: 'Maria Garcia', email: 'maria.g@andon.io', role: 'operator' as Role, plan: 'pro' as const, avatarUrl: '' },
    ];

    let createdCount = 0;
    let existingCount = 0;

    try {
        const existingUsers = await getAllUsersFromData();
        const existingEmails = new Set(existingUsers.map(u => u.email));

        for (const userData of usersToSeed) {
            if (existingEmails.has(userData.email)) {
                existingCount++;
            } else {
                 const { id, ...rest } = userData;
                 // Note: this now calls the non-blocking addUser.
                 await addUser({ ...rest, uid: id });
                 createdCount++;
            }
        }
        revalidatePath('/users');
        return { success: true, message: `Seeding complete. Created: ${createdCount}, Existing: ${existingCount}.` };
    } catch (error: any) {
        // This catch block might not be effective for permission errors now,
        // as they are handled in the .catch() of the firestore operations.
        return { error: "Firebase Admin SDK is disabled or another error occurred during seeding. " + error.message };
    }
}


export async function changePassword(userEmail: string, currentPassword: string, newPassword: string) {
    // This is a mock function. In a real app, this would be handled securely.
    // For this demo, we're not actually changing the password in Firebase Auth from the server.
    // The user should do this via client-side SDK flows.
    // We will simulate a check here.
    if (currentPassword !== 'password') {
        return { success: false, error: 'Incorrect current password.' };
    }
    console.log(`Password for ${userEmail} would be changed here (mock).`);
    return { success: true };
}

export async function requestPasswordReset(email: string) {
    try {
        // In a real app, you'd check if the user exists and send an email.
        // For this mock, we'll check if the user exists in our mock data.
        const user = await getUserByEmail(email);
        if (!user) {
            // It's good practice not to reveal if an email exists in the system.
            console.log(`Password reset requested for non-existent email: ${email} (mock).`);
            return { success: true, message: 'If an account with this email exists, a password reset link has been sent.' };
        }

        console.log(`Password reset requested for: ${email} (mock). In a real app, an email would be sent.`);
        return { success: true, message: 'If an account with this email exists, a password reset link has been sent.' };
    } catch (e: any) {
        console.error('Error requesting password reset:', e);
        // Don't reveal specific errors to the user.
        return { success: true, message: 'If an account with this email exists, a password reset link has been sent.' };
    }
}

export async function resetPassword(token: string, newPassword: string) {
    // In a real app, you would validate the token before resetting the password.
    // For this mock, we'll assume the token is always valid.
    try {
        console.log(`Password has been reset successfully (mock).`);
        return { success: true, message: 'Your password has been reset successfully.' };
    } catch (e: any) {
        console.error('Error resetting password:', e);
        return { success: false, error: 'Failed to reset password.' };
    }
}
