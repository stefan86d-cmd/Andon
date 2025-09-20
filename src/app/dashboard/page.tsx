
import { IssuesDataTable } from "@/components/dashboard/issues-data-table";
import { StatsCards } from "@/components/dashboard/stats-cards";
import { AppLayout } from "@/components/layout/app-layout";
import { getIssues, getProductionLines } from "@/lib/data";
import { subHours, intervalToDuration, differenceInSeconds } from "date-fns";
import { auth } from "@/lib/firebase";
import { getUserByEmail } from "@/lib/data";

export default async function Home() {
  const [issues, user] = await Promise.all([
    getIssues(),
    auth.currentUser ? getUserByEmail(auth.currentUser.email!) : null,
  ]);
  
  if (!user || (user.role !== 'admin' && user.role !== 'supervisor')) {
    // This part of the component logic might need adjustment
    // depending on how you handle auth redirects in Next.js 14 App Router.
    // For now, it assumes some mechanism prevents non-admins/supervisors from reaching this page.
    return (
      <AppLayout>
        <main className="flex flex-1 flex-col gap-4 p-4 lg:gap-6 lg:p-6 bg-background">
          <p>You do not have permission to view this page.</p>
        </main>
      </AppLayout>
    );
  }
  
  const now = new Date();
  const twentyFourHoursAgo = subHours(now, 24);
  const userIssues = issues.slice(0, 20);

  const stoppedIssuesInLast24h = issues.filter(
    issue => issue.productionStopped && issue.reportedAt > twentyFourHoursAgo
  );

  const totalDowntimeSeconds = stoppedIssuesInLast24h.reduce((total, issue) => {
    const end = issue.resolvedAt && issue.resolvedAt < now ? issue.resolvedAt : now;
    return total + differenceInSeconds(end, issue.reportedAt);
  }, 0);

  const duration = intervalToDuration({ start: 0, end: totalDowntimeSeconds * 1000 });

  const formatDuration = (d: Duration) => {
    const parts = [];
    if (d.hours) parts.push(`${d.hours}h`);
    if (d.minutes) parts.push(`${d.minutes}m`);
    if (parts.length === 0 && d.seconds !== undefined) {
      if (d.hours === 0 && d.minutes === 0) {
        return "0m";
      }
    }
    return parts.join(' ') || '0m';
  }

  const productionStopTime = formatDuration(duration);
  
  const stats = {
    openIssues: issues.filter(issue => issue.status === 'in_progress' || issue.status === 'reported').length,
    avgResolutionTime: '3.2 hours',
    productionStopTime: productionStopTime,
    criticalAlerts: issues.filter(issue => issue.priority === 'critical' && issue.reportedAt > twentyFourHoursAgo).length,
  };
  
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
                    title: "Production Stop Time",
                    value: stats.productionStopTime,
                    change: "+15m",
                    changeType: "increase",
                    description: "in last 24 hours",
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
