
"use client";

import { useEffect, useState } from "react";
import { AppLayout } from "@/components/layout/app-layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getIssues, getProductionLines } from "@/lib/data";
import type { Issue, IssueCategory, ProductionLine } from "@/lib/types";
import { IssuesTrendChart } from "@/components/reports/issues-trend-chart";
import { format, subDays, eachDayOfInterval, startOfDay, differenceInSeconds } from "date-fns";
import { Calendar as CalendarIcon, LoaderCircle, ListFilter } from "lucide-react";
import { PieChartWithPercentages } from "@/components/reports/pie-chart-with-percentages";
import { FilteredBarChart } from "@/components/reports/filtered-bar-chart";
import { useUser } from "@/contexts/user-context";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { DateRange } from "react-day-picker";
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

const allCategories: { id: IssueCategory; label: string; color: string }[] = [
    { id: 'it', label: 'IT & Network', color: '#3b82f6' }, // blue-500
    { id: 'logistics', label: 'Logistics', color: '#f97316' }, // orange-500
    { id: 'tool', label: 'Tool & Equipment', color: '#6b7280' }, // gray-500
    { id: 'quality', label: 'Quality', color: '#22c55e' }, // green-500
    { id: 'assistance', label: 'Need Assistance', color: '#ef4444' }, // red-500
    { id: 'other', label: 'Other', color: '#8b5cf6' }, // purple-500
];

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
  
  // --- Filtered Data ---
  const filteredIssues = issues.filter(issue => {
      const issueDate = issue.reportedAt;
      const isInDateRange = date?.from && date?.to && issueDate >= date.from && issueDate <= date.to;
      const isLineSelected = selectedLines.length === 0 || selectedLines.includes(issue.productionLineId);
      return isInDateRange && isLineSelected;
  });

  // --- Chart Data Processing ---

  // 1. Issues Trend
  const dateRange = (date?.from && date?.to) ? eachDayOfInterval({ start: date.from, end: date.to }) : [];
  const issuesByDay = dateRange.map(day => {
    const formattedDate = format(day, 'MMM d');
    const dayStart = startOfDay(day);
    const issuesCount = filteredIssues.filter(issue => startOfDay(issue.reportedAt).getTime() === dayStart.getTime()).length;
    return { date: formattedDate, issues: issuesCount };
  });

  // 2. Issues by Category (Pie Chart)
  const issuesByCategory = allCategories.map(category => {
      const count = filteredIssues.filter(issue => issue.category === category.id).length;
      return { name: category.label, value: count, fill: category.color };
  });
  const totalIssues = filteredIssues.length;
  const issuesByCategoryWithPercentage = issuesByCategory.map(cat => ({
      ...cat,
      percentage: totalIssues > 0 ? (cat.value / totalIssues) * 100 : 0,
  })).filter(cat => cat.value > 0);

  // 3. Issues by Production Line (Bar Chart)
  const issuesByLine = productionLines.map((line, index) => ({
      name: line.name,
      value: filteredIssues.filter(issue => issue.productionLineId === line.id).length,
      fill: allCategories[index % allCategories.length].color
  }));
  
  // 4. Production Stop Time by Category
  const stoppedIssues = filteredIssues.filter(i => i.productionStopped);
  const stopTimeByCategory = allCategories.map(category => {
      const categoryIssues = stoppedIssues.filter(issue => issue.category === category.id);
      const totalSeconds = categoryIssues.reduce((acc, issue) => {
          const end = issue.resolvedAt || new Date();
          return acc + differenceInSeconds(end, issue.reportedAt);
      }, 0);
      const hours = totalSeconds / 3600;
      return { name: category.label, value: parseFloat(hours.toFixed(1)), fill: category.color };
  }).filter(c => c.value > 0);

  return (
    <AppLayout>
      <main className="flex flex-1 flex-col gap-4 p-4 lg:gap-6 lg:p-6 bg-background">
        <div className="flex items-center justify-between">
          <h1 className="text-lg font-semibold md:text-2xl">Reports</h1>
        </div>
        
        <Card>
            <CardHeader className="flex-row items-center justify-between">
                <CardTitle>Filters</CardTitle>
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
                            onSelect={setDate}
                            numberOfMonths={2}
                        />
                        </PopoverContent>
                    </Popover>
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                        <Button variant="outline" size="sm" className="gap-1">
                            <ListFilter className="h-4 w-4" />
                            <span className="sr-only sm:not-sr-only sm:whitespace-nowrap">
                            Filter Lines
                            </span>
                        </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-56">
                        <DropdownMenuLabel>Filter by production line</DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        {productionLines.map((line) => (
                            <DropdownMenuCheckboxItem
                            key={line.id}
                            checked={tempSelectedLines.includes(line.id)}
                            onCheckedChange={() => handleLineFilterChange(line.id)}
                            onSelect={(e) => e.preventDefault()}
                            >
                            {line.name}
                            </DropdownMenuCheckboxItem>
                        ))}
                        <DropdownMenuSeparator />
                        <div className="p-2 flex justify-end gap-2">
                            <Button variant="outline" size="sm" onClick={handleFilterReset}>Reset</Button>
                            <DropdownMenuCheckboxItem onSelect={handleFilterConfirm} className="p-0">
                                <Button size="sm" className="w-full">Confirm</Button>
                            </DropdownMenuCheckboxItem>
                        </div>
                        </DropdownMenuContent>
                    </DropdownMenu>
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
                            <h3 className="font-semibold mb-4 text-center">Production Stop Time by Category (Hours)</h3>
                            <FilteredBarChart data={stopTimeByCategory} />
                        </div>
                         <div>
                            <h3 className="font-semibold mb-4 text-center">Issues by Category</h3>
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
