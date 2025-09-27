
import type { User, Issue, ProductionLine, Role, IssueCategory, Plan, IssueDocument, UserRef } from "@/lib/types";
import { format, subDays, subHours } from "date-fns";

// --- Mock Data ---

const mockAdminUser: User = {
  id: "qMsJrT4y9nNGVKEqxHM62hdgHz92",
  firstName: "Alex",
  lastName: "Johnson",
  email: "alex.j@andon.io",
  role: "admin",
  plan: "pro",
  address: "123 Admin Way",
  country: "US",
  phone: "123-456-7890",
};

const mockSupervisorUser: User = {
  id: "supervisor-01",
  firstName: "Jane",
  lastName: "Supervisor",
  email: "jane.s@example.com",
  role: "supervisor",
  plan: "pro",
  address: "456 Supervisor St",
  country: "US",
};

const mockOperatorUser: User = {
    id: "operator-01",
    firstName: "Bob",
    lastName: "Operator",
    email: "bob.o@example.com",
    role: "operator",
    plan: "pro",
    address: "789 Operator Ave",
    country: "US",
    productionLineId: "line-1",
};

const mockUsers: User[] = [mockAdminUser, mockSupervisorUser, mockOperatorUser];

const mockProductionLines: ProductionLine[] = [
    { id: "line-1", name: "Assembly Line 1", workstations: ["Station A", "Station B", "Station C"] },
    { id: "line-2", name: "Packaging Line", workstations: ["Packer 1", "Packer 2"] },
    { id: "line-3", name: "Quality Control", workstations: ["QC Bench 1", "QC Bench 2", "QC Bench 3"] },
];

const mockIssues: Issue[] = [
    {
        id: "issue-001",
        title: "Conveyor Belt Jammed",
        location: "Assembly Line 1 - Station B",
        productionLineId: "line-1",
        priority: "critical",
        status: "in_progress",
        reportedAt: subHours(new Date(), 2),
        reportedBy: { name: `${mockOperatorUser.firstName} ${mockOperatorUser.lastName}`, email: mockOperatorUser.email },
        category: "tool",
        subCategory: "tool-broken",
        productionStopped: true,
    },
    {
        id: "issue-002",
        title: "Network connectivity lost",
        location: "Quality Control - QC Bench 1",
        productionLineId: "line-3",
        priority: "high",
        status: "reported",
        reportedAt: subHours(new Date(), 1),
        reportedBy: { name: `${mockOperatorUser.firstName} ${mockOperatorUser.lastName}`, email: mockOperatorUser.email },
        category: "it",
        subCategory: "network",
        productionStopped: false,
    },
    {
        id: "issue-003",
        title: "Incorrect material supplied",
        location: "Packaging Line - Packer 1",
        productionLineId: "line-2",
        priority: "medium",
        status: "reported",
        reportedAt: subHours(new Date(), 4),
        reportedBy: { name: `${mockOperatorUser.firstName} ${mockOperatorUser.lastName}`, email: mockOperatorUser.email },
        category: "logistics",
        subCategory: "incorrect-material",
        itemNumber: "PN-54321",
        quantity: 100,
        productionStopped: false,
    },
    {
        id: "issue-004",
        title: "Power Drill not working",
        location: "Assembly Line 1 - Station A",
        productionLineId: "line-1",
        priority: "low",
        status: "resolved",
        reportedAt: subDays(new Date(), 1),
        resolvedAt: subHours(new Date(), 22),
        reportedBy: { name: `${mockOperatorUser.firstName} ${mockOperatorUser.lastName}`, email: mockOperatorUser.email },
        resolvedBy: { name: `${mockSupervisorUser.firstName} ${mockSupervisorUser.lastName}`, email: mockSupervisorUser.email },
        category: "tool",
        resolutionNotes: "Replaced battery pack.",
        productionStopped: false,
    },
     {
        id: "issue-005",
        title: "Assistance needed for heavy lift",
        location: "Assembly Line 1 - Station C",
        productionLineId: "line-1",
        priority: "medium",
        status: "reported",
        reportedAt: subMinutes(new Date(), 15),
        reportedBy: { name: `${mockOperatorUser.firstName} ${mockOperatorUser.lastName}`, email: mockOperatorUser.email },
        category: "assistance",
        productionStopped: false,
    },
];

// --- Mock API Functions ---

export async function getProductionLines(): Promise<ProductionLine[]> {
    console.log("MOCK: Fetching production lines.");
    return Promise.resolve(mockProductionLines);
}

export async function getAllUsers(): Promise<User[]> {
    console.log("MOCK: Fetching all users.");
    return Promise.resolve(mockUsers);
}

export async function getUserByEmail(email: string): Promise<User | null> {
    console.log(`MOCK: Getting user by email: ${email}`);
    const user = mockUsers.find(u => u.email === email);
    return Promise.resolve(user || null);
}

export async function getUserById(uid: string): Promise<User | null> {
    console.log(`MOCK: Getting user by ID: ${uid}`);
    if (uid === "qMsJrT4y9nNGVKEqxHM62hdgHz92") {
        return Promise.resolve(mockAdminUser);
    }
    const user = mockUsers.find(u => u.id === uid);
    return Promise.resolve(user || null);
}

export async function getIssues(): Promise<Issue[]> {
    console.log("MOCK: Fetching all issues.");
    return Promise.resolve(mockIssues);
}

export async function getIssueById(id: string): Promise<Issue | null> {
    console.log(`MOCK: Getting issue by ID: ${id}`);
    const issue = mockIssues.find(i => i.id === id);
    return Promise.resolve(issue || null);
}

// Helper function not in original file, but useful for mocks
function subMinutes(date: Date, minutes: number): Date {
  const newDate = new Date(date);
  newDate.setMinutes(date.getMinutes() - minutes);
  return newDate;
}
