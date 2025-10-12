
export type Role = "admin" | "supervisor" | "operator";
export type Plan = "starter" | "standard" | "pro" | "enterprise" | "custom";

export type User = {
  id: string; // This is the Firebase Auth UID
  firstName: string;
  lastName: string;
  email: string;
  role: Role;
  plan: Plan;
  address: string;
  country: string;
  phone?: string;
  productionLineId?: string;
  orgId?: string; // Add orgId to the user type
  customUserLimit?: number;
  customLineLimit?: number;
};

// A simpler reference to a user, used within other documents.
export type UserRef = {
  email: string;
  name: string;
}

export type ProductionLine = {
  id: string;
  name: string;
  workstations: string[];
  orgId?: string; // Add orgId to the production line type
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
  reportedBy: UserRef;
  category: IssueCategory;
  subCategory?: string;
  resolutionNotes?: string;
  resolvedAt?: Date;
  resolvedBy?: UserRef | null;
  productionStopped: boolean;
  itemNumber?: string;
  quantity?: number;
  orgId: string;
};

// Type for how an issue is stored in Firestore
export type IssueDocument = Omit<Issue, 'id' | 'reportedBy' | 'resolvedBy' | 'reportedAt' | 'resolvedAt'> & {
  reportedAt: any; // Usually a Timestamp
  resolvedAt?: any; // Usually a Timestamp
  reportedBy: UserRef;
  resolvedBy?: UserRef | null;
}


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

    