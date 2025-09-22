

import type { User, Issue, ProductionLine, Role, IssueCategory, Plan } from "@/lib/types";
import { format, subDays, subHours } from "date-fns";

// --- MOCK DATA ---
// This is a mock database for development when Firebase is disabled.

let mockUsers: User[] = [
    { id: '0P6TMG7LyyWKatYHFNVXpVoRQSC2', name: 'Alex Johnson', email: 'alex.j@andon.io', avatarUrl: 'https://picsum.photos/seed/0P6TMG7LyyWKatYHFNVXpVoRQSC2/100/100', role: 'admin', plan: 'pro' },
    { id: 'mock-sam', name: 'Sam Miller', email: 'sam.m@andon.io', avatarUrl: 'https://picsum.photos/seed/mock-sam/100/100', role: 'supervisor', plan: 'pro' },
    { id: 'mock-maria', name: 'Maria Garcia', email: 'maria.g@andon.io', avatarUrl: 'https://picsum.photos/seed/mock-maria/100/100', role: 'operator', plan: 'pro' },
];

let mockProductionLines: ProductionLine[] = [
    { id: 'line-1', name: 'Assembly Line 1', workstations: ['Station A', 'Station B', 'QA'] },
    { id: 'line-2', name: 'Packaging Line Alpha', workstations: ['Wrapper', 'Boxer', 'Palletizer'] },
];

let mockIssues: Issue[] = [
    {
        id: 'issue-1',
        title: 'Conveyor belt stalled',
        location: 'Assembly Line 1 - Station B',
        productionLineId: 'line-1',
        priority: 'critical',
        status: 'reported',
        reportedAt: new Date(Date.now() - 1000 * 60 * 5), // 5 minutes ago
        reportedBy: mockUsers[2], // Maria Garcia
        category: 'tool',
        subCategory: 'power-issue',
        productionStopped: true,
    },
    {
        id: 'issue-2',
        title: 'Missing component #A-452',
        location: 'Assembly Line 1 - Station A',
        productionLineId: 'line-1',
        priority: 'high',
        status: 'in_progress',
        reportedAt: new Date(Date.now() - 1000 * 60 * 30), // 30 minutes ago
        reportedBy: mockUsers[2],
        category: 'logistics',
        subCategory: 'material-shortage',
        itemNumber: 'A-452',
        quantity: 50,
    },
    {
        id: 'issue-3',
        title: 'Network connection lost to QA server',
        location: 'Assembly Line 1 - QA',
        productionLineId: 'line-1',
        priority: 'medium',
        status: 'reported',
        reportedAt: new Date(Date.now() - 1000 * 60 * 60 * 2), // 2 hours ago
        reportedBy: mockUsers[2],
        category: 'it',
        subCategory: 'network',
    },
     {
        id: 'issue-4',
        title: 'Incorrect box size for order #8851',
        location: 'Packaging Line Alpha - Boxer',
        productionLineId: 'line-2',
        priority: 'low',
        status: 'resolved',
        reportedAt: new Date(Date.now() - 1000 * 60 * 60 * 25), // 25 hours ago
        reportedBy: mockUsers[2],
        category: 'logistics',
        subCategory: 'incorrect-material',
        resolvedAt: new Date(Date.now() - 1000 * 60 * 60 * 24), // resolved 1 hour later
        resolvedBy: mockUsers[1], // Sam Miller
        resolutionNotes: 'Retrieved correct boxes from warehouse C.'
    },
    {
        id: 'issue-5',
        title: 'Final product has visible scratches',
        location: 'Assembly Line 1 - QA',
        productionLineId: 'line-1',
        priority: 'high',
        status: 'in_progress',
        reportedAt: subDays(new Date(), 1),
        reportedBy: mockUsers[2],
        category: 'quality',
        subCategory: 'defect-found',
        productionStopped: true,
    },
    {
        id: 'issue-6',
        title: 'Printer is out of ink',
        location: 'Packaging Line Alpha - Palletizer',
        productionLineId: 'line-2',
        priority: 'low',
        status: 'resolved',
        reportedAt: subDays(new Date(), 2),
        reportedBy: mockUsers[2],
        resolvedAt: subDays(new Date(), 2),
        resolvedBy: mockUsers[1],
        category: 'it',
        subCategory: 'hardware',
        resolutionNotes: 'Replaced ink cartridge.',
    },
    {
        id: 'issue-7',
        title: 'Forklift battery is dead',
        location: 'Packaging Line Alpha - Wrapper',
        productionLineId: 'line-2',
        priority: 'high',
        status: 'resolved',
        reportedAt: subDays(new Date(), 3),
        reportedBy: mockUsers[2],
        resolvedAt: subHours(subDays(new Date(), 3), -4), // 4 hours later
        resolvedBy: mockUsers[1],
        category: 'tool',
        subCategory: 'power-issue',
        productionStopped: true,
        resolutionNotes: 'Replaced battery.',
    },
    {
        id: 'issue-8',
        title: 'Urgent assistance needed at Station B',
        location: 'Assembly Line 1 - Station B',
        productionLineId: 'line-1',
        priority: 'critical',
        status: 'in_progress',
        reportedAt: subHours(new Date(), 1),
        reportedBy: mockUsers[2],
        category: 'assistance',
    },
    {
        id: 'issue-9',
        title: 'Software UI is frozen',
        location: 'Packaging Line Alpha - Boxer',
        productionLineId: 'line-2',
        priority: 'medium',
        status: 'reported',
        reportedAt: subDays(new Date(), 4),
        reportedBy: mockUsers[2],
        category: 'it',
        subCategory: 'software',
    },
    {
        id: 'issue-10',
        title: 'Parts delivery is late',
        location: 'Assembly Line 1 - Station A',
        productionLineId: 'line-1',
        priority: 'medium',
        status: 'in_progress',
        reportedAt: subDays(new Date(), 5),
        reportedBy: mockUsers[2],
        category: 'logistics',
        subCategory: 'transport-delay',
    },
    {
        id: 'issue-11',
        title: 'Pneumatic drill is malfunctioning',
        location: 'Assembly Line 1 - Station A',
        productionLineId: 'line-1',
        priority: 'high',
        status: 'reported',
        reportedAt: subDays(new Date(), 1),
        reportedBy: mockUsers[2],
        category: 'tool',
        subCategory: 'tool-broken',
    },
    {
        id: 'issue-12',
        title: 'Incorrect color on component #C-113',
        location: 'Assembly Line 1 - QA',
        productionLineId: 'line-1',
        priority: 'medium',
        status: 'resolved',
        reportedAt: subDays(new Date(), 6),
        reportedBy: mockUsers[2],
        resolvedAt: subDays(new Date(), 5),
        resolvedBy: mockUsers[1],
        category: 'quality',
        subCategory: 'defect-found',
        resolutionNotes: 'Adjusted paint mixture.'
    },
    {
        id: 'issue-13',
        title: 'Cannot login to management software',
        location: 'Assembly Line 1 - Station A',
        productionLineId: 'line-1',
        priority: 'low',
        status: 'reported',
        reportedAt: subDays(new Date(), 7),
        reportedBy: mockUsers[2],
        category: 'it',
        subCategory: 'software',
    },
    {
        id: 'issue-14',
        title: 'Emergency stop button was pressed',
        location: 'Packaging Line Alpha - Palletizer',
        productionLineId: 'line-2',
        priority: 'critical',
        status: 'resolved',
        reportedAt: subDays(new Date(), 4),
        reportedBy: mockUsers[2],
        resolvedAt: subHours(subDays(new Date(), 4), -1),
        resolvedBy: mockUsers[1],
        category: 'assistance',
        productionStopped: true,
        resolutionNotes: 'False alarm. Reset the button.'
    },
    {
        id: 'issue-15',
        title: 'Hydraulic press needs calibration',
        location: 'Assembly Line 1 - Station B',
        productionLineId: 'line-1',
        priority: 'medium',
        status: 'in_progress',
        reportedAt: subHours(new Date(), 6),
        reportedBy: mockUsers[2],
        category: 'tool',
        subCategory: 'calibration',
    }
];


// --- Production Lines ---

export async function getProductionLines(): Promise<ProductionLine[]> {
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


// --- Users ---

export async function getAllUsers(): Promise<User[]> {
    return Promise.resolve(mockUsers);
}

export async function getUserByEmail(email: string): Promise<User | null> {
    const user = mockUsers.find(u => u.email === email);
    return Promise.resolve(user || null);
}

export async function addUser(data: { uid: string, firstName: string, lastName: string, email: string, role: Role, plan: Plan }) {
    const newUser: User = {
        id: data.uid,
        name: `${data.firstName} ${data.lastName}`,
        email: data.email,
        role: data.role,
        plan: data.plan,
        avatarUrl: `https://picsum.photos/seed/${data.uid}/100/100`, // Placeholder avatar
    };
    mockUsers.push(newUser);
    return Promise.resolve();
}


export async function deleteUser(userId: string) {
    mockUsers = mockUsers.filter(user => user.id !== userId);
    return Promise.resolve();
}

export async function updateUser(userId: string, data: { firstName: string, lastName: string, email: string, role: Role }) {
     mockUsers = mockUsers.map(user => 
        user.id === userId ? {
            ...user,
            name: `${data.firstName} ${data.lastName}`,
            email: data.email,
            role: data.role,
        } : user
    );
    return Promise.resolve();
}


// --- Issues ---

export async function getIssues(): Promise<Issue[]> {
    // Sort by date descending, like the original query
    const sortedIssues = [...mockIssues].sort((a, b) => b.reportedAt.getTime() - a.reportedAt.getTime());
    return Promise.resolve(sortedIssues);
}


export async function getIssueById(id: string): Promise<Issue | null> {
    const issue = mockIssues.find(i => i.id === id);
    return Promise.resolve(issue || null);
}

export async function addIssue(issueData: Omit<Issue, 'id' | 'reportedAt' | 'reportedBy' | 'status' | 'productionStopped'>, currentUser: User) {
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

export async function updateIssue(issueId: string, data: Partial<Omit<Issue, 'id'>>) {
    mockIssues = mockIssues.map(issue => 
        issue.id === issueId ? { ...issue, ...data } as Issue : issue
    );
    return Promise.resolve();
}
