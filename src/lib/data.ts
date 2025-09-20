
import { db } from '@/lib/firebase';
import { collection, getDocs, doc, getDoc, addDoc, updateDoc, deleteDoc, query, orderBy, limit, where, Timestamp } from "firebase/firestore";
import type { User, Issue, ProductionLine, Role, IssueCategory } from "@/lib/types";

// Helper to convert Firestore Timestamps to Dates in fetched objects
function convertTimestamps<T>(obj: any): T {
    const newObj: any = { ...obj };
    for (const key in newObj) {
        if (newObj[key] instanceof Timestamp) {
            newObj[key] = newObj[key].toDate();
        }
    }
    return newObj as T;
}


// --- Production Lines ---

export async function getProductionLines(): Promise<ProductionLine[]> {
    const linesCol = collection(db, "productionLines");
    const linesSnapshot = await getDocs(query(linesCol, orderBy("name")));
    const linesList = linesSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as ProductionLine[];
    return linesList;
}

export async function addProductionLine(lineData: { name: string }) {
    const linesCol = collection(db, "productionLines");
    await addDoc(linesCol, {
        name: lineData.name,
        workstations: [],
    });
}

export async function updateProductionLine(lineId: string, updatedData: Partial<Omit<ProductionLine, 'id'>>) {
    const lineDoc = doc(db, "productionLines", lineId);
    await updateDoc(lineDoc, updatedData);
}

export async function deleteProductionLine(lineId: string) {
    const lineDoc = doc(db, "productionLines", lineId);
    await deleteDoc(lineDoc);
}


// --- Users ---

export async function getAllUsers(): Promise<User[]> {
    const usersCol = collection(db, "users");
    const usersSnapshot = await getDocs(query(usersCol, orderBy("name")));
    const usersList = usersSnapshot.docs.map(doc => convertTimestamps<User>(doc.data()));
    return usersList;
}

export async function getUserByEmail(email: string): Promise<User | null> {
    const usersCol = collection(db, "users");
    const q = query(usersCol, where("email", "==", email), limit(1));
    const userSnapshot = await getDocs(q);
    if (userSnapshot.empty) {
        return null;
    }
    return convertTimestamps<User>(userSnapshot.docs[0].data());
}


export async function deleteUser(email: string) {
    // In a real app, you might find the user's doc by their email and delete it.
    // For now, we disallow deleting core users.
    if (['alex.j@andon.io', 'sam.m@andon.io', 'maria.g@andon.io'].includes(email)) {
        throw new Error("Cannot delete default admin, supervisor, or operator roles.");
    }
    
    const usersCol = collection(db, "users");
    const q = query(usersCol, where("email", "==", email), limit(1));
    const userSnapshot = await getDocs(q);

    if (!userSnapshot.empty) {
        const docId = userSnapshot.docs[0].id;
        await deleteDoc(doc(db, "users", docId));
    } else {
        throw new Error("User not found.");
    }
}

export async function updateUser(originalEmail: string, data: { firstName: string, lastName: string, email: string, role: Role }) {
    const usersCol = collection(db, "users");
    const q = query(usersCol, where("email", "==", originalEmail), limit(1));
    const userSnapshot = await getDocs(q);
    
    if (!userSnapshot.empty) {
        const docId = userSnapshot.docs[0].id;
        const userDocRef = doc(db, "users", docId);
        const user = (await getDoc(userDocRef)).data() as User;
        
        const updateData: any = {
            name: `${data.firstName} ${data.lastName}`,
            email: data.email,
        };

        // Don't allow changing role for default admin/operator
        if (user.email !== 'alex.j@andon.io' && user.email !== 'sam.m@andon.io' && user.email !== 'maria.g@andon.io') {
            updateData.role = data.role;
        }

        await updateDoc(userDocRef, updateData);
    } else {
        throw new Error("User not found.");
    }
}


// --- Issues ---

export async function getIssues(): Promise<Issue[]> {
    const issuesCol = collection(db, "issues");
    const issuesSnapshot = await getDocs(query(issuesCol, orderBy("reportedAt", "desc")));
    const issuesList = await Promise.all(issuesSnapshot.docs.map(async (d) => {
        const issueData = d.data();
        
        // Fetch related user data
        const reportedBy = issueData.reportedBy ? await getUserByEmail(issueData.reportedBy.email) : null;
        const resolvedBy = issueData.resolvedBy ? await getUserByEmail(issueData.resolvedBy.email) : null;
        
        return convertTimestamps<Issue>({ 
            id: d.id, 
            ...issueData,
            reportedBy,
            resolvedBy,
        });
    }));
    return issuesList.filter(issue => issue.reportedBy); // Filter out issues where user might have been deleted
}


export async function getIssueById(id: string): Promise<Issue | null> {
    const issueDoc = doc(db, "issues", id);
    const issueSnapshot = await getDoc(issueDoc);

    if (!issueSnapshot.exists()) {
        return null;
    }

    const issueData = issueSnapshot.data();
    const reportedBy = issueData.reportedBy ? await getUserByEmail(issueData.reportedBy.email) : null;
    const resolvedBy = issueData.resolvedBy ? await getUserByEmail(issueData.resolvedBy.email) : null;

    if (!reportedBy) return null; // or handle as needed

    return convertTimestamps<Issue>({
        id: issueSnapshot.id,
        ...issueData,
        reportedBy,
        resolvedBy,
    });
}

export async function addIssue(issueData: Omit<Issue, 'id' | 'reportedAt' | 'reportedBy' | 'status'>, currentUser: User) {
    if (!currentUser) {
        throw new Error("Cannot report issue without a logged in user.");
    }
    const issuesCol = collection(db, "issues");
    
    // We store references to users by their email to avoid complex object storage.
    const reportedByRef = { email: currentUser.email, name: currentUser.name };

    await addDoc(issuesCol, {
        ...issueData,
        reportedAt: new Date(),
        status: 'reported',
        category: issueData.category as IssueCategory,
        reportedBy: reportedByRef,
        // Ensure optional fields are not undefined
        subCategory: issueData.subCategory || "",
        productionStopped: issueData.productionStopped || false,
        itemNumber: issueData.itemNumber || "",
        quantity: issueData.quantity || null,
        resolutionNotes: "",
        resolvedAt: null,
        resolvedBy: null,
    });
}
