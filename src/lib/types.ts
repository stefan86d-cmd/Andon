
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

export type IssueCategory = 'it' | 'logistics' | 'tool' | 'assistance' | 'quality' | 'safety' | 'other';

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
  subCategory?: string;
  resolutionNotes?: string;
  resolvedAt?: Date;
  resolvedBy?: User;
  productionStopped?: boolean;
};

export type StatCard = {
  title: string;
  value: string;
  change: string;
  changeType: "increase" | "decrease";
  description: string;
};

export type DowntimeRecord = {
  category: string;
  hours: number;
};

export type DowntimeData = {
  "7d": DowntimeRecord[];
  "30d": DowntimeRecord[];
  "all": DowntimeRecord[];
}

export type Kpi = {
  title: string;
  value: string;
  subtitle: string;
}

export type IssueByDay = {
  date: string;
  issues: number;
}
