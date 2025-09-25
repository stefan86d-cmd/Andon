
import type { User, Issue, ProductionLine, Role, IssueCategory, Plan } from "@/lib/types";
import { format, subDays, subHours } from "date-fns";
import { getFirestore, getDocs, collection, query, where, doc, getDoc } from 'firebase/firestore';
import { initializeFirebase } from "@/firebase";

// --- MOCK DATA ---
// This section contains mock data used for development and will be phased out.

let mockProductionLines: ProductionLine[] = [
    { id: 'line-1', name: 'Assembly Line 1', workstations: ['Station A', 'Station B', 'QA'] },
    { id: 'line-2', name: 'Packaging Line Alpha', workstations: ['Wrapper', 'Boxer', 'Palletizer'] },
];

let mockUsers: User[] = []; // Users will now be fetched from Firestore

let mockIssues: Issue[] = []; // This will be replaced by Firestore data soon.


// --- Production Lines ---

export async function getProductionLines(): Promise<ProductionLine[]> {
    // This still uses mock data. Will be migrated later.
    return Promise.resolve(mockProductionLines);
}

export async function addProductionLine(lineData: { name: string }) {
    const newLine: ProductionLine = {
        id: `line-${Date.now()}`,
        name: lineData.name,
        workstations: [],
    };
    mockProductionLines.push(newLine);
    return Promise.resolve();
}

export async function updateProductionLine(lineId: string, updatedData: Partial<Omit<ProductionLine, 'id'>>) {
    mockProductionLines = mockProductionLines.map(line => 
        line.id === lineId ? { ...line, ...updatedData } as ProductionLine : line
    );
    return Promise.resolve();
}

export async function deleteProductionLine(lineId: string) {
    mockProductionLines = mockProductionLines.filter(line => line.id !== lineId);
    return Promise.resolve();
}


// --- Users (Firestore Implementation) ---

export async function getAllUsers(): Promise<User[]> {
    const { firestore } = initializeFirebase();
    const usersCollection = collection(firestore, "users");
    const usersSnapshot = await getDocs(usersCollection);
    const usersList = usersSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as User));
    return usersList;
}

export async function getUserByEmail(email: string): Promise<User | null> {
    const { firestore } = initializeFirebase();
    const usersCollection = collection(firestore, "users");
    const q = query(usersCollection, where("email", "==", email));
    const querySnapshot = await getDocs(q);
    if (querySnapshot.empty) {
        return null;
    }
    const userDoc = querySnapshot.docs[0];
    return { id: userDoc.id, ...userDoc.data() } as User;
}

export async function getUserById(uid: string): Promise<User | null> {
    const { firestore } = initializeFirebase();
    const userDocRef = doc(firestore, 'users', uid);
    const userDoc = await getDoc(userDocRef);
    if (!userDoc.exists()) {
        return null;
    }
    return { id: userDoc.id, ...userDoc.data() } as User;
}

// These functions below are now delegating to server actions, but the core logic
// of adding/updating/deleting is now in actions.ts. These mock functions can be removed later.
export async function addUserToData(data: Omit<User, 'id'> & { uid: string }) {
     // This function's logic is now in actions.ts to use server-side capabilities
    return Promise.resolve();
}

export async function deleteUserData(userId: string) {
     // This function's logic is now in actions.ts
    return Promise.resolve();
}

export async function updateUserInDb(userId: string, data: any) {
    // This function's logic is now in actions.ts
    return Promise.resolve();
}


// --- Issues (Still Mocked) ---

export async function getIssues(): Promise<Issue[]> {
    // Sort by date descending, like the original query
    const sortedIssues = [...mockIssues].sort((a, b) => b.reportedAt.getTime() - a.reportedAt.getTime());
    return Promise.resolve(sortedIssues);
}


export async function getIssueById(id: string): Promise<Issue | null> {
    const issue = mockIssues.find(i => i.id === id);
    return Promise.resolve(issue || null);
}

export async function addIssueToData(issueData: Omit<Issue, 'id' | 'reportedAt' | 'reportedBy' | 'status' | 'productionStopped'>, currentUser: User) {
    if (!currentUser) {
        throw new Error("Cannot report issue without a logged in user.");
    }
    
    const newIssue: Issue = {
        id: `issue-${Date.now()}`,
        ...issueData,
        reportedAt: new Date(),
        status: 'reported',
        category: issueData.category as IssueCategory,
        reportedBy: currentUser,
        subCategory: issueData.subCategory || "",
        productionStopped: false,
        itemNumber: issueData.itemNumber || "",
        quantity: issueData.quantity || undefined,
        resolutionNotes: "",
        resolvedAt: undefined,
        resolvedBy: undefined,
    };

    mockIssues.push(newIssue);
    return Promise.resolve();
}

export async function updateIssueInData(issueId: string, data: Partial<Omit<Issue, 'id'>>) {
    mockIssues = mockIssues.map(issue => 
        issue.id === issueId ? { ...issue, ...data } as Issue : issue
    );
    return Promise.resolve();
}

    