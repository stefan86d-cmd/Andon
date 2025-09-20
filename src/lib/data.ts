
import { db } from '@/lib/firebase';
import { collection, getDocs, doc, getDoc, addDoc, updateDoc, deleteDoc, query, orderBy, limit, where, Timestamp, setDoc } from "firebase/firestore";
import type { User, Issue, ProductionLine, Role, IssueCategory } from "@/lib/types";
import { adminAuth } from './firebase-admin';

// Helper to convert Firestore Timestamps to Dates in fetched objects
function convertTimestamps<T>(obj: any): T {
    const newObj: any = { ...obj };
    for (const key in newObj) {
        if (newObj[key] instanceof Timestamp) {
            newObj[key] = newObj[key].toDate();
        } else if (typeof newObj[key] === 'object' && newObj[key] !== null) {
            // Recursively convert timestamps in nested objects
            newObj[key] = convertTimestamps(newObj[key]);
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
    const usersList = usersSnapshot.docs.map(doc => convertTimestamps<User>({ id: doc.id, ...doc.data() } as any));
    return usersList;
}

export async function getUserByEmail(email: string): Promise<User | null> {
    const usersCol = collection(db, "users");
    const q = query(usersCol, where("email", "==", email), limit(1));
    const userSnapshot = await getDocs(q);
    if (userSnapshot.empty) {
        return null;
    }
    const userDoc = userSnapshot.docs[0];
    const userData = userDoc.data();
    return convertTimestamps<User>({ id: userDoc.id, ...userData } as any);
}

export async function addUser(data: { uid: string, firstName: string, lastName: string, email: string, role: Role }) {
    const userDoc = doc(db, "users", data.uid);
    await setDoc(userDoc, {
        name: `${data.firstName} ${data.lastName}`,
        email: data.email,
        role: data.role,
        avatarUrl: `https://picsum.photos/seed/${data.uid}/100/100`, // Placeholder avatar
    });
}


export async function deleteUser(email: string) {
    if (['alex.j@andon.io', 'sam.m@andon.io', 'maria.g@andon.io'].includes(email)) {
        throw new Error("Cannot delete default admin, supervisor, or operator roles.");
    }
    
    const user = await getUserByEmail(email);
    if (!user) {
        throw new Error("User not found in Firestore.");
    }

    // Delete from Firestore
    await deleteDoc(doc(db, "users", user.id));

    // Delete from Firebase Auth
    await adminAuth.deleteUser(user.id);
}

export async function updateUser(originalEmail: string, data: { firstName: string, lastName: string, email: string, role: Role }) {
    const user = await getUserByEmail(originalEmail);
     if (!user) {
        throw new Error("User not found.");
    }

    const userDocRef = doc(db, "users", user.id);
    const authUpdatePayload: any = {
        displayName: `${data.firstName} ${data.lastName}`,
    };
    
    const firestoreUpdatePayload: any = {
        name: `${data.firstName} ${data.lastName}`,
        role: data.role,
    };

    if (originalEmail !== data.email) {
        authUpdatePayload.email = data.email;
        firestoreUpdatePayload.email = data.email;
    }

    // Update Auth
    await adminAuth.updateUser(user.id, authUpdatePayload);
    
    // Update Firestore
    await updateDoc(userDocRef, firestoreUpdatePayload);
}


// --- Issues ---

export async function getIssues(): Promise<Issue[]> {
    const issuesCol = collection(db, "issues");
    const issuesSnapshot = await getDocs(query(issuesCol, orderBy("reportedAt", "desc")));
    const issuesList = await Promise.all(issuesSnapshot.docs.map(async (d) => {
        const issueData = d.data();
        
        const reportedByRef = issueData.reportedBy;
        const resolvedByRef = issueData.resolvedBy;

        const reportedBy = reportedByRef ? await getUserByEmail(reportedByRef.email) : null;
        const resolvedBy = resolvedByRef ? await getUserByEmail(resolvedByRef.email) : null;
        
        if (!reportedBy) {
            return null;
        }

        return convertTimestamps<Issue>({ 
            id: d.id, 
            ...issueData,
            reportedBy,
            resolvedBy,
        });
    }));

    return issuesList.filter((issue): issue is Issue => issue !== null);
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

    if (!reportedBy) return null;

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
    
    const reportedByRef = { email: currentUser.email, name: currentUser.name, avatarUrl: currentUser.avatarUrl };

    await addDoc(issuesCol, {
        ...issueData,
        reportedAt: new Date(),
        status: 'reported',
        category: issueData.category as IssueCategory,
        reportedBy: reportedByRef,
        subCategory: issueData.subCategory || "",
        productionStopped: issueData.productionStopped || false,
        itemNumber: issueData.itemNumber || "",
        quantity: issueData.quantity || null,
        resolutionNotes: "",
        resolvedAt: null,
        resolvedBy: null,
    });
}
