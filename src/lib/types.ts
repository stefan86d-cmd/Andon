export type Role = "admin" | "operator";

export type User = {
  name: string;
  email: string;
  avatarUrl: string;
  role: Role;
  productionLineId?: string;
};

export type ProductionLine = {
  id: string;
  name: string;
  workstations: string[];
};

export type Priority = "low" | "medium" | "high" | "critical";

export type Status = "reported" | "in_progress" | "resolved" | "archived";

export type IssueCategory = 'it' | 'logistics' | 'tool' | 'assistance' | 'quality' | 'other';

export type Issue = {
  id: string;
  title: string;
  location: string;
  productionLineId: string;
  priority: Priority;
  status: Status;
  reportedAt: Date;
  reportedBy: User;
  category: IssueCategory;
};

export type StatCard = {
  title: string;
  value: string;
  change: string;
  changeType: "increase" | "decrease";
  description: string;
};

export type ReportData = {
  resolutionTimeByCategory: {
    category: string;
    hours: number;
  }[];
};

export type Kpi = {
  title: string;
  value: string;
  subtitle: string;
}

export type IssueByDay = {
  date: string;
  issues: number;
}
