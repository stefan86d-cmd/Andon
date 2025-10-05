
import { db as clientDB } from "@/firebase";
import type { User, Issue, ProductionLine, IssueDocument } from "@/lib/types";
import { collection, getDocs, doc, getDoc, query, orderBy, where } from "firebase/firestore";


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

// This function is intended for CLIENT-SIDE use.
export async function getClientUserById(uid: string): Promise<User | null> {
    try {
        const userDocRef = doc(clientDB, "users", uid);
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
