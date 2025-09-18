
import type { User, Issue, StatCard, ProductionLine, ReportData, Kpi, IssueByDay, IssueCategory } from "@/lib/types";

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

const userProfiles = {
  janejones: {
    name: "Jane Jones",
    email: "jane.jones@example.com",
    avatarUrl: "https://picsum.photos/seed/user-jane/40/40",
    role: "operator",
    productionLineId: "line-3",
  },
  bobsmith: {
    name: "Bob Smith",
    email: "bob.smith@example.com",
    avatarUrl: "https://picsum.photos/seed/user-bob/40/40",
    role: "operator",
    productionLineId: "fab-bay-2",
  },
  alicewilliams: {
    name: "Alice Williams",
    email: "alice.williams@example.com",
    avatarUrl: "https://picsum.photos/seed/user-alice/40/40",
    role: "operator",
    productionLineId: "welding-1",
  },
  charliebrown: {
    name: "Charlie Brown",
    email: "charlie.brown@example.com",
    avatarUrl: "https://picsum.photos/seed/user-charlie/40/40",
    role: "operator",
    productionLineId: "packaging",
  },
  davidlee: {
    name: "David Lee",
    email: "david.lee@example.com",
    avatarUrl: "https://picsum.photos/seed/user-david/40/40",
    role: "operator",
    productionLineId: "finishing",
  },
  current: {
    name: "Alex Johnson",
    email: "alex.j@andon.io",
    avatarUrl: "https://picsum.photos/seed/user-alex/40/40",
    role: "admin",
  },
  operator: {
    name: "Sam Miller",
    email: "sam.m@andon.io",
    avatarUrl: "https://picsum.photos/seed/user-sam/40/40",
    role: "operator",
    productionLineId: "line-1",
  }
};

export const allUsers: User[] = Object.values(userProfiles);

// The 'users' object is now used to define the current user for demonstration purposes.
// To view the app as a specific user, set 'users.current' to one of the profiles above.
export const users = {
  current: userProfiles.operator, // Default to admin user
  operator: userProfiles.operator,
  admin: userProfiles.current,
};

export const issues: Issue[] = [
  {
    id: "AND-001",
    title: "Conveyor belt C-14 is running 15% slower than optimal speed.",
    location: "Assembly Line 3",
    productionLineId: "line-3",
    priority: "high",
    status: "in_progress",
    reportedAt: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
    reportedBy: userProfiles.janejones,
    category: "tool",
  },
  {
    id: "AND-002",
    title: "Stamping machine #7 is making an unusual grinding noise.",
    location: "Fabrication Bay 2",
    productionLineId: "fab-bay-2",
    priority: "critical",
    status: "reported",
    reportedAt: new Date(Date.now() - 30 * 60 * 1000), // 30 minutes ago
    reportedBy: userProfiles.bobsmith,
    category: "tool",
  },
  {
    id: "AND-003",
    title: "Safety sensor on robotic arm A-3 is intermittently failing.",
    location: "Welding Station 1",
    productionLineId: "welding-1",
    priority: "critical",
    status: "resolved",
    reportedAt: new Date(Date.now() - 24 * 60 * 60 * 1000), // 1 day ago
    reportedBy: userProfiles.alicewilliams,
    resolvedAt: new Date(Date.now() - 20 * 60 * 60 * 1000),
    resolvedBy: userProfiles.current,
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
    reportedAt: new Date(Date.now() - 4 * 60 * 60 * 1000), // 4 hours ago
    reportedBy: userProfiles.janejones,
    category: "logistics",
  },
  {
    id: "AND-005",
    title: "Paint sprayer nozzle clogged on line 2.",
    location: "Finishing Department",
    productionLineId: "finishing",
    priority: "medium",
    status: "in_progress",
    reportedAt: new Date(Date.now() - 8 * 60 * 60 * 1000), // 8 hours ago
    reportedBy: userProfiles.bobsmith,
    category: "tool",
  },
  {
    id: "AND-006",
    title: "Forklift B needs battery replacement.",
    location: "Warehouse",
    productionLineId: "warehouse",
    priority: "low",
    status: "resolved",
    reportedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), // 2 days ago
    reportedBy: userProfiles.alicewilliams,
    resolvedAt: new Date(Date.now() - 1.5 * 24 * 60 * 60 * 1000),
    resolvedBy: userProfiles.current,
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
    reportedAt: new Date(Date.now() - 60 * 60 * 1000), // 1 hour ago
    reportedBy: userProfiles.janejones,
    category: "tool",
  },
];

let nextIssueId = issues.length + 1;

export function addIssue(issueData: Omit<Issue, 'id' | 'reportedAt' | 'reportedBy' | 'status'>) {
    const newIssue: Issue = {
        ...issueData,
        id: `AND-${String(nextIssueId).padStart(3, '0')}`,
        reportedAt: new Date(),
        reportedBy: users.current,
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

export const reportData: ReportData = {
  resolutionTimeByCategory: [
    { category: "It & Network", hours: 2.5 },
    { category: "Logistics", hours: 4.1 },
    { category: "Tool & Equipment", hours: 5.8 },
    { category: "Assistance", hours: 1.2 },
    { category: "Quality", hours: 3.3 },
    { category: "Other", hours: 2.1 },
  ],
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
