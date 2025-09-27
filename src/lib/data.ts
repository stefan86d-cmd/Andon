
import type { User, Issue, ProductionLine } from "@/lib/types";

// --- Mock Data Removed ---
// All mock data arrays have been cleared to prepare for a live database connection.

const mockUsers: User[] = [];
const mockProductionLines: ProductionLine[] = [];
const mockIssues: Issue[] = [];
const mockAdminUser: User | null = null; // No default admin

// --- Mock API Functions Updated ---
// These functions now return empty arrays or null, simulating an empty database.

export async function getProductionLines(): Promise<ProductionLine[]> {
    console.log("MOCK: Fetching production lines (returning empty).");
    return Promise.resolve([]);
}

export async function getAllUsers(): Promise<User[]> {
    console.log("MOCK: Fetching all users (returning empty).");
    return Promise.resolve([]);
}

export async function getUserByEmail(email: string): Promise<User | null> {
    console.log(`MOCK: Getting user by email: ${email} (returning null).`);
    // In a real implementation, this would query the database.
    return Promise.resolve(null);
}

export async function getUserById(uid: string): Promise<User | null> {
    console.log(`MOCK: Getting user by ID: ${uid} (returning null).`);
    // In a real implementation, this would query the database.
    return Promise.resolve(null);
}

export async function getIssues(): Promise<Issue[]> {
    console.log("MOCK: Fetching all issues (returning empty).");
    return Promise.resolve([]);
}

export async function getIssueById(id: string): Promise<Issue | null> {
    console.log(`MOCK: Getting issue by ID: ${id} (returning null).`);
    return Promise.resolve(null);
}
