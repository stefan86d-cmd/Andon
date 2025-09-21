
"use client";

import { useEffect, useState } from "react";
import { IssuesDataTable } from "@/components/dashboard/issues-data-table";
import { StatsCards } from "@/components/dashboard/stats-cards";
import { AppLayout } from "@/components/layout/app-layout";
import { getIssues } from "@/lib/data";
import { subHours, intervalToDuration, differenceInSeconds, min, max } from "date-fns";
import { useUser } from "@/contexts/user-context";
import type { Issue } from "@/lib/types";
import { Skeleton } from "@/components/ui/skeleton";

export default function Home() {
  const { currentUser } = useUser();
  const [issues, setIssues] = useState<Issue[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadIssues() {
      const issuesData = await getIssues();
      setIssues(issuesData);
      setLoading(false);
    }
    loadIssues();
  }, []);
  
  if (!currentUser || (currentUser.role !== 'admin' && currentUser.role !== 'supervisor')) {
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
  const userIssues = issues.slice(0, 5);

  const stoppedIssuesInLast24h = issues.filter(
    issue => issue.productionStopped && issue.reportedAt > twentyFourHoursAgo
  );

  // Group issues by production line
  const issuesByLine: Record<string, Issue[]> = stoppedIssuesInLast24h.reduce((acc, issue) => {
    const lineId = issue.productionLineId;
    if (!acc[lineId]) {
      acc[lineId] = [];
    }
    acc[lineId].push(issue);
    return acc;
  }, {} as Record<string, Issue[]>);

  let totalDowntimeSeconds = 0;

  // Calculate merged downtime for each line
  for (const lineId in issuesByLine) {
    const lineIssues = issuesByLine[lineId];
    if (lineIssues.length === 0) continue;

    // Create intervals and sort by start time
    const intervals = lineIssues.map(issue => ({
      start: issue.reportedAt,
      end: issue.resolvedAt && issue.resolvedAt < now ? issue.resolvedAt : now,
    })).sort((a, b) => a.start.getTime() - b.start.getTime());
    
    // Merge overlapping intervals
    const mergedIntervals = [intervals[0]];
    for (let i = 1; i < intervals.length; i++) {
      const lastMerged = mergedIntervals[mergedIntervals.length - 1];
      const current = intervals[i];
      if (current.start <= lastMerged.end) { // Overlap or contiguous
        lastMerged.end = max([lastMerged.end, current.end]);
      } else {
        mergedIntervals.push(current);
      }
    }
    
    // Sum durations of merged intervals
    const lineDowntime = mergedIntervals.reduce((total, interval) => {
        return total + differenceInSeconds(interval.end, interval.start);
    }, 0);

    totalDowntimeSeconds += lineDowntime;
  }
  

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
        
          {loading ? (
            <div className="space-y-6">
                <div className="grid gap-4 md:grid-cols-2 md:gap-8 lg:grid-cols-4">
                  <Skeleton className="h-28" />
                  <Skeleton className="h-28" />
                  <Skeleton className="h-28" />
                  <Skeleton className="h-28" />
                </div>
                <Skeleton className="h-96" />
            </div>
          ) : (
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
          )}
      </main>
    </AppLayout>
  );
}
