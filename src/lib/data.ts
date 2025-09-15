import type { User, Issue, StatCard, ProductionLine } from "@/lib/types";

export const productionLines: ProductionLine[] = [
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
  { 
    id: "finishing", 
    name: "Finishing Department",
    workstations: ["Sanding", "Painting", "Polishing"],
  },
  { 
    id: "warehouse", 
    name: "Warehouse",
    workstations: ["Receiving", "Shipping", "Inventory"],
  },
];

export const users: { [key: string]: User } = {
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

export const issues: Issue[] = [
  {
    id: "AND-001",
    title: "Conveyor belt C-14 is running 15% slower than optimal speed.",
    location: "Assembly Line 3",
    productionLineId: "line-3",
    priority: "high",
    status: "in_progress",
    reportedAt: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
    reportedBy: users.janejones,
  },
  {
    id: "AND-002",
    title: "Stamping machine #7 is making an unusual grinding noise.",
    location: "Fabrication Bay 2",
    productionLineId: "fab-bay-2",
    priority: "critical",
    status: "reported",
    reportedAt: new Date(Date.now() - 30 * 60 * 1000), // 30 minutes ago
    reportedBy: users.bobsmith,
  },
  {
    id: "AND-003",
    title: "Safety sensor on robotic arm A-3 is intermittently failing.",
    location: "Welding Station 1",
    productionLineId: "welding-1",
    priority: "critical",
    status: "resolved",
    reportedAt: new Date(Date.now() - 24 * 60 * 60 * 1000), // 1 day ago
    reportedBy: users.alicewilliams,
  },
  {
    id: "AND-004",
    title: "Low supply of M6 bolts at packaging station 5.",
    location: "Packaging Area",
    productionLineId: "packaging",
    priority: "low",
    status: "reported",
    reportedAt: new Date(Date.now() - 4 * 60 * 60 * 1000), // 4 hours ago
    reportedBy: users.janejones,
  },
  {
    id: "AND-005",
    title: "Paint sprayer nozzle clogged on line 2.",
    location: "Finishing Department",
    productionLineId: "finishing",
    priority: "medium",
    status: "in_progress",
    reportedAt: new Date(Date.now() - 8 * 60 * 60 * 1000), // 8 hours ago
    reportedBy: users.bobsmith,
  },
  {
    id: "AND-006",
    title: "Forklift B needs battery replacement.",
    location: "Warehouse",
    productionLineId: "warehouse",
    priority: "low",
    status: "resolved",
    reportedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), // 2 days ago
    reportedBy: users.alicewilliams,
  },
  {
    id: "AND-007",
    title: "Hydraulic press leaking fluid.",
    location: "Fabrication Bay 1",
    productionLineId: "fab-bay-1",
    priority: "high",
    status: "reported",
    reportedAt: new Date(Date.now() - 60 * 60 * 1000), // 1 hour ago
    reportedBy: users.janejones,
  },
];

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
]
