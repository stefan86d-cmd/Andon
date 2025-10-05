
import { db as serverDB } from "@/firebase/server";
import { db as clientDB } from "@/firebase";
import type { User, Issue, ProductionLine, IssueDocument } from "@/lib/types";
import { collection, getDocs, doc, getDoc, query, orderBy, where } from "firebase/firestore";
import { handleFirestoreError } from "./firestore-helpers";


// This function is intended for CLIENT-SIDE use.
export async function getClientIssues(orgId: string): Promise<Issue[]> {
    try {
        const issuesCollection = collection(clientDB, "issues");
        const q = query(issuesCollection, where("orgId", "==", orgId), orderBy("reportedAt", "desc"));
        const snapshot = await getDocs(q);
        
        const issues = await Promise.all(snapshot.docs.map(transformIssueDocument));
        return issues;

    } catch (error) {
        console.error("Error fetching issues:", error);
        return [];
    }
}

// This function is intended for CLIENT-SIDE use.
export async function getClientProductionLines(orgId: string): Promise<ProductionLine[]> {
    try {
        const linesCollection = collection(clientDB, "productionLines");
        const q = query(linesCollection, where("orgId", "==", orgId));
        const snapshot = await getDocs(q);
        return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as ProductionLine));
    } catch (error) {
        console.error("Error fetching production lines:", error);
        return [];
    }
}


export async function getProductionLines(orgId: string): Promise<ProductionLine[]> {
    try {
        const linesCollection = collection(serverDB, "productionLines");
        const q = query(linesCollection, where("orgId", "==", orgId));
        const snapshot = await getDocs(q);
        return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as ProductionLine));
    } catch (error) {
        console.error("Error fetching production lines:", error);
        return [];
    }
}

export async function getAllUsers(orgId: string): Promise<User[]> {
    try {
        const usersCollection = collection(serverDB, "users");
        const q = query(usersCollection, where("orgId", "==", orgId));
        const snapshot = await getDocs(q);
        return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as User));
    } catch (error) {
        console.error("Error fetching all users:", error);
        return [];
    }
}

export async function getUserByEmail(email: string): Promise<User | null> {
    try {
        const usersRef = collection(serverDB, "users");
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
    try {
        const userDocRef = doc(serverDB, "users", uid);
        const userDoc = await getDoc(userDocRef);

        if (!userDoc.exists()) {
            return null;
        }

        return { id: userDoc.id, ...userDoc.data() } as User;
    } catch (error) {
        console.error(`Error fetching user by ID ${uid}:`, error);
        return null;
    }
}


const transformIssueDocument = async (doc: any): Promise<Issue> => {
    const data = doc.data() as IssueDocument;

    const reportedByName = data.reportedBy?.name || "Unknown User";
    const resolvedByName = data.resolvedBy?.name || "N/A";

    return {
        id: doc.id,
        ...data,
        reportedAt: data.reportedAt.toDate(),
        resolvedAt: data.resolvedAt ? data.resolvedAt.toDate() : undefined,
        reportedBy: { name: reportedByName, email: data.reportedBy.email },
        resolvedBy: data.resolvedBy ? { name: resolvedByName, email: data.resolvedBy.email } : undefined,
    };
};


export async function getIssues(orgId: string): Promise<Issue[]> {
    try {
        const issuesCollection = collection(serverDB, "issues");
        const q = query(issuesCollection, where("orgId", "==", orgId), orderBy("reportedAt", "desc"));
        const snapshot = await getDocs(q);
        
        const issues = await Promise.all(snapshot.docs.map(transformIssueDocument));
        return issues;

    } catch (error) {
        console.error("Error fetching issues:", error);
        return [];
    }
}


export async function getIssueById(id: string): Promise<Issue | null> {
    try {
        const issueDocRef = doc(serverDB, "issues", id);
        const issueDoc = await getDoc(issueDocRef);
        if (!issueDoc.exists()) {
            return null;
        }
        return await transformIssueDocument(issueDoc);
    } catch (error) {
        console.error(`Error fetching issue by ID ${id}:`, error);
        return null;
    }
}
