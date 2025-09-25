
"use server";

import { revalidatePath } from 'next/cache';
import { 
    getAllUsers as getAllUsersFromData,
} from "@/lib/data";
import type { Plan, Role, User, UserRef } from "@/lib/types";
import { getFirestore, doc, setDoc, deleteDoc, updateDoc, addDoc, collection, Timestamp, writeBatch, query, where, getDocs } from 'firebase/firestore';
import { initializeFirebase } from '@/firebase/server-init';
import { handleFirestoreError } from '@/lib/firestore-helpers';
import type { Issue } from '@/lib/types';


export async function reportIssue(issueData: Omit<Issue, 'id' | 'reportedAt' | 'reportedBy' | 'status' | 'reportedBy' | 'resolvedBy'>, reportedByEmail: string) {
    try {
        const { firestore } = initializeFirebase();
        const usersCollection = collection(firestore, "users");
        const userQuery = query(usersCollection, where("email", "==", reportedByEmail));
        const userSnapshot = await getDocs(userQuery);

        if (userSnapshot.empty) {
            return { error: "Could not find current user."};
        }
        const userDoc = userSnapshot.docs[0];
        const reportedByUser = { id: userDoc.id, ...userDoc.data() } as User;

        const userRef: UserRef = {
            email: reportedByUser.email,
            name: `${reportedByUser.firstName} ${reportedByUser.lastName}`,
            avatarUrl: reportedByUser.avatarUrl || '',
        };
        
        const newIssueDoc = {
            ...issueData,
            reportedAt: Timestamp.now(),
            status: 'reported',
            reportedBy: userRef,
            productionStopped: false, // Default value
            resolutionNotes: "",
            resolvedAt: null,
            resolvedBy: null,
        }
        
        await addDoc(collection(firestore, "issues"), newIssueDoc);

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
    const { firestore } = initializeFirebase();
    const newLine = { name, workstations: [] };
    const linesCollection = collection(firestore, "productionLines");

    try {
        await addDoc(linesCollection, newLine);
        revalidatePath('/lines');
        revalidatePath('/dashboard');
        return { success: true };
    } catch (e: any) {
        handleFirestoreError(e, {
            operation: 'create',
            path: linesCollection.path,
            requestResourceData: newLine,
        });
        return { error: e.message || "Failed to create production line." };
    }
}

export async function editProductionLine(lineId: string, data: { name: string, workstations: { value: string }[] }) {
    const { firestore } = initializeFirebase();
    const lineRef = doc(firestore, "productionLines", lineId);
    
    try {
        const workstationNames = data.workstations.map(ws => ws.value);
        const updatedData = { name: data.name, workstations: workstationNames };
        await updateDoc(lineRef, updatedData);
        revalidatePath('/lines');
        return { success: true };
    } catch (e: any) {
        handleFirestoreError(e, {
            operation: 'update',
            path: lineRef.path,
            requestResourceData: data,
        });
        return { error: e.message || "Failed to update production line." };
    }
}

export async function deleteProductionLine(lineId: string) {
    const { firestore } = initializeFirebase();
    const lineRef = doc(firestore, "productionLines", lineId);
    try {
        await deleteDoc(lineRef);
        revalidatePath('/lines');
        return { success: true };
    } catch (e: any) {
        handleFirestoreError(e, {
            operation: 'delete',
            path: lineRef.path,
        });
        return { error: e.message || "Failed to delete production line." };
    }
}

export async function addUser(data: { uid: string, firstName: string, lastName: string, email: string, role: Role, plan: User['plan'], address?: string, country?: string, phone?: string }) {
    const { firestore } = initializeFirebase();
    const newUser: Omit<User, 'id'> = {
        firstName: data.firstName,
        lastName: data.lastName,
        email: data.email,
        role: data.role,
        plan: data.plan,
        address: data.address || '',
        country: data.country || '',
        phone: data.phone || '',
        avatarUrl: ''
    };
    const userDocRef = doc(firestore, "users", data.uid);
    
    try {
        await setDoc(userDocRef, newUser);
        revalidatePath('/users');
        return { success: true, message: `User ${data.email} created successfully.` };
    } catch (error) {
        handleFirestoreError(error, {
            operation: 'create',
            path: userDocRef.path,
            requestResourceData: newUser,
        });
        return { success: false, error: 'Failed to save user data.' };
    }
}


export async function deleteUser(uid: string) {
    const { firestore } = initializeFirebase();
    const userDocRef = doc(firestore, "users", uid);
    
    try {
        await deleteDoc(userDocRef);
        revalidatePath('/users');
        return { success: true };
    } catch (error) {
        handleFirestoreError(error, {
            operation: 'delete',
            path: userDocRef.path,
        });
        return { success: false, error: 'Failed to delete user data.' };
    }
}

export async function editUser(uid: string, data: { firstName: string, lastName: string, email: string, role: Role }) {
    const { firestore } = initializeFirebase();
    const userRef = doc(firestore, "users", uid);

    const updatedData = {
        firstName: data.firstName,
        lastName: data.lastName,
        email: data.email,
        role: data.role,
    };

    try {
        await updateDoc(userRef, updatedData);
        revalidatePath('/users');
        return { success: true };
    } catch (error) {
        handleFirestoreError(error, {
            operation: 'update',
            path: userRef.path,
            requestResourceData: updatedData,
        });
        return { success: false, error: 'Failed to update user data.' };
    }
}

export async function updateUserPlan(uid: string, newPlan: Plan) {
    const { firestore } = initializeFirebase();
    const userRef = doc(firestore, "users", uid);

    try {
        await updateDoc(userRef, { plan: newPlan });
        revalidatePath('/settings');
        revalidatePath('/users');
        revalidatePath('/lines');
        return { success: true, message: `Plan updated to ${newPlan}.` };
    } catch (error) {
        handleFirestoreError(error, {
            operation: 'update',
            path: userRef.path,
            requestResourceData: { plan: newPlan },
        });
        return { success: false, error: 'Failed to update plan.' };
    }
}


export async function updateIssue(issueId: string, data: {
    status: 'in_progress' | 'resolved',
    resolutionNotes: string,
    productionStopped: boolean,
}, resolvedByEmail: string) {
    try {
        const { firestore } = initializeFirebase();
        const usersCollection = collection(firestore, "users");
        const userQuery = query(usersCollection, where("email", "==", resolvedByEmail));
        const userSnapshot = await getDocs(userQuery);

        if (userSnapshot.empty) {
            return { error: "Could not find resolving user."};
        }
        const userDoc = userSnapshot.docs[0];
        const resolvedByUser = { id: userDoc.id, ...userDoc.data() } as User;
        
        const userRef: UserRef = {
            email: resolvedByUser.email,
            name: `${resolvedByUser.firstName} ${resolvedByUser.lastName}`,
            avatarUrl: resolvedByUser.avatarUrl || '',
        };
       
        const issueRef = doc(firestore, "issues", issueId);

        const updatedData: any = {
            ...data,
        };

        if (data.status === 'resolved') {
            updatedData.resolvedAt = Timestamp.now();
            updatedData.resolvedBy = userRef;
        }

        await updateDoc(issueRef, updatedData);

        revalidatePath('/issues');
        revalidatePath('/dashboard');
        return { success: true };
    } catch (e: any) {
        handleFirestoreError(e, {
            operation: 'update',
            path: `issues/${issueId}`,
            requestResourceData: data,
        });
        return { error: e.message || "Failed to update issue." };
    }
}

export async function seedUsers() {
    const { firestore } = initializeFirebase();
    const usersToSeed = [
        { id: 'c7TuJzUOWUVt1CALp1jGI1cAmZU2', firstName: 'Alex', lastName: 'Johnson', email: 'alex.j@andon.io', role: 'admin' as Role, plan: 'pro' as const, avatarUrl: '' },
        { id: 'dQhiONEA3fTXfd3p6Sa7Z15tGQD3', firstName: 'Sam', lastName: 'Miller', email: 'sam.m@andon.io', role: 'supervisor' as Role, plan: 'pro' as const, avatarUrl: '' },
        { id: 'BPBNYzsv2LZnAyqNjEonV7a07I33', firstName: 'Maria', lastName: 'Garcia', email: 'maria.g@andon.io', role: 'operator' as Role, plan: 'pro' as const, avatarUrl: '' },
    ];

    let createdCount = 0;
    let existingCount = 0;

    try {
        const batch = writeBatch(firestore);
        const existingUsers = await getAllUsersFromData();
        const existingEmails = new Set(existingUsers.map(u => u.email));

        for (const userData of usersToSeed) {
            if (existingEmails.has(userData.email)) {
                existingCount++;
            } else {
                 const { id, ...rest } = userData;
                 const userDocRef = doc(firestore, "users", id);
                 batch.set(userDocRef, rest);
                 createdCount++;
            }
        }
        
        await batch.commit();
        revalidatePath('/users');
        return { success: true, message: `Seeding complete. Created: ${createdCount}, Existing: ${existingCount}.` };
    } catch (error: any) {
        return { error: "An error occurred during seeding. " + error.message };
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
        const { firestore } = initializeFirebase();
        const usersCollection = collection(firestore, "users");
        const userQuery = query(usersCollection, where("email", "==", email));
        const userSnapshot = await getDocs(userQuery);

        if (userSnapshot.empty) {
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

    