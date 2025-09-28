
import type { User, Issue, ProductionLine, IssueDocument } from "@/lib/types";
import { handleFirestoreError } from "./firestore-helpers";

// --- Firebase has been removed. These functions now return empty data. ---

export async function getProductionLines(): Promise<ProductionLine[]> {
    console.log("MOCK: Returning empty production lines.");
    return [];
}

export async function getAllUsers(): Promise<User[]> {
    console.log("MOCK: Returning empty users.");
    return [];
}

export async function getUserByEmail(email: string): Promise<User | null> {
    console.log("MOCK: Returning null user.");
    return null;
}

export async function getUserById(uid: string): Promise<User | null> {
    console.log("MOCK: Returning null user.");
    return null;
}

export async function getIssues(): Promise<Issue[]> {
    console.log("MOCK: Returning empty issues.");
    return [];
}

export async function getIssueById(id: string): Promise<Issue | null> {
    console.log("MOCK: Returning null issue.");
    return null;
}
