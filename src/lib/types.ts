export type User = {
  name: string;
  email: string;
  avatarUrl: string;
};

export type Priority = "low" | "medium" | "high" | "critical";

export type Status = "reported" | "in_progress" | "resolved" | "archived";

export type Issue = {
  id: string;
  title: string;
  location: string;
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
