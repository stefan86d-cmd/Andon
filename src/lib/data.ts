
import type { User, Issue, ProductionLine, Role, IssueCategory, Plan, IssueDocument, UserRef } from "@/lib/types";
import { format, subDays, subHours } from "date-fns";
import { getFirestore, getDocs, collection, query, where, doc, getDoc, addDoc, updateDoc, deleteDoc, Timestamp, orderBy, writeBatch } from 'firebase/firestore';
import { initializeFirebase } from "@/firebase/server-init";

// --- Production Lines (Firestore Implementation) ---

export async function getProductionLines(): Promise<ProductionLine[]> {
    const { firestore } = initializeFirebase();
    const linesCollection = collection(firestore, "productionLines");
    const linesSnapshot = await getDocs(linesCollection);
    const linesList = linesSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as ProductionLine));
    return linesList;
}

// addProductionLine, updateProductionLine, deleteProductionLine are handled by server actions

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

// --- Issues (Firestore Implementation) ---

const issueDocToIssue = async (docSnap: any): Promise<Issue> => {
    const docData = docSnap.data() as IssueDocument;
    
    // Convert Firestore Timestamps to JS Date objects
    const reportedAt = (docData.reportedAt as unknown as Timestamp)?.toDate();
    const resolvedAt = docData.resolvedAt ? (docData.resolvedAt as unknown as Timestamp)?.toDate() : undefined;

    // Fetch full user objects from user references
    const reportedByUser = await getUserByEmail(docData.reportedBy.email);
    let resolvedBy = null;
    if (docData.resolvedBy) {
        resolvedBy = await getUserByEmail(docData.resolvedBy.email);
    }
    
    if (!reportedByUser) {
        // This case should be handled gracefully. Maybe return a placeholder user.
        // For now, we'll throw, but in a real app you might not want to.
        throw new Error(`Could not find user with email ${docData.reportedBy.email}`);
    }

    return {
        ...docData,
        id: docSnap.id,
        reportedAt,
        resolvedAt,
        reportedBy: reportedByUser,
        resolvedBy,
    } as Issue;
}


export async function getIssues(): Promise<Issue[]> {
    const { firestore } = initializeFirebase();
    const issuesCollection = collection(firestore, "issues");
    const q = query(issuesCollection, orderBy("reportedAt", "desc"));
    const issuesSnapshot = await getDocs(q);

    const issuesPromises = issuesSnapshot.docs.map(doc => issueDocToIssue(doc));
    const issuesList = await Promise.all(issuesPromises);
    
    return issuesList;
}


export async function getIssueById(id: string): Promise<Issue | null> {
    const { firestore } = initializeFirebase();
    const issueDocRef = doc(firestore, 'issues', id);
    const issueDoc = await getDoc(issueDocRef);
    if (!issueDoc.exists()) {
        return null;
    }
    return await issueDocToIssue(issueDoc);
}

    