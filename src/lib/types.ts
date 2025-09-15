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
};

export type Priority = "low" | "medium" | "high" | "critical";

export type Status = "reported" | "in_progress" | "resolved" | "archived";

export type Issue = {
  id: string;
  title: string;
  location: string;
  productionLineId: string;
  priority: Priority;
  status: Status;
  reportedAt: Date;
  reportedBy: User;
};

export type StatCard = {
  title: string;
  value: string;
  change: string;
  changeType: "increase" | "decrease";
  description: string;
};
