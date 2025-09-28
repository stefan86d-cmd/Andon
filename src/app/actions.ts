
"use server";

import { revalidatePath } from 'next/cache';
import type { Plan, Role, User, UserRef } from "@/lib/types";
import { handleFirestoreError } from '@/lib/firestore-helpers';
import type { Issue } from '@/lib/types';
import { getUserByEmail, getUserById } from '@/lib/data';
import { db, auth } from '@/firebase';
import { collection, addDoc, serverTimestamp, updateDoc, doc, deleteDoc, getDoc, setDoc, writeBatch } from 'firebase/firestore';
import seedData from '../docs/seed.json';


export async function setCustomUserClaims(uid: string, claims: { [key:string]: any }) {
    // In a real app, this would be handled by a Firebase Function
    // as the Admin SDK is required to set custom claims.
    console.log(`MOCK (Action): Setting custom claims for UID ${uid}:`, claims);
    return { success: true };
}

export async function seedDatabase() {
    try {
        const batch = writeBatch(db);

        // Seed users
        for (const [id, data] of Object.entries(seedData.users)) {
            const ref = doc(db, "users", id);
            batch.set(ref, data);
        }

        // Seed stats
        for (const [id, data] of Object.entries(seedData.stats)) {
            const ref = doc(db, "stats", id);
            batch.set(ref, data);
        }

        // Seed productionLines
        for (const [id, data] of Object.entries(seedData.productionLines)) {
            const ref = doc(db, "productionLines", id);
            batch.set(ref, data);
        }
        
        // Seed facilityKeywords
        for (const [id, data] of Object.entries(seedData.facilityKeywords)) {
            const ref = doc(db, "facilityKeywords", id);
            batch.set(ref, data);
        }

        // Seed issues
        for (const [id, data] of Object.entries(seedData.issues)) {
            const ref = doc(db, "issues", id);
            const issueData = {
                ...data,
                reportedAt: new Date(data.reportedDate), // Convert string to Date
                reportedBy: {
                    email: "alice@factory.com",
                    name: "Alice Smith"
                }
            };
            delete (issueData as any).reportedDate;
            batch.set(ref, issueData);
        }
        
        await batch.commit();

        revalidatePath('/'); // Revalidate all paths
        return { success: true, message: 'Database seeded successfully!' };
    } catch (error) {
        return handleFirestoreError(error);
    }
}


export async function reportIssue(issueData: Omit<Issue, 'id' | 'reportedAt' | 'status' | 'reportedBy' | 'resolvedBy' >, reportedByEmail: string) {
    try {
        const user = await getUserByEmail(reportedByEmail);
        if (!user) {
            return { success: false, error: 'Reporting user not found.' };
        }

        const userRef: UserRef = { email: user.email, name: `${user.firstName} ${user.lastName}` };
        
        await addDoc(collection(db, "issues"), {
            ...issueData,
            reportedAt: serverTimestamp(),
            status: "reported",
            reportedBy: userRef,
            resolvedBy: null,
            resolvedAt: null,
            resolutionNotes: "",
        });
        
        revalidatePath('/dashboard');
        revalidatePath('/issues');
        revalidatePath('/line-status');
        return { success: true };
    } catch (error) {
        return handleFirestoreError(error);
    }
}

export async function createProductionLine(name: string, orgId: string) {
    try {
        await addDoc(collection(db, "productionLines"), {
            name: name,
            workstations: [],
            orgId: orgId,
        });
        revalidatePath('/lines');
        revalidatePath('/dashboard');
        return { success: true };
    } catch (error) {
        return handleFirestoreError(error);
    }
}

export async function editProductionLine(lineId: string, data: { name: string, workstations: { value: string }[] }) {
    try {
        const lineRef = doc(db, "productionLines", lineId);
        await updateDoc(lineRef, {
            name: data.name,
            workstations: data.workstations.map(ws => ws.value),
        });
        revalidatePath('/lines');
        return { success: true };
    } catch (error) {
        return handleFirestoreError(error);
    }
}

export async function deleteProductionLine(lineId: string) {
   try {
        await deleteDoc(doc(db, "productionLines", lineId));
        revalidatePath('/lines');
        return { success: true };
    } catch (error) {
        return handleFirestoreError(error);
    }
}

export async function addUser(data: { uid: string, firstName: string, lastName: string, email: string, role: Role, plan: User['plan'], orgId: string, address?: string, country?: string, phone?: string }) {
    try {
        await setDoc(doc(db, "users", data.uid), {
            firstName: data.firstName,
            lastName: data.lastName,
            email: data.email,
            role: data.role,
            plan: data.plan,
            orgId: data.orgId,
        });

        await setCustomUserClaims(data.uid, { role: data.role, plan: data.plan });
        revalidatePath('/users');
        return { success: true, message: `User ${data.email} created successfully.` };
    } catch (error) {
        return handleFirestoreError(error);
    }
}


export async function deleteUser(uid: string) {
    // This is a placeholder for deleting a user.
    // In a real app, you would use the Firebase Admin SDK to delete the user from Auth
    // and then delete their document from Firestore. This should be a secure backend operation.
    try {
        await deleteDoc(doc(db, "users", uid));
        revalidatePath('/users');
        return { success: true };
    } catch (error) {
        return handleFirestoreError(error);
    }
}

export async function editUser(uid: string, data: { firstName: string, lastName: string, email: string, role: Role }) {
    try {
        const userRef = doc(db, "users", uid);
        await updateDoc(userRef, data);
        await setCustomUserClaims(uid, { role: data.role });
        revalidatePath('/users');
        return { success: true };
    } catch (error) {
        return handleFirestoreError(error);
    }
}

export async function updateUserPlan(uid: string, newPlan: Plan) {
    try {
        const userRef = doc(db, "users", uid);
        await updateDoc(userRef, { plan: newPlan });
        await setCustomUserClaims(uid, { plan: newPlan });
        revalidatePath('/settings');
        revalidatePath('/users');
        revalidatePath('/lines');
        return { success: true, message: `Plan updated to ${newPlan}.` };
    } catch (error) {
        return handleFirestoreError(error);
    }
}

export async function updateIssue(issueId: string, data: {
    status: 'in_progress' | 'resolved',
    resolutionNotes: string,
    productionStopped: boolean,
}, resolvedByEmail: string) {
    try {
        const issueRef = doc(db, "issues", issueId);

        const user = await getUserByEmail(resolvedByEmail);
         if (!user) {
            return { success: false, error: 'Resolving user not found.' };
        }
        const userRef: UserRef = { email: user.email, name: `${user.firstName} ${user.lastName}` };

        const updateData: any = {
            ...data,
            resolvedBy: data.status === 'resolved' ? userRef : null,
            resolvedAt: data.status === 'resolved' ? serverTimestamp() : null,
        };

        await updateDoc(issueRef, updateData);
        
        revalidatePath('/issues');
        revalidatePath('/dashboard');
        return { success: true };
    } catch (error) {
        return handleFirestoreError(error);
    }
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
