
"use client";

import React, { useState, useMemo, useEffect } from 'react';
import { AppLayout } from "@/components/layout/app-layout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { getIssues, getProductionLines } from "@/lib/data";
import { IssuesTrendChart } from "@/components/reports/issues-trend-chart";
import { Button } from "@/components/ui/button";
import { Calendar as CalendarIcon, Filter, Power, Factory, Grip, LoaderCircle } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { format, startOfWeek, endOfWeek, startOfDay, endOfDay, differenceInHours, max } from 'date-fns';
import type { DateRange } from "react-day-picker";
import { cn } from "@/lib/utils";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Switch } from '@/components/ui/switch';
import type { Issue, IssueCategory, ProductionLine } from '@/lib/types';
import { FilteredBarChart } from '@/components/reports/filtered-bar-chart';

const allCategories: { id: IssueCategory, label: string }[] = [
    { id: 'it', label: 'IT & Network' },
    { id: 'logistics', label: 'Logistics' },
    { id: 'tool', label: 'Tool & Equipment' },
    { id: 'assistance', label: 'Assistance' },
    { id: 'quality', label: 'Quality' },
    { id: 'other', label: 'Other' },
];

function aggregateIssuesByDate(filteredIssues: Issue[]): { date: string; issues: number }[] {
    const issuesByDate: Record<string, number> = {};
    filteredIssues.forEach(issue => {
        const date = format(issue.reportedAt, 'yyyy-MM-dd');
        if (!issuesByDate[date]) {
            issuesByDate[date] = 0;
        }
        issuesByDate[date]++;
    });

    return Object.entries(issuesByDate)
        .map(([date, count]) => ({ date, issues: count }))
        .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
}

function aggregateBy(filteredIssues: Issue[], key: 'category' | 'productionLineId', productionLines: ProductionLine[]) {
    const counts: Record<string, number> = {};
    
    let nameMap: Record<string, string> = {};
    if (key === 'productionLineId') {
        nameMap = productionLines.reduce((acc, line) => {
            acc[line.id] = line.name;
            return acc;
        }, {} as Record<string, string>);
    } else {
        nameMap = allCategories.reduce((acc, cat) => {
            acc[cat.id] = cat.label;
            return acc;
        }, {} as Record<string, string>);
    }

    filteredIssues.forEach(issue => {
        const value = issue[key];
        if (value) {
            if (!counts[value]) {
                counts[value] = 0;
            }
            counts[value]++;
        }
    });

    return Object.entries(counts).map(([name, value]) => ({
        name: nameMap[name] || name,
        value,
    })).sort((a, b) => b.value - a.value);
}

function aggregateDowntimeByCategory(filteredIssues: Issue[]) {
    const downtime: Record<string, number> = {};
    const categoryNameMap = allCategories.reduce((acc, cat) => {
        acc[cat.id] = cat.label;
        return acc;
    }, {} as Record<string, string>);

    const stoppedIssues = filteredIssues.filter(
        issue => issue.productionStopped && issue.status === 'resolved' && issue.resolvedAt
    );
    
    // Group issues by production line
    const issuesByLine: Record<string, Issue[]> = stoppedIssues.reduce((acc, issue) => {
        const lineId = issue.productionLineId;
        if (!acc[lineId]) {
          acc[lineId] = [];
        }
        acc[lineId].push(issue);
        return acc;
    }, {} as Record<string, Issue[]>);

    // Calculate merged downtime for each line and attribute it to categories
    for (const lineId in issuesByLine) {
        const lineIssues = issuesByLine[lineId];
        if (lineIssues.length === 0) continue;

        const intervals = lineIssues.map(issue => ({
          start: issue.reportedAt,
          end: issue.resolvedAt!,
          category: issue.category,
          duration: differenceInHours(issue.resolvedAt!, issue.reportedAt)
        })).sort((a, b) => a.start.getTime() - b.start.getTime());

        const mergedIntervals: {start: Date, end: Date, issues: Issue[]}[] = [];
        for(const currentIssue of lineIssues) {
            const currentStart = currentIssue.reportedAt;
            const currentEnd = currentIssue.resolvedAt!;

            let merged = false;
            for(const mergedInterval of mergedIntervals) {
                if (currentStart < mergedInterval.end && currentEnd > mergedInterval.start) {
                    mergedInterval.start = new Date(Math.min(mergedInterval.start.getTime(), currentStart.getTime()));
                    mergedInterval.end = new Date(Math.max(mergedInterval.end.getTime(), currentEnd.getTime()));
                    mergedInterval.issues.push(currentIssue);
                    merged = true;
                    break;
                }
            }
            if(!merged) {
                mergedIntervals.push({
                    start: currentStart,
                    end: currentEnd,
                    issues: [currentIssue]
                });
            }
        }

        for (const mergedInterval of mergedIntervals) {
            const totalDuration = differenceInHours(mergedInterval.end, mergedInterval.start);
            const totalWeight = mergedInterval.issues.reduce((sum, issue) => sum + differenceInHours(issue.resolvedAt!, issue.reportedAt), 0);

            if (totalWeight > 0) {
                for(const issue of mergedInterval.issues) {
                    const issueDuration = differenceInHours(issue.resolvedAt!, issue.reportedAt);
                    const weightedContribution = (issueDuration / totalWeight) * totalDuration;
                    
                    if (!downtime[issue.category]) {
                        downtime[issue.category] = 0;
                    }
                    downtime[issue.category] += weightedContribution;
                }
            }
        }
    }

    return Object.entries(downtime).map(([category, hours]) => ({
        name: categoryNameMap[category] || category,
        value: parseFloat(hours.toFixed(1)), // Keep one decimal place
    })).sort((a, b) => b.value - a.value);
}


export default function ReportsPage() {
    const [issues, setIssues] = useState<Issue[]>([]);
    const [productionLines, setProductionLines] = useState<ProductionLine[]>([]);
    const [loading, setLoading] = useState(true);

    const [dateRange, setDateRange] = React.useState<DateRange | undefined>({
        from: startOfWeek(new Date()),
        to: endOfWeek(new Date()),
    });
    const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
    const [selectedLines, setSelectedLines] = useState<string[]>([]);
    const [productionStopped, setProductionStopped] = useState<boolean>(false);

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

    const filteredIssues = useMemo(() => {
        return issues.filter(issue => {
            const issueDate = issue.reportedAt;
            const from = dateRange?.from ? startOfDay(dateRange.from) : null;
            const to = dateRange?.to ? endOfDay(dateRange.to) : null;

            if (from && issueDate < from) return false;
            if (to && issueDate > to) return false;
            if (selectedCategories.length > 0 && !selectedCategories.includes(issue.category)) return false;
            if (selectedLines.length > 0 && !selectedLines.includes(issue.productionLineId)) return false;
            if (productionStopped && !issue.productionStopped) return false;
            
            return true;
        });
    }, [issues, dateRange, selectedCategories, selectedLines, productionStopped]);

    const issuesByDay = useMemo(() => aggregateIssuesByDate(filteredIssues), [filteredIssues]);
    const issuesByCategory = useMemo(() => aggregateBy(filteredIssues, 'category', productionLines), [filteredIssues, productionLines]);
    const issuesByLine = useMemo(() => aggregateBy(filteredIssues, 'productionLineId', productionLines), [filteredIssues, productionLines]);
    const downtimeByCategory = useMemo(() => aggregateDowntimeByCategory(filteredIssues), [filteredIssues]);

    const resetFilters = () => {
        setDateRange({ from: startOfWeek(new Date()), to: endOfWeek(new Date()) });
        setSelectedCategories([]);
        setSelectedLines([]);
        setProductionStopped(false);
    }

    if (loading) {
        return (
            <AppLayout>
                 <main className="flex flex-1 flex-col gap-4 p-4 lg:gap-6 lg:p-6 bg-background">
                    <div className="flex items-center justify-center h-full">
                        <LoaderCircle className="h-8 w-8 animate-spin" />
                    </div>
                </main>
            </AppLayout>
        )
    }
  
  return (
    <AppLayout>
      <main className="flex flex-1 flex-col gap-4 p-4 lg:gap-6 lg:p-6 bg-background">
        <div className="flex items-center justify-between">
          <h1 className="text-lg font-semibold md:text-2xl">Reports</h1>
          <Button onClick={resetFilters} variant="outline" size="sm">
            <Filter className="mr-2 h-4 w-4" /> Reset Filters
          </Button>
        </div>
        
        <Card>
            <CardHeader>
                <CardTitle>Filters</CardTitle>
                <CardDescription>Refine the data shown in the reports below.</CardDescription>
            </CardHeader>
            <CardContent>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
                     <div className="grid gap-2">
                        <Popover>
                            <PopoverTrigger asChild>
                            <Button
                                id="date"
                                variant={"outline"}
                                className={cn(
                                "justify-start text-left font-normal",
                                !dateRange && "text-muted-foreground"
                                )}
                            >
                                <CalendarIcon className="mr-2 h-4 w-4" />
                                {dateRange?.from ? (
                                dateRange.to ? (
                                    <>
                                    {format(dateRange.from, "LLL dd, y")} -{" "}
                                    {format(dateRange.to, "LLL dd, y")}
                                    </>
                                ) : (
                                    format(dateRange.from, "LLL dd, y")
                                )
                                ) : (
                                <span>Pick a date</span>
                                )}
                            </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-auto p-0" align="start">
                            <Calendar
                                initialFocus
                                mode="range"
                                defaultMonth={dateRange?.from}
                                selected={dateRange}
                                onSelect={setDateRange}
                                numberOfMonths={2}
                            />
                            </PopoverContent>
                        </Popover>
                     </div>
                     <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                        <Button variant="outline" className="justify-start text-left font-normal">
                            <Grip className="mr-2 h-4 w-4" />
                            {selectedCategories.length > 0 ? `${selectedCategories.length} categories selected` : 'Filter by Category'}
                        </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent className="w-56">
                        <DropdownMenuLabel>Issue Category</DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        {allCategories.map((category) => (
                            <DropdownMenuCheckboxItem
                                key={category.id}
                                checked={selectedCategories.includes(category.id)}
                                onCheckedChange={(checked) => {
                                    setSelectedCategories(prev => checked ? [...prev, category.id] : prev.filter(id => id !== category.id))
                                }}
                            >
                            {category.label}
                            </DropdownMenuCheckboxItem>
                        ))}
                        </DropdownMenuContent>
                    </DropdownMenu>
                     <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                        <Button variant="outline" className="justify-start text-left font-normal">
                           <Factory className="mr-2 h-4 w-4" />
                           {selectedLines.length > 0 ? `${selectedLines.length} lines selected` : 'Filter by Line'}
                        </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent className="w-56">
                        <DropdownMenuLabel>Production Line</DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        {productionLines.map((line) => (
                            <DropdownMenuCheckboxItem
                                key={line.id}
                                checked={selectedLines.includes(line.id)}
                                onCheckedChange={(checked) => {
                                    setSelectedLines(prev => checked ? [...prev, line.id] : prev.filter(id => id !== line.id))
                                }}
                            >
                            {line.name}
                            </DropdownMenuCheckboxItem>
                        ))}
                        </DropdownMenuContent>
                    </DropdownMenu>
                     <div className="flex items-center space-x-2 justify-between rounded-md border p-3">
                        <div className="flex items-center space-x-2">
                             <Power className="h-4 w-4" />
                            <label htmlFor="production-stop" className="text-sm font-medium leading-none">
                                Production Stop
                            </label>
                        </div>
                        <Switch
                            id="production-stop"
                            checked={productionStopped}
                            onCheckedChange={setProductionStopped}
                        />
                    </div>
                </div>
            </CardContent>
        </Card>

        <div className="grid gap-6 mt-4">
             <Card>
                <CardHeader>
                    <CardTitle>Issues Over Time</CardTitle>
                    <CardDescription>
                        Number of issues reported per day based on the selected filters.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <IssuesTrendChart data={issuesByDay} />
                </CardContent>
            </Card>
            <div className="grid md:grid-cols-2 gap-6">
                 <Card>
                  <CardHeader>
                    <CardTitle>Issues by Category</CardTitle>
                    <CardDescription>
                      Total issues broken down by category.
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <FilteredBarChart data={issuesByCategory} />
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader>
                    <CardTitle>Issues by Production Line</CardTitle>
                    <CardDescription>
                        Total issues broken down by production line.
                    </CardDescription>
                  </Header>
                  <CardContent>
                    <FilteredBarChart data={issuesByLine} />
                  </CardContent>
                </Card>
            </div>
            <Card>
                <CardHeader>
                    <CardTitle>Downtime by Category (Hours)</CardTitle>
                    <CardDescription>
                        Total production stop time in hours, by issue category. This chart correctly handles overlapping downtime on the same line.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <FilteredBarChart data={downtimeByCategory} />
                </CardContent>
            </Card>
        </div>
      </main>
    </AppLayout>
  );
}
