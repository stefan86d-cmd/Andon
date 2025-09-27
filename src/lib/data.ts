
import type { User, Issue, ProductionLine, IssueDocument } from "@/lib/types";
import { db } from "@/firebase";
import { 
    collection, 
    getDocs, 
    query, 
    where, 
    doc, 
    getDoc,
    orderBy,
    limit
} from 'firebase/firestore';
import { handleFirestoreError } from "./firestore-helpers";
import { mockIssues, mockProductionLines, mockUsers } from "./mock-data";

const isDemoMode = process.env.NEXT_PUBLIC_DEMO_MODE === "true";

// --- Firebase API Functions ---

export async function getProductionLines(): Promise<ProductionLine[]> {
    if (isDemoMode) {
        return Promise.resolve(mockProductionLines);
    }
    try {
        const linesCollection = collection(db, "productionLines");
        const lineSnapshot = await getDocs(linesCollection);
        const linesList = lineSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as ProductionLine));
        return linesList;
    } catch (error) {
        handleFirestoreError(error);
        return [];
    }
}

export async function getAllUsers(): Promise<User[]> {
    if (isDemoMode) {
        return Promise.resolve(mockUsers);
    }
    try {
        const usersCollection = collection(db, "users");
        const userSnapshot = await getDocs(usersCollection);
        const userList = userSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as User));
        return userList;
    } catch (error) {
        handleFirestoreError(error);
        return [];
    }
}

export async function getUserByEmail(email: string): Promise<User | null> {
    if (isDemoMode) {
        const user = mockUsers.find(u => u.email === email) || null;
        return Promise.resolve(user);
    }
    try {
        const usersRef = collection(db, "users");
        const q = query(usersRef, where("email", "==", email));
        const querySnapshot = await getDocs(q);
        if (querySnapshot.empty) {
            return null;
        }
        const userDoc = querySnapshot.docs[0];
        return { id: userDoc.id, ...userDoc.data() } as User;
    } catch (error) {
        handleFirestoreError(error);
        return null;
    }
}

export async function getUserById(uid: string): Promise<User | null> {
    if (isDemoMode) {
        const user = mockUsers.find(u => u.id === uid) || null;
        return Promise.resolve(user);
    }
    try {
        const userDocRef = doc(db, "users", uid);
        const userDoc = await getDoc(userDocRef);
        if (userDoc.exists()) {
            return { id: userDoc.id, ...userDoc.data() } as User;
        }
        return null;
    } catch (error) {
        handleFirestoreError(error);
        return null;
    }
}

export async function getIssues(): Promise<Issue[]> {
    if (isDemoMode) {
        return Promise.resolve(mockIssues);
    }
    try {
        const issuesCollection = collection(db, "issues");
        const q = query(issuesCollection, orderBy("reportedAt", "desc"));
        const issueSnapshot = await getDocs(q);
        const issuesList = issueSnapshot.docs.map(doc => {
            const data = doc.data() as IssueDocument;
            return {
                id: doc.id,
                ...data,
                reportedAt: data.reportedAt.toDate(),
                resolvedAt: data.resolvedAt ? data.resolvedAt.toDate() : undefined,
            } as Issue;
        });
        return issuesList;
    } catch (error) {
        handleFirestoreError(error);
        return [];
    }
}

export async function getIssueById(id: string): Promise<Issue | null> {
    if (isDemoMode) {
        const issue = mockIssues.find(i => i.id === id) || null;
        return Promise.resolve(issue);
    }
    try {
        const issueDocRef = doc(db, "issues", id);
        const issueDoc = await getDoc(issueDocRef);
        if (issueDoc.exists()) {
            const data = issueDoc.data() as IssueDocument;
            return {
                id: issueDoc.id,
                ...data,
                reportedAt: data.reportedAt.toDate(),
                resolvedAt: data.resolvedAt ? data.resolvedAt.toDate() : undefined,
            } as Issue;
        }
        return null;
    } catch (error) {
        handleFirestoreError(error);
        return null;
    }
}
