
import type { User, Issue, ProductionLine, Role, IssueCategory, Plan, IssueDocument, UserRef } from "@/lib/types";
import { format, subDays, subHours } from "date-fns";
import { getFirestore, getDocs, collection, query, where, doc, getDoc, addDoc, updateDoc, deleteDoc, Timestamp, orderBy, writeBatch, collectionGroup } from 'firebase/firestore';
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
    
    // For reportedBy, we can construct a partial user object.
    // In a real app, you might want to fetch the full user profile if needed,
    // but this avoids extra reads for display purposes.
    const reportedBy: User = {
        id: '', // Not available in the ref, but might not be needed for display
        email: docData.reportedBy.email,
        firstName: docData.reportedBy.name.split(' ')[0],
        lastName: docData.reportedBy.name.split(' ').slice(1).join(' '),
        avatarUrl: docData.reportedBy.avatarUrl,
        role: 'operator', // Default/unknown role
        plan: 'starter',   // Default/unknown plan
        address: '',
        country: '',
    };
    
    let resolvedBy: User | null = null;
    if (docData.resolvedBy) {
         resolvedBy = {
            id: '',
            email: docData.resolvedBy.email,
            firstName: docData.resolvedBy.name.split(' ')[0],
            lastName: docData.resolvedBy.name.split(' ').slice(1).join(' '),
            avatarUrl: docData.resolvedBy.avatarUrl,
            role: 'supervisor',
            plan: 'starter',
            address: '',
            country: '',
        };
    }

    return {
        ...docData,
        id: docSnap.id,
        reportedAt,
        resolvedAt,
        reportedBy: reportedBy,
        resolvedBy: resolvedBy,
    } as Issue;
}


export async function getIssues(): Promise<Issue[]> {
    const { firestore } = initializeFirebase();
    const issuesCollection = collection(firestore, "issues");
    const q = query(issuesCollection, orderBy("reportedAt", "desc"));
    const issuesSnapshot = await getDocs(q);

    const issuesList = await Promise.all(issuesSnapshot.docs.map(doc => issueDocToIssue(doc)));
    
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
