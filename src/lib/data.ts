import type { User, Issue, Status, Priority, StatCard } from "@/lib/types";

export const users: { [key: string]: User } = {
  janejones: {
    name: "Jane Jones",
    email: "jane.jones@example.com",
    avatarUrl: "https://picsum.photos/seed/user-jane/40/40",
  },
  bobsmith: {
    name: "Bob Smith",
    email: "bob.smith@example.com",
    avatarUrl: "https://picsum.photos/seed/user-bob/40/40",
  },
  alicewilliams: {
    name: "Alice Williams",
    email: "alice.williams@example.com",
    avatarUrl: "https://picsum.photos/seed/user-alice/40/40",
  },
  current: {
    name: "Alex Johnson",
    email: "alex.j@andon.io",
    avatarUrl: "https://picsum.photos/seed/user-alex/40/40",
  },
};

export const issues: Issue[] = [
  {
    id: "AND-001",
    title: "Conveyor belt C-14 is running 15% slower than optimal speed.",
    location: "Assembly Line 3",
    priority: "high",
    status: "in_progress",
    reportedAt: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
    reportedBy: users.janejones,
  },
  {
    id: "AND-002",
    title: "Stamping machine #7 is making an unusual grinding noise.",
    location: "Fabrication Bay 2",
    priority: "critical",
    status: "reported",
    reportedAt: new Date(Date.now() - 30 * 60 * 1000), // 30 minutes ago
    reportedBy: users.bobsmith,
  },
  {
    id: "AND-003",
    title: "Safety sensor on robotic arm A-3 is intermittently failing.",
    location: "Welding Station 1",
    priority: "critical",
    status: "resolved",
    reportedAt: new Date(Date.now() - 24 * 60 * 60 * 1000), // 1 day ago
    reportedBy: users.alicewilliams,
  },
  {
    id: "AND-004",
    title: "Low supply of M6 bolts at packaging station 5.",
    location: "Packaging Area",
    priority: "low",
    status: "reported",
    reportedAt: new Date(Date.now() - 4 * 60 * 60 * 1000), // 4 hours ago
    reportedBy: users.janejones,
  },
  {
    id: "AND-005",
    title: "Paint sprayer nozzle clogged on line 2.",
    location: "Finishing Department",
    priority: "medium",
    status: "in_progress",
    reportedAt: new Date(Date.now() - 8 * 60 * 60 * 1000), // 8 hours ago
    reportedBy: users.bobsmith,
  },
  {
    id: "AND-006",
    title: "Forklift B needs battery replacement.",
    location: "Warehouse",
    priority: "low",
    status: "resolved",
    reportedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), // 2 days ago
    reportedBy: users.alicewilliams,
  },
  {
    id: "AND-007",
    title: "Hydraulic press leaking fluid.",
    location: "Fabrication Bay 1",
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
