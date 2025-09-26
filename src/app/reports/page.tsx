
"use client";

import { useEffect, useState } from "react";
import { AppLayout } from "@/components/layout/app-layout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import type { Issue, IssueCategory, ProductionLine } from "@/lib/types";
import { IssuesTrendChart } from "@/components/reports/issues-trend-chart";
import { format, subDays, eachDayOfInterval, startOfDay, differenceInSeconds } from "date-fns";
import { Calendar as CalendarIcon, LoaderCircle, ListFilter, Lock, Download } from "lucide-react";
import { PieChartWithPercentages } from "@/components/reports/pie-chart-with-percentages";
import { FilteredBarChart } from "@/components/reports/filtered-bar-chart";
import { useUser } from "@/contexts/user-context";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { DateRange } from "react-day-picker";
import Link from "next/link";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";
import { allCategories } from "@/lib/constants";
import { CSVLink } from "react-csv";
import { getIssues, getProductionLines } from "@/lib/data";

const ChartGradients = () => (
    <svg width="0" height="0" className="absolute">
        <defs>
            {allCategories.map(category => (
                <linearGradient key={category.id} id={`gradient-${category.id}`} x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={category.color} stopOpacity={0.8}/>
                    <stop offset="95%" stopColor={category.color} stopOpacity={0.4}/>
                </linearGradient>
            ))}
        </defs>
    </svg>
);


export default function ReportsPage() {
  const { currentUser } = useUser();
  
  const [issues, setIssues] = useState<Issue[]>([]);
  const [productionLines, setProductionLines] = useState<ProductionLine[]>([]);
  const [loading, setLoading] = useState(true);

  const [date, setDate] = useState<DateRange | undefined>({
    from: subDays(new Date(), 29),
    to: new Date(),
  });
  const [selectedLines, setSelectedLines] = useState<string[]>([]);
  const [tempSelectedLines, setTempSelectedLines] = useState<string[]>([]);
  
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      const [issuesData, linesData] = await Promise.all([getIssues(), getProductionLines()]);
      setIssues(issuesData);
      setProductionLines(linesData);
      setLoading(false);
    };
    fetchData();
  }, []);

  useEffect(() => {
    setTempSelectedLines(selectedLines);
  }, [selectedLines]);
  

  const handleLineFilterChange = (lineId: string) => {
    setTempSelectedLines((prev) =>
      prev.includes(lineId)
        ? prev.filter((id) => id !== lineId)
        : [...prev, lineId]
    );
  };
  

  const handleFilterConfirm = () => {
    setSelectedLines(tempSelectedLines);
  };
  
  const handleFilterReset = () => {
    setTempSelectedLines([]);
    setSelectedLines([]);
  };
  
  const handleDateChange = (newDate: DateRange | undefined) => {
      setDate(newDate);
  }

  const allIssues = issues || [];
  const allLines = productionLines || [];

  // --- Filtered Data ---
  const filteredIssues = allIssues.filter(issue => {
      const issueDate = issue.reportedAt;
      const isInDateRange = date?.from && date?.to && issueDate >= startOfDay(date.from) && issueDate <= date.to;
      const isLineSelected = selectedLines.length === 0 || selectedLines.includes(issue.productionLineId);
      return isInDateRange && isLineSelected;
  });

  const csvHeaders = [
    { label: "Issue ID", key: "id" },
    { label: "Title", key: "title" },
    { label: "Location", key: "location" },
    { label: "Production Line", key: "lineName" },
    { label: "Priority", key: "priority" },
    { label: "Status", key: "status" },
    { label: "Category", key: "category" },
    { label: "Sub-Category", key: "subCategory" },
    { label: "Reported At", key: "reportedAt" },
    { label: "Reported By", key: "reportedBy" },
    { label: "Resolved At", key: "resolvedAt" },
    { label: "Resolved By", key: "resolvedBy" },
    { label: "Resolution Notes", key: "resolutionNotes" },
    { label: "Production Stopped", key: "productionStopped" },
    { label: "Item Number", key: "itemNumber" },
    { label: "Quantity", key: "quantity" },
  ];

  const csvData = filteredIssues.map(issue => ({
    ...issue,
    lineName: allLines.find(line => line.id === issue.productionLineId)?.name || issue.productionLineId,
    reportedAt: format(issue.reportedAt, 'yyyy-MM-dd HH:mm:ss'),
    reportedBy: issue.reportedBy.name,
    resolvedAt: issue.resolvedAt ? format(issue.resolvedAt, 'yyyy-MM-dd HH:mm:ss') : 'N/A',
    resolvedBy: issue.resolvedBy ? issue.resolvedBy.name : 'N/A',
  }));

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
  
  // --- Feature Gate for Reports ---
  if (currentUser.plan === 'starter') {
    return (
      <AppLayout>
        <main className="flex flex-1 items-center justify-center">
          <Card className="w-full max-w-md text-center">
            <CardHeader>
              <CardTitle className="flex items-center justify-center gap-2">
                <Lock className="h-6 w-6" />
                Advanced Reporting Locked
              </CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>
                The reports and analytics features are not available on the Starter plan.
                Upgrade your plan to gain access to valuable insights.
              </CardDescription>
            </CardContent>
            <CardContent>
               <Button asChild>
                <Link href="/settings/account">Upgrade Plan</Link>
              </Button>
            </CardContent>
          </Card>
        </main>
      </AppLayout>
    )
  }
  
  

  // --- Chart Data Processing ---

  // 1. Issues Trend
  const dateRange = (date?.from && date?.to) ? eachDayOfInterval({ start: date.from, end: date.to }) : [];
  const issuesByDay = dateRange.map(day => {
    const formattedDate = format(day, 'MMM d');
    const dayStart = startOfDay(day);
    const issuesCount = filteredIssues.filter(issue => startOfDay(issue.reportedAt).getTime() === dayStart.getTime()).length;
    return { date: formattedDate, issues: issuesCount };
  });

  // 2. Issues by Category (Pie Chart & Bar Chart)
  const issuesByCategory = allCategories.map(category => {
      const count = filteredIssues.filter(issue => issue.category === category.id).length;
      return { name: category.label, value: count, fill: `url(#gradient-${category.id})`, color: category.color };
  }).filter(c => c.value > 0);
  
  const totalIssues = filteredIssues.length;
  const issuesByCategoryWithPercentage = issuesByCategory.map(cat => ({
      ...cat,
      percentage: totalIssues > 0 ? (cat.value / totalIssues) * 100 : 0,
  }));

  // 3. Issues by Production Line (Bar Chart)
  const issuesByLine = allLines.map((line, index) => {
    const category = allCategories[index % allCategories.length];
      return {
          name: line.name,
          value: filteredIssues.filter(issue => issue.productionLineId === line.id).length,
          fill: `url(#gradient-${category.id})`,
          color: category.color,
      }
  });
  
  // 4. Production Stop Time by Category
  const stoppedIssues = filteredIssues.filter(i => i.productionStopped);
  const stopTimeByCategory = allCategories.map(category => {
      const categoryIssues = stoppedIssues.filter(issue => issue.category === category.id);
      const totalSeconds = categoryIssues.reduce((acc, issue) => {
          const end = issue.resolvedAt || new Date();
          return acc + differenceInSeconds(end, issue.reportedAt);
      }, 0);
      const hours = totalSeconds / 3600;
      return { name: category.label, value: parseFloat(hours.toFixed(1)), fill: `url(#gradient-${category.id})`, color: category.color };
  }).filter(c => c.value > 0);

  return (
    <AppLayout>
      <main className="flex flex-1 flex-col gap-4 p-4 lg:gap-6 lg:p-6 bg-background">
        <ChartGradients />
        <div className="flex items-center justify-between">
          <h1 className="text-lg font-semibold md:text-2xl">Reports</h1>
        </div>
        
        <Card>
            <CardHeader className="flex-row items-center justify-between">
                <div>
                    <CardTitle>Filters & Export</CardTitle>
                    <CardDescription>Select filters to refine the reports and export the data.</CardDescription>
                </div>
                 <div className="flex items-center gap-2">
                    <Popover>
                        <PopoverTrigger asChild>
                        <Button
                            id="date"
                            variant={"outline"}
                            className={cn(
                                "w-[300px] justify-start text-left font-normal",
                                !date && "text-muted-foreground"
                            )}
                        >
                            <CalendarIcon className="mr-2 h-4 w-4" />
                            {date?.from ? (
                            date.to ? (
                                <>
                                {format(date.from, "LLL dd, y")} -{" "}
                                {format(date.to, "LLL dd, y")}
                                </>
                            ) : (
                                format(date.from, "LLL dd, y")
                            )
                            ) : (
                            <span>Pick a date</span>
                            )}
                        </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="end">
                        <Calendar
                            initialFocus
                            mode="range"
                            defaultMonth={date?.from}
                            selected={date}
                            onSelect={handleDateChange}
                            numberOfMonths={2}
                        />
                        </PopoverContent>
                    </Popover>
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                        <Button variant="outline" size="sm" className="gap-1">
                            <ListFilter className="h-4 w-4" />
                            <span className="sr-only sm:not-sr-only sm:whitespace-nowrap">
                            Lines
                            </span>
                        </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-56">
                        <DropdownMenuLabel>Filter by production line</DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        {allLines.map((line) => (
                            <DropdownMenuCheckboxItem
                            key={line.id}
                            checked={tempSelectedLines.includes(line.id)}
                            onCheckedChange={() => handleLineFilterChange(line.id)}
                            onSelect={(e) => e.preventDefault()}
                            >
                            {line.name}
                            </DropdownMenuCheckboxItem>
                        ))}
                        </DropdownMenuContent>
                    </DropdownMenu>

                    <div className="pl-2 border-l flex gap-2">
                        <Button variant="outline" size="sm" onClick={handleFilterReset}>Reset</Button>
                        <Button size="sm" onClick={handleFilterConfirm}>Apply</Button>
                    </div>

                     <Button asChild>
                        <CSVLink
                          data={csvData}
                          headers={csvHeaders}
                          filename={`andonpro_issues_export_${format(new Date(), 'yyyy-MM-dd')}.csv`}
                          className="flex items-center gap-2"
                        >
                            <Download className="h-4 w-4" />
                            Export Data as CSV
                        </CSVLink>
                    </Button>
                 </div>
            </CardHeader>
        </Card>

        <Tabs defaultValue="issues-by-category">
            <div className="flex justify-center">
                <TabsList className="grid w-full grid-cols-4 max-w-2xl">
                    <TabsTrigger value="issues-by-category">Issues by Category</TabsTrigger>
                    <TabsTrigger value="stops">Production Stops</TabsTrigger>
                    <TabsTrigger value="by-line">By Line</TabsTrigger>
                    <TabsTrigger value="trend">Trend</TabsTrigger>
                </TabsList>
            </div>
            <TabsContent value="issues-by-category" className="mt-4">
                 <Card>
                    <CardContent className="grid gap-6 md:grid-cols-2 p-6">
                        <div>
                            <h3 className="font-semibold mb-4 text-center">Volume by Category</h3>
                            <FilteredBarChart data={issuesByCategory} />
                        </div>
                         <div>
                            <h3 className="font-semibold mb-4 text-center">Issues by Category (%)</h3>
                            <PieChartWithPercentages data={issuesByCategoryWithPercentage} />
                        </div>
                    </CardContent>
                </Card>
            </TabsContent>
            <TabsContent value="stops" className="mt-4">
                <Card>
                    <CardHeader>
                        <CardTitle>Production Stop Time by Category (Hours)</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <FilteredBarChart data={stopTimeByCategory} />
                    </CardContent>
                </Card>
            </TabsContent>
            <TabsContent value="by-line" className="mt-4">
                <Card>
                    <CardHeader>
                        <CardTitle>Total Issues by Production Line</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <FilteredBarChart data={issuesByLine} />
                    </CardContent>
                </Card>
            </TabsContent>
            <TabsContent value="trend" className="mt-4">
                 <Card>
                    <CardHeader>
                        <CardTitle>Issues Trend</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <IssuesTrendChart data={issuesByDay} />
                    </CardContent>
                </Card>
            </TabsContent>
        </Tabs>

      </main>
    </AppLayout>
  );
}
