
export type Role = "admin" | "supervisor" | "operator";

export type User = {
  id: string; // Document ID from Firestore
  name: string;
  email: string;
  avatarUrl: string;
  role: Role;
  productionLineId?: string;
};

// A simpler reference to a user, used within other documents.
export type UserRef = {
  email: string;
  name: string;
  avatarUrl: string;
}

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
  reportedBy: User; // This is a fully populated User object for display
  category: IssueCategory;
  subCategory?: string;
  resolutionNotes?: string;
  resolvedAt?: Date;
  resolvedBy?: User | null; // This is a fully populated User object for display
  productionStopped?: boolean;
  itemNumber?: string;
  quantity?: number;
};

// Type for how an issue is stored in Firestore
export type IssueDocument = Omit<Issue, 'id' | 'reportedBy' | 'resolvedBy'> & {
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
