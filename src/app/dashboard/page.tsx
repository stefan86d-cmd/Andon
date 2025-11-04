
"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { IssuesDataTable } from "@/components/dashboard/issues-data-table";
import { StatsCards } from "@/components/dashboard/stats-cards";
import { getClientIssues, getClientProductionLines } from "@/lib/data";
import { subHours, intervalToDuration, differenceInSeconds, max, subDays } from "date-fns";
import { useUser } from "@/contexts/user-context";
import type { Issue, ProductionLine, StatCard } from "@/lib/types";
import { Skeleton } from "@/components/ui/skeleton";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { LayoutGrid, Rows } from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";
import { IssuesGrid } from "@/components/dashboard/issues-grid";
import { toast } from "@/hooks/use-toast";
import { LoaderCircle } from "lucide-react";

type Duration = {
  years?: number;
  months?: number;
  weeks?: number;
  days?: number;
  hours?: number;
  minutes?: number;
  seconds?: number;
};

function formatDuration(d: Duration) {
    const parts = [];
    if (d.hours) parts.push(`${d.hours}h`);
    if (d.minutes) parts.push(`${d.minutes}m`);
    if (d.seconds && !d.hours && !d.minutes) parts.push(`${d.seconds}s`);
    return parts.join(" ") || "0m";
};

function formatAverageDuration(seconds: number) {
    if (seconds <= 0) return "N/A";
    const hours = seconds / 3600;
    if (hours < 1) {
    const minutes = Math.round(seconds / 60);
    return `${minutes} min`;
    }
    return `${hours.toFixed(1)} hours`;
};

function getChange(current: number, previous: number): { change: string, changeType: 'increase' | 'decrease' } {
    if (previous === 0) {
        return current > 0 ? { change: `+${current}`, changeType: 'increase' } : { change: '0', changeType: 'increase' };
    }
    if (current === previous) {
        return { change: '0', changeType: 'increase' }; // Or 'decrease', it doesn't matter
    }
    const diff = current - previous;
    const percentageChange = (diff / previous) * 100;
    
    if (Math.abs(diff) < 1 && diff !== 0) { // For fractional changes, show percentage
        return {
            change: `${percentageChange > 0 ? '+' : ''}${percentageChange.toFixed(0)}%`,
            changeType: diff > 0 ? 'increase' : 'decrease'
        };
    }

    return {
        change: `${diff > 0 ? '+' : ''}${diff}`,
        changeType: diff > 0 ? 'increase' : 'decrease'
    };
}


function DashboardPageContent() {
    const { currentUser, refreshCurrentUser } = useUser();
    const isMobile = useIsMobile();
    const searchParams = useSearchParams();
    const [allIssues, setAllIssues] = useState<Issue[]>([]);
    const [recentIssues, setRecentIssues] = useState<Issue[]>([]);
    const [productionLines, setProductionLines] = useState<ProductionLine[]>([]);
    const [loading, setLoading] = useState(true);
    const [view, setView] = useState<'list' | 'grid'>();

    useEffect(() => {
        const checkPaymentStatus = async () => {
            if (searchParams.get('payment_success') === 'true') {
                toast({
                    title: "Processing Your Purchase...",
                    description: "Your plan is being updated. Please wait a moment.",
                });

                // Wait a couple of seconds to give the webhook time to process.
                setTimeout(async () => {
                    await refreshCurrentUser();
                    toast({
                        title: "Purchase Successful!",
                        description: "Thank you for your purchase. Your plan has been upgraded.",
                    });
                     // Clean the URL
                    window.history.replaceState(null, '', '/dashboard');
                }, 2000); // 2-second delay
            }
        };
        
        checkPaymentStatus();
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [searchParams]);

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
        const [issuesData, linesData] = await Promise.all([
        getClientIssues(currentUser.orgId),
        getClientProductionLines(currentUser.orgId),
        ]);
        setAllIssues(issuesData);
        setRecentIssues(issuesData.slice(0, 5));
        setProductionLines(linesData);
        setLoading(false);
    };

    useEffect(() => {
        if (!currentUser?.orgId) return;

        fetchData();
        const interval = setInterval(fetchData, 30000);
        return () => clearInterval(interval);
    }, [currentUser?.orgId]);
    
    if (!currentUser || (currentUser.role !== "admin" && currentUser.role !== "supervisor")) {
        return (
          <main className="flex flex-1 flex-col gap-4 p-4 lg:gap-6 lg:p-6 bg-background">
            <p>You do not have permission to view this page.</p>
          </main>
        );
    }
    
    // --- STATS CALCULATIONS ---
    const now = new Date();
    
    // 1. Open Issues
    const openIssues = allIssues.filter(issue => issue.status === "in_progress" || issue.status === "reported");
    const openIssuesLastHour = allIssues.filter(issue => {
        const wasOpen = issue.reportedAt < subHours(now, 1) && (issue.status === 'reported' || issue.status === 'in_progress' || (issue.resolvedAt && issue.resolvedAt > subHours(now, 1)));
        return wasOpen;
    });
    const openIssuesChange = getChange(openIssues.length, openIssuesLastHour.length);

    // 2. Avg Resolution Time
    const last7DaysEnd = now;
    const last7DaysStart = subDays(now, 7);
    const prev7DaysEnd = last7DaysStart;
    const prev7DaysStart = subDays(now, 14);

    const resolvedThisWeek = allIssues.filter(i => i.status === 'resolved' && i.resolvedAt && i.resolvedAt >= last7DaysStart && i.resolvedAt <= last7DaysEnd);
    const totalResolutionSecondsThisWeek = resolvedThisWeek.reduce((acc, i) => acc + differenceInSeconds(i.resolvedAt!, i.reportedAt), 0);
    const avgResTimeThisWeek = resolvedThisWeek.length > 0 ? totalResolutionSecondsThisWeek / resolvedThisWeek.length : 0;
    
    const resolvedLastWeek = allIssues.filter(i => i.status === 'resolved' && i.resolvedAt && i.resolvedAt >= prev7DaysStart && i.resolvedAt < prev7DaysEnd);
    const totalResolutionSecondsLastWeek = resolvedLastWeek.reduce((acc, i) => acc + differenceInSeconds(i.resolvedAt!, i.reportedAt), 0);
    const avgResTimeLastWeek = resolvedLastWeek.length > 0 ? totalResolutionSecondsLastWeek / resolvedLastWeek.length : 0;
    const avgResTimeChange = getChange(avgResTimeThisWeek, avgResTimeLastWeek);
    
    // 3. Production Stop Time
    const last24h = subHours(now, 24);
    const prev24h = subHours(now, 48);
    const calculateDowntime = (issues: Issue[], startTime: Date, endTime: Date) => {
        const stoppedIssues = issues.filter(issue => issue.productionStopped && issue.reportedAt < endTime);
        let totalDowntimeSeconds = 0;
        const intervals = stoppedIssues.map(issue => ({
            start: issue.reportedAt > startTime ? issue.reportedAt : startTime,
            end: issue.resolvedAt && issue.resolvedAt < endTime ? issue.resolvedAt : endTime,
        })).filter(i => i.end && i.start < i.end).sort((a,b) => a.start.getTime() - b.start.getTime());

        if (intervals.length === 0) return 0;
        
        const merged = [intervals[0]];
        for (let i = 1; i < intervals.length; i++) {
            const last = merged[merged.length-1];
            const current = intervals[i];
            if(current.start <= last.end!) {
                last.end = max([last.end!, current.end!]);
            } else {
                merged.push(current);
            }
        }
        return merged.reduce((acc, interval) => acc + differenceInSeconds(interval.end!, interval.start), 0);
    }
    const stopTimeLast24h = calculateDowntime(allIssues, last24h, now);
    const stopTimePrev24h = calculateDowntime(allIssues, prev24h, last24h);
    const stopTimeChange = getChange(stopTimeLast24h / 60, stopTimePrev24h / 60); // Compare in minutes
    
    // 4. Critical Alerts
    const criticalAlertsLast24h = allIssues.filter(i => i.priority === "critical" && i.reportedAt > last24h).length;
    const criticalAlertsPrev24h = allIssues.filter(i => i.priority === "critical" && i.reportedAt > prev24h && i.reportedAt <= last24h).length;
    const criticalAlertsChange = getChange(criticalAlertsLast24h, criticalAlertsPrev24h);
    

    const stats: StatCard[] = [
        {
            title: "Open Issues",
            value: openIssues.length.toString(),
            change: openIssuesChange.change,
            changeType: openIssuesChange.changeType,
            changeDescription: "since last hour",
        },
        {
            title: "Avg. Resolution Time",
            value: formatAverageDuration(avgResTimeThisWeek),
            change: avgResTimeChange.change.includes('%') ? avgResTimeChange.change : `${avgResTimeChange.change}s`,
            changeType: avgResTimeChange.changeType,
            changeDescription: "vs. last week",
        },
        {
            title: "Production Stop Time",
            value: formatDuration(intervalToDuration({ start: 0, end: stopTimeLast24h * 1000 })),
            change: `${stopTimeChange.change}m`,
            changeType: stopTimeChange.changeType,
            changeDescription: "vs. previous 24h",
        },
        {
            title: "Critical Alerts",
            value: criticalAlertsLast24h.toString(),
            change: criticalAlertsChange.change,
            changeType: criticalAlertsChange.changeType,
            changeDescription: "in last 24h",
        },
    ];

    const renderRecentIssues = () => {
        if (!view) return null;

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
                productionLines={productionLines}
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
                <StatsCards stats={stats} />
                {renderRecentIssues()}
                </>
            )}
        </main>
    );
}


export default function DashboardPage() {
  return (
    <Suspense fallback={
        <div className="flex h-screen items-center justify-center">
            <LoaderCircle className="h-8 w-8 animate-spin" />
        </div>
    }>
        <DashboardPageContent />
    </Suspense>
  );
}
