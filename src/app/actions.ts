
"use server";

import type { Plan, Role, User, UserRef, IssueCategory } from "@/lib/types";
import { handleFirestoreError } from '@/lib/firestore-helpers';
import type { Issue } from '@/lib/types';
import { getUserByEmail, getUserById } from '@/lib/data';
import { db, auth } from '@/firebase';
import { collection, addDoc, serverTimestamp, updateDoc, doc, deleteDoc, getDoc, setDoc, writeBatch } from 'firebase/firestore';
import { createUserWithEmailAndPassword } from "firebase/auth";
import { seedData } from "@/lib/seed";
import { getAdminApp } from "@/firebase/admin";
import { getAuth as getAdminAuth } from "firebase-admin/auth";
import { sendEmail } from "@/lib/email";

export async function setCustomUserClaims(uid: string, claims: { [key:string]: any }) {
    // This function requires the Firebase Admin SDK and should be in a Cloud Function.
    // This client-side mock will just log the action.
    console.log(`MOCK (Action): Setting custom claims for UID ${uid}:`, claims);
    return { success: true };
}

export async function seedDatabase() {
    try {
        const batch = writeBatch(db);

        // Seed Users
        for (const [uid, userData] of Object.entries(seedData.users)) {
            const userRef = doc(db, "users", uid);
            batch.set(userRef, userData);
        }

        // Seed Production Lines
        for (const [lineId, lineData] of Object.entries(seedData.productionLines)) {
            const lineRef = doc(db, "productionLines", lineId);
            batch.set(lineRef, lineData);
        }

        // Seed Issues
        for (const [issueId, issueData] of Object.entries(seedData.issues)) {
            const issueRef = doc(db, "issues", issueId);
            const reportedAtDate = new Date(issueData.reportedDate);
            batch.set(issueRef, { ...issueData, reportedAt: reportedAtDate });
        }

        // Seed Stats
        for (const [orgId, statsData] of Object.entries(seedData.stats)) {
            const statsRef = doc(db, "stats", orgId);
            batch.set(statsRef, statsData);
        }
        
        // Seed Facility Keywords
        for (const [keywordId, keywordData] of Object.entries(seedData.facilityKeywords)) {
            const keywordRef = doc(db, "facilityKeywords", keywordId);
            batch.set(keywordRef, keywordData);
        }

        await batch.commit();
        return { success: true, message: "Database seeded successfully!" };
    } catch (error) {
        return handleFirestoreError(error);
    }
}

export async function reportIssue(issueData: Omit<Issue, 'id' | 'reportedAt' | 'status' | 'reportedBy' | 'resolvedBy' | 'orgId'> & { orgId: string }, reportedByEmail: string): Promise<{ success: true } | { success: false, error: string }> {
    try {
        const user = await getUserByEmail(reportedByEmail);
        if (!user) {
            return { success: false, error: "Reporting user not found." };
        }

        const reportedByRef: UserRef = {
            email: user.email,
            name: `${user.firstName} ${user.lastName}`,
        };

        const issuesCollection = collection(db, "issues");
        await addDoc(issuesCollection, {
            ...issueData,
            reportedAt: serverTimestamp(),
            status: 'reported',
            reportedBy: reportedByRef,
            resolvedAt: null,
            resolvedBy: null,
            resolutionNotes: "",
        });
        return { success: true };
    } catch (error) {
        return handleFirestoreError(error);
    }
}

export async function createProductionLine(name: string, orgId: string) {
    try {
        const linesCollection = collection(db, "productionLines");
        await addDoc(linesCollection, { name, workstations: [], orgId });
        return { success: true };
    } catch (error) {
        return handleFirestoreError(error);
    }
}

export async function editProductionLine(lineId: string, data: { name: string, workstations: { value: string }[] }) {
     try {
        const lineDoc = doc(db, "productionLines", lineId);
        const workstations = data.workstations.map(ws => ws.value).filter(Boolean);
        await updateDoc(lineDoc, { name: data.name, workstations });
        return { success: true };
    } catch (error) {
        return handleFirestoreError(error);
    }
}

export async function deleteProductionLine(lineId: string) {
    try {
        const lineDoc = doc(db, "productionLines", lineId);
        await deleteDoc(lineDoc);
        return { success: true };
    } catch (error) {
        return handleFirestoreError(error);
    }
}

function generatePassword() {
  return Math.random().toString(36).slice(-8);
}

export async function addUser(data: { firstName: string; lastName: string; email: string; role: Role; plan: Plan; orgId: string; }) {
    try {
        const adminApp = getAdminApp();
        const adminAuth = getAdminAuth(adminApp);
        const adminDb = adminApp.firestore();

        // 1. Create the user in Firebase Auth
        const userRecord = await adminAuth.createUser({
            email: data.email,
            password: generatePassword(),
            displayName: `${data.firstName} ${data.lastName}`,
        });

        // 2. Create the user document in Firestore
        await adminDb.collection("users").doc(userRecord.uid).set({
            firstName: data.firstName,
            lastName: data.lastName,
            email: data.email,
            role: data.role,
            plan: data.plan,
            orgId: data.orgId,
        });

        // 3. Set custom claims for role-based access control
        await adminAuth.setCustomUserClaims(userRecord.uid, { role: data.role, orgId: data.orgId });

        // 4. Send an invitation email via SendGrid
        const link = await adminAuth.generatePasswordResetLink(data.email);
        
        await sendEmail({
            to: data.email,
            subject: "You're invited to join AndonPro!",
            html: `
                <h1>Welcome to AndonPro!</h1>
                <p>You have been invited to join your team on AndonPro.</p>
                <p>Click the link below to set your password and get started:</p>
                <a href="${link}" target="_blank">Set Your Password</a>
                <p>This link will expire in 24 hours.</p>
            `,
        });

        return { success: true, message: `An invitation email has been sent to ${data.email}.` };
    } catch (error) {
        return handleFirestoreError(error);
    }
}

export async function deleteUser(uid: string) {
    // This action only deletes the Firestore user document.
    // Deleting the Firebase Auth user should be done in a secure Cloud Function.
    try {
        const userDoc = doc(db, "users", uid);
        await deleteDoc(userDoc);
        return { success: true };
    } catch (error) {
        return handleFirestoreError(error);
    }
}

export async function editUser(uid: string, data: { firstName: string, lastName: string, email: string, role: Role }) {
     try {
        const userDoc = doc(db, "users", uid);
        await updateDoc(userDoc, data);
        // In a real app, you would also trigger a Cloud Function to update the auth email if it changed,
        // and to update custom claims if the role changed.
        return { success: true };
    } catch (error) {
        return handleFirestoreError(error);
    }
}

export async function updateUserPlan(uid: string, newPlan: Plan): Promise<{success: true, message: string} | {success: false, error: string}> {
     try {
        const userDoc = doc(db, "users", uid);
        await updateDoc(userDoc, { plan: newPlan });
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
        const user = await getUserByEmail(resolvedByEmail);
        if (!user) {
            return { success: false, error: "Resolving user not found." };
        }
        
        const resolvedByRef: UserRef = {
            email: user.email,
            name: `${user.firstName} ${user.lastName}`,
        };

        const issueDoc = doc(db, "issues", issueId);
        const updateData: any = { 
            ...data,
        };

        if (data.status === 'resolved') {
            updateData.resolvedAt = serverTimestamp();
            updateData.resolvedBy = resolvedByRef;
        }

        await updateDoc(issueDoc, updateData);
        return { success: true };
    } catch (error) {
        return handleFirestoreError(error);
    }
}

export async function requestPasswordReset(email: string) {
    // This is a mock function because password reset emails can only be sent from the client-side SDK
    // or the Admin SDK in a secure environment.
    console.log(`MOCK: Password reset requested for: ${email}. In a real app, this would use sendPasswordResetEmail from the client.`);
    return { success: true, message: 'If an account with this email exists, a password reset link has been sent.' };
}

export async function resetPassword(token: string, newPassword: string) {
     // This is a mock function because password resets require client-side SDK.
    console.log(`MOCK: Password has been reset successfully.`);
    return { success: true, message: 'Your password has been reset successfully.' };
}

export async function changePassword(email: string, current: string, newPass: string) {
    // This is a mock function. Real implementation would require re-authenticating the user.
    console.log("MOCK: Password changed successfully for", email);
    return { success: true };
}
