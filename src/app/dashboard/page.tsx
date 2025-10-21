
"use client";

import { useEffect, useState } from "react";
import { IssuesDataTable } from "@/components/dashboard/issues-data-table";
import { StatsCards } from "@/components/dashboard/stats-cards";
import { getClientIssues } from "@/lib/data";
import { subHours, intervalToDuration, differenceInSeconds, max } from "date-fns";
import { useUser } from "@/contexts/user-context";
import type { Issue } from "@/lib/types";
import { Skeleton } from "@/components/ui/skeleton";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { LayoutGrid, Rows } from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";
import { IssuesGrid } from "@/components/dashboard/issues-grid";

// ✅ Define Duration type since date-fns v3 removed its export
type Duration = {
  years?: number;
  months?: number;
  weeks?: number;
  days?: number;
  hours?: number;
  minutes?: number;
  seconds?: number;
};

export default function Home() {
  const { currentUser } = useUser();
  const isMobile = useIsMobile();
  const [allIssues, setAllIssues] = useState<Issue[]>([]);
  const [recentIssues, setRecentIssues] = useState<Issue[]>([]);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState<'list' | 'grid'>();

  useEffect(() => {
    if (isMobile) {
      setView('grid');
    } else {
      setView('list');
    }
  }, [isMobile]);


  const fetchData = async () => {
    if (!currentUser?.orgId) return;
    setLoading(true);
    const issuesData = await getClientIssues(currentUser.orgId!);
    setAllIssues(issuesData);
    setRecentIssues(issuesData.slice(0, 5));
    setLoading(false);
  };

  useEffect(() => {
    if (!currentUser?.orgId) return;

    fetchData();
    const interval = setInterval(fetchData, 30000);
    return () => clearInterval(interval);
  }, [currentUser?.orgId]);

  // ✅ Permission check
  if (!currentUser || (currentUser.role !== "admin" && currentUser.role !== "supervisor")) {
    return (
      <main className="flex flex-1 flex-col gap-4 p-4 lg:gap-6 lg:p-6 bg-background">
        <p>You do not have permission to view this page.</p>
      </main>
    );
  }

  const now = new Date();
  const twentyFourHoursAgo = subHours(now, 24);
  
  const stoppedIssuesInLast24h = allIssues.filter(
    (issue) => issue.productionStopped && issue.reportedAt > twentyFourHoursAgo
  );

  // Group issues by production line
  const issuesByLine: Record<string, Issue[]> = stoppedIssuesInLast24h.reduce(
    (acc, issue) => {
      const lineId = issue.productionLineId;
      if (!acc[lineId]) acc[lineId] = [];
      acc[lineId].push(issue);
      return acc;
    },
    {} as Record<string, Issue[]>
  );

  let totalDowntimeSeconds = 0;

  // Calculate merged downtime for each line
  for (const lineId in issuesByLine) {
    const lineIssues = issuesByLine[lineId];
    if (lineIssues.length === 0) continue;

    const intervals = lineIssues
      .map((issue) => ({
        start: issue.reportedAt,
        end: issue.resolvedAt && issue.resolvedAt < now ? issue.resolvedAt : now,
      }))
      .sort((a, b) => a.start.getTime() - b.start.getTime());

    const mergedIntervals = [intervals[0]];
    for (let i = 1; i < intervals.length; i++) {
      const lastMerged = mergedIntervals[mergedIntervals.length - 1];
      const current = intervals[i];
      if (current.start <= lastMerged.end) {
        lastMerged.end = max([lastMerged.end, current.end]);
      } else {
        mergedIntervals.push(current);
      }
    }

    const lineDowntime = mergedIntervals.reduce(
      (total, interval) => total + differenceInSeconds(interval.end, interval.start),
      0
    );

    totalDowntimeSeconds += lineDowntime;
  }

  const duration = intervalToDuration({ start: 0, end: totalDowntimeSeconds * 1000 });

  // ✅ Safer, cleaner duration formatter
  const formatDuration = (d: Duration) => {
    const parts = [];
    if (d.hours) parts.push(`${d.hours}h`);
    if (d.minutes) parts.push(`${d.minutes}m`);
    if (d.seconds && !d.hours && !d.minutes) parts.push(`${d.seconds}s`);
    return parts.join(" ") || "0m";
  };

  const productionStopTime = formatDuration(duration);

  // --- Average Resolution Time ---
  const resolvedIssues = allIssues.filter(
    (issue) => issue.status === "resolved" && issue.resolvedAt
  );

  const totalResolutionSeconds = resolvedIssues.reduce((acc, issue) => {
    if (issue.resolvedAt) {
      return acc + differenceInSeconds(issue.resolvedAt, issue.reportedAt);
    }
    return acc;
  }, 0);

  const avgResolutionSeconds =
    resolvedIssues.length > 0
      ? totalResolutionSeconds / resolvedIssues.length
      : 0;

  const formatAverageDuration = (seconds: number) => {
    if (seconds === 0) return "N/A";
    const hours = seconds / 3600;
    if (hours < 1) {
      const minutes = Math.round(seconds / 60);
      return `${minutes} min`;
    }
    return `${hours.toFixed(1)} hours`;
  };

  const avgResolutionTime = formatAverageDuration(avgResolutionSeconds);

  const stats = {
    openIssues: allIssues.filter(
      (issue) => issue.status === "in_progress" || issue.status === "reported"
    ).length,
    avgResolutionTime: avgResolutionTime,
    productionStopTime: productionStopTime,
    criticalAlerts: allIssues.filter(
      (issue) =>
        issue.priority === "critical" && issue.reportedAt > twentyFourHoursAgo
    ).length,
  };

  const renderRecentIssues = () => {
    if (!view) return null; // Don't render until view is determined

    if (view === 'grid') {
        return (
            <IssuesGrid 
                issues={recentIssues}
                title="Recent Issues"
                onIssueUpdate={fetchData}
            />
        );
    }
    
    return (
        <IssuesDataTable 
            issues={recentIssues} 
            title="Recent Issues" 
            onIssueUpdate={fetchData} 
        />
    );
  };


  return (
    <main className="flex flex-1 flex-col gap-4 p-4 lg:gap-6 lg:p-6 bg-background">
      <div className="flex items-center justify-between">
        <h1 className="text-lg font-semibold md:text-2xl">Dashboard</h1>
          {view && !loading && (
            <ToggleGroup type="single" value={view} onValueChange={(value) => value && setView(value as 'list' | 'grid')} aria-label="View mode">
                <ToggleGroupItem value="list" aria-label="List view">
                    <Rows className="h-4 w-4" />
                </ToggleGroupItem>
                <ToggleGroupItem value="grid" aria-label="Grid view">
                    <LayoutGrid className="h-4 w-4" />
                </ToggleGroupItem>
            </ToggleGroup>
          )}
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
          <StatsCards
            stats={[
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
                description: "in last 24 hours",
              },
            ]}
          />
          {renderRecentIssues()}
        </>
      )}
    </main>
  );
}
