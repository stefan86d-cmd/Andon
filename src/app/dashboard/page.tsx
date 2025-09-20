
"use client";

import { IssuesDataTable } from "@/components/dashboard/issues-data-table";
import { StatsCards } from "@/components/dashboard/stats-cards";
import { AppLayout } from "@/components/layout/app-layout";
import { issues } from "@/lib/data";
import { LoaderCircle } from "lucide-react";
import { subHours } from "date-fns";
import { useUser } from "@/contexts/user-context";

export default function Home() {
  const { currentUser } = useUser();
  
  const now = new Date();
  const twentyFourHoursAgo = subHours(now, 24);
  const userIssues = issues;
  
  const stats = {
    openIssues: issues.filter(issue => issue.status === 'in_progress' || issue.status === 'reported').length,
    avgResolutionTime: '3.2 hours',
    lineUptime: '98.7%',
    criticalAlerts: issues.filter(issue => issue.priority === 'critical' && issue.reportedAt > twentyFourHoursAgo).length,
  };

  if (!currentUser) {
    return (
      <div className="flex h-screen items-center justify-center">
        <LoaderCircle className="h-8 w-8 animate-spin" />
      </div>
    );
  }
  
  return (
    <AppLayout>
      <main className="flex flex-1 flex-col gap-4 p-4 lg:gap-6 lg:p-6 bg-background">
        <div className="flex items-center justify-between">
          <h1 className="text-lg font-semibold md:text-2xl">Dashboard</h1>
        </div>
        
          <>
            <StatsCards stats={[
                {
                    title: "Open Issues",
                    value: stats.openIssues.toString(),
                    change: "+5",
                    changeType: "increase",
                    description: "since last hour",
                },
                {
                    title: "Avg. Resolution Time",
                    value: stats.avgResolutionTime,
                    change: "-12%",
                    changeType: "decrease",
                    description: "this week",
                },
                {
                    title: "Line Uptime",
                    value: stats.lineUptime,
                    change: "+0.2%",
                    changeType: "increase",
                    description: "today",
                },
                {
                    title: "Critical Alerts",
                    value: stats.criticalAlerts.toString(),
                    change: "+1",
                    changeType: "increase",
                    description: "in last 24 hours"
                }
            ]} />
            <IssuesDataTable issues={userIssues} title="Recent Issues" />
          </>
      </main>
    </AppLayout>
  );
}
