
"use client";

import { useEffect, useState } from "react";
import { AppLayout } from "@/components/layout/app-layout";
import { StatsCards } from "@/components/dashboard/stats-cards";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getIssues, getProductionLines } from "@/lib/data";
import type { Issue, IssueCategory, ProductionLine } from "@/lib/types";
import { IssuesTrendChart } from "@/components/reports/issues-trend-chart";
import { format, subDays, eachDayOfInterval, startOfDay } from "date-fns";
import { LoaderCircle } from "lucide-react";
import { PieChartWithPercentages } from "@/components/reports/pie-chart-with-percentages";
import { FilteredBarChart } from "@/components/reports/filtered-bar-chart";
import { useUser } from "@/contexts/user-context";

const allCategories: { id: IssueCategory, label: string, color: string }[] = [
    { id: 'it', label: 'IT & Network', color: 'hsl(var(--chart-1))' },
    { id: 'logistics', label: 'Logistics', color: 'hsl(var(--chart-2))' },
    { id: 'tool', label: 'Tool & Equipment', color: 'hsl(var(--chart-3))' },
    { id: 'quality', label: 'Quality', color: 'hsl(var(--chart-4))' },
    { id: 'assistance', label: 'Assistance', color: 'hsl(var(--chart-5))' },
    { id: 'other', label: 'Other', color: 'hsl(var(--primary))' },
];

export default function ReportsPage() {
  const { currentUser } = useUser();
  const [issues, setIssues] = useState<Issue[]>([]);
  const [productionLines, setProductionLines] = useState<ProductionLine[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      const [issuesData, linesData] = await Promise.all([
        getIssues(),
        getProductionLines(),
      ]);
      setIssues(issuesData);
      setProductionLines(linesData);
      setLoading(false);
    }
    fetchData();
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

  if (loading) {
    return (
      <AppLayout>
        <main className="flex flex-1 items-center justify-center">
            <LoaderCircle className="h-8 w-8 animate-spin" />
        </main>
      </AppLayout>
    );
  }
  
  // --- Chart Data Processing ---

  // 1. Issues Trend (last 30 days)
  const thirtyDaysAgo = subDays(new Date(), 29);
  const dateRange = eachDayOfInterval({ start: thirtyDaysAgo, end: new Date() });
  
  const issuesByDay = dateRange.map(date => {
    const formattedDate = format(date, 'MMM d');
    const dayStart = startOfDay(date);
    const issuesCount = issues.filter(issue => startOfDay(issue.reportedAt).getTime() === dayStart.getTime()).length;
    return { date: formattedDate, issues: issuesCount };
  });

  // 2. Issues by Category (Pie Chart)
  const issuesByCategory = allCategories.map(category => {
      const count = issues.filter(issue => issue.category === category.id).length;
      return { name: category.label, value: count, fill: category.color };
  });
  const totalIssues = issues.length;
  const issuesByCategoryWithPercentage = issuesByCategory.map(cat => ({
      ...cat,
      percentage: totalIssues > 0 ? (cat.value / totalIssues) * 100 : 0,
  })).filter(cat => cat.value > 0);

  // 3. Issues by Production Line (Bar Chart)
  const issuesByLine = productionLines.map(line => ({
      name: line.name,
      value: issues.filter(issue => issue.productionLineId === line.id).length,
  }));
  
  // --- Stat Cards Data ---
  const resolvedIssues = issues.filter(i => i.status === 'resolved' && i.resolvedAt);
  const totalResolutionTime = resolvedIssues.reduce((acc, i) => {
    return acc + (i.resolvedAt!.getTime() - i.reportedAt.getTime());
  }, 0);
  const avgResolutionMs = resolvedIssues.length > 0 ? totalResolutionTime / resolvedIssues.length : 0;
  const avgResolutionHours = (avgResolutionMs / (1000 * 60 * 60)).toFixed(1);

  const stats = {
    totalIssues: issues.length,
    openIssues: issues.filter(i => i.status === 'in_progress' || i.status === 'reported').length,
    avgResolutionTime: `${avgResolutionHours}h`,
    criticalIssues: issues.filter(i => i.priority === 'critical').length,
  };

  return (
    <AppLayout>
      <main className="flex flex-1 flex-col gap-4 p-4 lg:gap-6 lg:p-6 bg-background">
        <div className="flex items-center justify-between">
          <h1 className="text-lg font-semibold md:text-2xl">Reports</h1>
        </div>
        
        <StatsCards stats={[
          { title: "Total Issues", value: stats.totalIssues.toString(), change: "", changeType: "increase", description: "All time" },
          { title: "Open Issues", value: stats.openIssues.toString(), change: "", changeType: "increase", description: "Currently active" },
          { title: "Avg. Resolution Time", value: stats.avgResolutionTime, change: "", changeType: "decrease", description: "All resolved issues" },
          { title: "Critical Issues", value: stats.criticalIssues.toString(), change: "", changeType: "increase", description: "All time" },
        ]} />

        <div className="grid gap-6 md:grid-cols-2">
            <Card>
                <CardHeader>
                    <CardTitle>Issues Trend (Last 30 Days)</CardTitle>
                </CardHeader>
                <CardContent>
                    <IssuesTrendChart data={issuesByDay} />
                </CardContent>
            </Card>
            <Card>
                <CardHeader>
                    <CardTitle>Issues by Category</CardTitle>
                </CardHeader>
                <CardContent>
                    <PieChartWithPercentages data={issuesByCategoryWithPercentage} />
                </CardContent>
            </Card>
        </div>
        <Card>
            <CardHeader>
                <CardTitle>Issues by Production Line</CardTitle>
            </CardHeader>
            <CardContent>
                <FilteredBarChart data={issuesByLine} />
            </CardContent>
        </Card>
      </main>
    </AppLayout>
  );
}
