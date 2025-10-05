
"use server";

import type { Plan, Role, UserRef, Issue } from "@/lib/types";
import { handleFirestoreError } from "@/lib/firestore-helpers";
import { getUserByEmail } from "@/lib/data";
import { db } from "@/firebase/server";
import {
  collection,
  addDoc,
  serverTimestamp,
  updateDoc,
  doc,
  deleteDoc,
  writeBatch,
} from "firebase/firestore";
import { seedData } from "@/lib/seed";
import { getAdminApp } from "@/firebase/admin";
import { getAuth as getAdminAuth } from "firebase-admin/auth";
import { sendEmail } from "@/lib/email";

export type ActionResult = {
  success: boolean;
  message?: string;
  error?: string;
};

// -----------------------------------------------------------------------------
// Helper Functions
// -----------------------------------------------------------------------------

export async function setCustomUserClaims(
  uid: string,
  claims: { [key: string]: any }
): Promise<ActionResult> {
  console.log(`MOCK (Action): Setting custom claims for UID ${uid}:`, claims);
  return { success: true, message: "Custom claims set successfully." };
}

// -----------------------------------------------------------------------------
// Seeding
// -----------------------------------------------------------------------------

export async function seedDatabase(): Promise<ActionResult> {
  try {
    const batch = writeBatch(db);

    for (const [uid, userData] of Object.entries(seedData.users)) {
      batch.set(doc(db, "users", uid), userData);
    }

    for (const [lineId, lineData] of Object.entries(seedData.productionLines)) {
      batch.set(doc(db, "productionLines", lineId), lineData);
    }

    for (const [issueId, issueData] of Object.entries(seedData.issues)) {
      batch.set(doc(db, "issues", issueId), {
        ...issueData,
        reportedAt: new Date(issueData.reportedDate),
      });
    }

    for (const [orgId, statsData] of Object.entries(seedData.stats)) {
      batch.set(doc(db, "stats", orgId), statsData);
    }

    for (const [keywordId, keywordData] of Object.entries(seedData.facilityKeywords)) {
      batch.set(doc(db, "facilityKeywords", keywordId), keywordData);
    }

    await batch.commit();
    return { success: true, message: "Database seeded successfully." };
  } catch (error) {
    return handleFirestoreError(error);
  }
}

// -----------------------------------------------------------------------------
// Issues
// -----------------------------------------------------------------------------

export async function reportIssue(
  issueData: Omit<Issue, "id" | "reportedAt" | "status" | "reportedBy" | "resolvedBy" | "orgId"> & { orgId: string },
  reportedByEmail: string
): Promise<ActionResult> {
  try {
    const user = await getUserByEmail(reportedByEmail);
    if (!user) return { success: false, error: "Reporting user not found." };

    const reportedByRef: UserRef = {
      email: user.email,
      name: `${user.firstName} ${user.lastName}`,
    };

    await addDoc(collection(db, "issues"), {
      ...issueData,
      reportedAt: serverTimestamp(),
      status: "reported",
      reportedBy: reportedByRef,
      resolvedAt: null,
      resolvedBy: null,
      resolutionNotes: "",
    });

    return { success: true, message: "Issue reported successfully." };
  } catch (error) {
    return handleFirestoreError(error);
  }
}

// -----------------------------------------------------------------------------
// Production Lines
// -----------------------------------------------------------------------------

export async function createProductionLine(
  name: string,
  orgId: string
): Promise<ActionResult> {
  try {
    await addDoc(collection(db, "productionLines"), { name, workstations: [], orgId });
    return { success: true, message: "Production line created successfully." };
  } catch (error) {
    return handleFirestoreError(error);
  }
}

export async function editProductionLine(
  lineId: string,
  data: { name: string; workstations: { value: string }[] }
): Promise<ActionResult> {
  try {
    const workstations = data.workstations.map(ws => ws.value).filter(Boolean);
    await updateDoc(doc(db, "productionLines", lineId), { name: data.name, workstations });
    return { success: true, message: "Production line updated successfully." };
  } catch (error) {
    return handleFirestoreError(error);
  }
}

export async function deleteProductionLine(lineId: string): Promise<ActionResult> {
  try {
    await deleteDoc(doc(db, "productionLines", lineId));
    return { success: true, message: "Production line deleted successfully." };
  } catch (error) {
    return handleFirestoreError(error);
  }
}

// -----------------------------------------------------------------------------
// Users
// -----------------------------------------------------------------------------

function generatePassword() {
  return Math.random().toString(36).slice(-8);
}

export async function addUser(data: {
  firstName: string;
  lastName: string;
  email: string;
  role: Role;
  plan: Plan;
  orgId: string;
}): Promise<ActionResult> {
  try {
    const adminApp = getAdminApp();
    const adminAuth = getAdminAuth(adminApp);
    const adminDb = adminApp.firestore();

    const userRecord = await adminAuth.createUser({
      email: data.email,
      password: generatePassword(),
      displayName: `${data.firstName} ${data.lastName}`,
    });

    await adminDb.collection("users").doc(userRecord.uid).set({
      ...data,
    });

    await adminAuth.setCustomUserClaims(userRecord.uid, {
      role: data.role,
      orgId: data.orgId,
    });

    const link = await adminAuth.generatePasswordResetLink(data.email);

    await sendEmail({
      to: data.email,
      subject: "You're invited to join AndonPro!",
      html: `
        <h1>Welcome to AndonPro!</h1>
        <p>You have been invited to join your team on AndonPro.</p>
        <p><a href="${link}" target="_blank">Set Your Password</a></p>
      `,
    });

    return {
      success: true,
      message: `An invitation email has been sent to ${data.email}.`,
    };
  } catch (error) {
    return handleFirestoreError(error);
  }
}

export async function deleteUser(uid: string): Promise<ActionResult> {
  try {
    await deleteDoc(doc(db, "users", uid));
    return { success: true, message: "User deleted successfully." };
  } catch (error) {
    return handleFirestoreError(error);
  }
}

export async function editUser(
  uid: string,
  data: { firstName: string; lastName: string; email: string; role: Role }
): Promise<ActionResult> {
  try {
    await updateDoc(doc(db, "users", uid), data);
    return { success: true, message: "User updated successfully." };
  } catch (error) {
    return handleFirestoreError(error);
  }
}

export async function updateUserPlan(
  uid: string,
  newPlan: Plan
): Promise<ActionResult> {
  try {
    await updateDoc(doc(db, "users", uid), { plan: newPlan });
    return { success: true, message: `Plan updated to ${newPlan}.` };
  } catch (error) {
    return handleFirestoreError(error);
  }
}

// -----------------------------------------------------------------------------
// Issue Updates
// -----------------------------------------------------------------------------

export async function updateIssue(
  issueId: string,
  data: {
    status: "in_progress" | "resolved";
    resolutionNotes: string;
    productionStopped: boolean;
  },
  resolvedByEmail: string
): Promise<ActionResult> {
  try {
    const user = await getUserByEmail(resolvedByEmail);
    if (!user) return { success: false, error: "Resolving user not found." };

    const resolvedByRef: UserRef = {
      email: user.email,
      name: `${user.firstName} ${user.lastName}`,
    };

    const updateData: any = { ...data };
    if (data.status === "resolved") {
      updateData.resolvedAt = serverTimestamp();
      updateData.resolvedBy = resolvedByRef;
    }

    await updateDoc(doc(db, "issues", issueId), updateData);
    return { success: true, message: "Issue updated successfully." };
  } catch (error) {
    return handleFirestoreError(error);
  }
}

// -----------------------------------------------------------------------------
// Password Functions (Mocks)
// -----------------------------------------------------------------------------

export async function requestPasswordReset(email: string): Promise<ActionResult> {
  console.log(
    `MOCK: Password reset requested for: ${email}. In a real app, this would send an email.`
  );
  return {
    success: true,
    message:
      "If an account with this email exists, a password reset link has been sent.",
  };
}

export async function resetPassword(token: string, newPassword: string): Promise<ActionResult> {
  console.log("MOCK: Password has been reset successfully.");
  return { success: true, message: "Your password has been reset successfully." };
}

export async function changePassword(email: string, current: string, newPass: string): Promise<ActionResult> {
  console.log("MOCK: Password changed successfully for", email);
  return { success: true, message: "Password changed successfully." };
}
