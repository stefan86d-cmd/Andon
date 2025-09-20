
import type { User, Issue, StatCard, ProductionLine, Kpi, IssueByDay, IssueCategory, Role, DowntimeData } from "@/lib/types";

export let productionLines: ProductionLine[] = [
  { 
    id: "line-1", 
    name: "Assembly Line 1",
    workstations: ["Phase 1: Component Prep", "Phase 2: Main Assembly", "Phase 3: Initial QA"],
  },
  { 
    id: "line-2", 
    name: "Assembly Line 2",
    workstations: ["Phase 1: Sub-Assembly A", "Phase 2: Sub-Assembly B", "Phase 3: Final Assembly"],
  },
  { 
    id: "line-3", 
    name: "Assembly Line 3",
    workstations: ["Phase 1: Frame Welding", "Phase 2: Body Panel Attachment", "Phase 3: Inspection"],
  },
  { 
    id: "fab-bay-1", 
    name: "Fabrication Bay 1",
    workstations: ["Cutting Station", "Bending Station", "Drilling Station"],
  },
  { 
    id: "fab-bay-2", 
    name: "Fabrication Bay 2",
    workstations: ["Stamping Press", "Laser Cutter"],
  },
  { 
    id: "welding-1", 
    name: "Welding Station 1",
    workstations: ["Manual MIG", "Robotic TIG", "Spot Welding"],
  },
  { 
    id: "packaging", 
    name: "Packaging Area",
    workstations: ["Station 1", "Station 2", "Station 3", "Station 4", "Station 5"],
  },
  { id: "finishing", 
    name: "Finishing Department",
    workstations: ["Sanding", "Painting", "Polishing"],
  },
  { 
    id: "warehouse", 
    name: "Warehouse",
    workstations: ["Receiving", "Shipping", "Inventory"],
  },
];

const userProfiles: User[] = [
  {
    name: "Jane Jones",
    email: "jane.jones@example.com",
    avatarUrl: "https://picsum.photos/seed/user-jane/40/40",
    role: "operator",
    productionLineId: "line-3",
  },
  {
    name: "Bob Smith",
    email: "bob.smith@example.com",
    avatarUrl: "https://picsum.photos/seed/user-bob/40/40",
    role: "operator",
    productionLineId: "fab-bay-2",
  },
  {
    name: "Alice Williams",
    email: "alice.williams@example.com",
    avatarUrl: "https://picsum.photos/seed/user-alice/40/40",
    role: "operator",
    productionLineId: "welding-1",
  },
  {
    name: "Charlie Brown",
    email: "charlie.brown@example.com",
    avatarUrl: "https://picsum.photos/seed/user-charlie/40/40",
    role: "operator",
    productionLineId: "packaging",
  },
  {
    name: "David Lee",
    email: "david.lee@example.com",
    avatarUrl: "https://picsum.photos/seed/user-david/40/40",
    role: "operator",
    productionLineId: "finishing",
  },
  {
    name: "Alex Johnson",
    email: "alex.j@andon.io",
    avatarUrl: "https://picsum.photos/seed/user-alex/40/40",
    role: "admin",
  },
  {
    name: "Sam Miller",
    email: "sam.m@andon.io",
    avatarUrl: "https://picsum.photos/seed/user-sam/40/40",
    role: "operator",
    productionLineId: "line-1",
  }
];

export let allUsers: User[] = [...userProfiles];

const usersByEmail = userProfiles.reduce((acc, user) => {
  acc[user.email] = user;
  return acc;
}, {} as Record<string, User>);


export const issues: Issue[] = [
  {
    id: "AND-001",
    title: "Conveyor belt C-14 is running 15% slower than optimal speed.",
    location: "Assembly Line 3",
    productionLineId: "line-3",
    priority: "high",
    status: "in_progress",
    reportedAt: new Date("2024-09-20T10:30:00Z"),
    reportedBy: usersByEmail['jane.jones@example.com'],
    category: "tool",
  },
  {
    id: "AND-002",
    title: "Stamping machine #7 is making an unusual grinding noise.",
    location: "Fabrication Bay 2",
    productionLineId: "fab-bay-2",
    priority: "critical",
    status: "reported",
    reportedAt: new Date("2024-09-20T12:00:00Z"),
    reportedBy: usersByEmail['bob.smith@example.com'],
    category: "tool",
  },
  {
    id: "AND-003",
    title: "Safety sensor on robotic arm A-3 is intermittently failing.",
    location: "Welding Station 1",
    productionLineId: "welding-1",
    priority: "critical",
    status: "resolved",
    reportedAt: new Date("2024-09-19T12:30:00Z"),
    reportedBy: usersByEmail['alice.williams@example.com'],
    resolvedAt: new Date("2024-09-19T16:30:00Z"),
    resolvedBy: usersByEmail['alex.j@andon.io'],
    resolutionNotes: "Replaced faulty sensor and recalibrated the robotic arm. System is now operating normally.",
    category: "quality",
  },
  {
    id: "AND-004",
    title: "Low supply of M6 bolts at packaging station 5.",
    location: "Packaging Area",
    productionLineId: "packaging",
    priority: "low",
    status: "reported",
    reportedAt: new Date("2024-09-20T08:30:00Z"),
    reportedBy: usersByEmail['jane.jones@example.com'],
    category: "logistics",
  },
  {
    id: "AND-005",
    title: "Paint sprayer nozzle clogged on line 2.",
    location: "Finishing Department",
    productionLineId: "finishing",
    priority: "medium",
    status: "in_progress",
    reportedAt: new Date("2024-09-20T04:30:00Z"),
    reportedBy: usersByEmail['bob.smith@example.com'],
    category: "tool",
  },
  {
    id: "AND-006",
    title: "Forklift B needs battery replacement.",
    location: "Warehouse",
    productionLineId: "warehouse",
    priority: "low",
    status: "resolved",
    reportedAt: new Date("2024-09-18T12:30:00Z"),
    reportedBy: usersByEmail['alice.williams@example.com'],
    resolvedAt: new Date("2024-09-19T00:30:00Z"),
    resolvedBy: usersByEmail['alex.j@andon.io'],
    resolutionNotes: "Battery swapped with a fully charged unit.",
    category: "logistics",
  },
  {
    id: "AND-007",
    title: "Hydraulic press leaking fluid.",
    location: "Fabrication Bay 1",
    productionLineId: "fab-bay-1",
    priority: "high",
    status: "reported",
    reportedAt: new Date("2024-09-20T11:30:00Z"),
    reportedBy: usersByEmail['jane.jones@example.com'],
    category: "tool",
  },
];

let nextIssueId = issues.length + 1;

// This is a mock implementation. In a real app, you'd get the current user from an auth session.
// For now, we'll need to pass the current user to this function.
export function addIssue(issueData: Omit<Issue, 'id' | 'reportedAt' | 'reportedBy' | 'status'>, currentUser: User) {
    if (!currentUser) {
        throw new Error("Cannot report issue without a logged in user.");
    }
    const newIssue: Issue = {
        ...issueData,
        id: `AND-${String(nextIssueId).padStart(3, '0')}`,
        reportedAt: new Date(),
        reportedBy: currentUser,
        status: 'reported',
        category: issueData.category as IssueCategory,
    };
    issues.unshift(newIssue);
    nextIssueId++;
}

let nextLineId = productionLines.length + 1;

export function addProductionLine(lineData: { name: string }) {
    const newLine: ProductionLine = {
        id: `line-${nextLineId + 10}`, // use a different seed to avoid collision
        name: lineData.name,
        workstations: [],
    };
    productionLines.push(newLine);
    nextLineId++;
}

export function updateProductionLine(lineId: string, updatedData: Partial<ProductionLine>) {
    const lineIndex = productionLines.findIndex(line => line.id === lineId);
    if (lineIndex !== -1) {
        productionLines[lineIndex] = { ...productionLines[lineIndex], ...updatedData };
    }
}

export function deleteProductionLine(lineId: string) {
    const lineIndex = productionLines.findIndex(line => line.id === lineId);
    if (lineIndex !== -1) {
        productionLines.splice(lineIndex, 1);
    }
}

export function deleteUser(email: string) {
    const userIndex = allUsers.findIndex(user => user.email === email);
    if (userIndex !== -1) {
        const user = allUsers[userIndex];
        // Prevent deletion of the default admin/operator for demo purposes
        if (user.email === 'alex.j@andon.io' || user.email === 'sam.m@andon.io') {
             throw new Error("Cannot delete default admin or operator roles.");
        }
        allUsers.splice(userIndex, 1);
    } else {
        throw new Error("User not found.");
    }
}

export function updateUser(originalEmail: string, data: { firstName: string, lastName: string, email: string, role: Role }) {
    const userIndex = allUsers.findIndex(user => user.email === originalEmail);
    if (userIndex !== -1) {
        const user = allUsers[userIndex];
        user.name = `${data.firstName} ${data.lastName}`;
        user.email = data.email;
        // Don't allow changing role for default admin/operator
        if (user.email !== 'alex.j@andon.io' && user.email !== 'sam.m@andon.io') {
            user.role = data.role;
        }
        allUsers[userIndex] = user;
    } else {
        throw new Error("User not found.");
    }
}


export const stats: StatCard[] = [
    {
        title: "Open Issues",
        value: "27",
        change: "+5",
        changeType: "increase",
        description: "since last hour",
    },
    {
        title: "Avg. Resolution Time",
        value: "3.2 hours",
        change: "-12%",
        changeType: "decrease",
        description: "this week",
    },
    {
        title: "Line Uptime",
        value: "98.7%",
        change: "+0.2%",
        changeType: "increase",
        description: "today",
    },
    {
        title: "Critical Alerts",
        value: "3",
        change: "+1",
        changeType: "increase",
        description: "in last 24 hours"
    }
];

export const downtimeByCategory: DowntimeData = {
  '7d': [
    { category: "IT & Network", hours: 2.5 },
    { category: "Logistics", hours: 4.1 },
    { category: "Tool & Equipment", hours: 8.8 },
    { category: "Assistance", hours: 1.2 },
    { category: "Quality", hours: 3.3 },
    { category: "Safety", hours: 1.9 },
    { category: "Other", hours: 0.5 },
  ],
  '30d': [
    { category: "IT & Network", hours: 10.2 },
    { category: "Logistics", hours: 15.5 },
    { category: "Tool & Equipment", hours: 35.1 },
    { category: "Assistance", hours: 5.0 },
    { category: "Quality", hours: 12.8 },
    { category: "Safety", hours: 7.2 },
    { category: "Other", hours: 2.1 },
  ],
  'all': [
    { category: "IT & Network", hours: 50.7 },
    { category: "Logistics", hours: 80.3 },
    { category: "Tool & Equipment", hours: 152.9 },
    { category: "Assistance", hours: 22.0 },
    { category: "Quality", hours: 61.4 },
    { category: "Safety", hours: 33.6 },
    { category: "Other", hours: 10.2 },
  ]
};


export const kpiData: Kpi[] = [
  { title: "Total Downtime", value: "18.5 hours", subtitle: "Across all lines in the last 7 days" },
  { title: "Most Impacted Line", value: "Assembly Line 3", subtitle: "5.2 hours of downtime" },
]

export const issuesByDay: IssueByDay[] = [
  { date: "Mon", issues: 4 },
  { date: "Tue", issues: 6 },
  { date: "Wed", issues: 5 },
  { date: "Thu", issues: 7 },
  { date: "Fri", issues: 3 },
  { date: "Sat", issues: 2 },
  { date: "Sun", issues: 1 },
];
