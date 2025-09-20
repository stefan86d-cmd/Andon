
"use client";

import React, { useState, useMemo } from 'react';
import { AppLayout } from "@/components/layout/app-layout";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  kpiData,
  issuesByDay,
  downtimeByCategory,
  productionLines,
} from "@/lib/data";
import { ResolutionTimeChart } from "@/components/reports/resolution-time-chart";
import { IssuesTrendChart } from "@/components/reports/issues-trend-chart";
import { DowntimeChart } from '@/components/reports/downtime-chart';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { IssueCategory } from '@/lib/types';


export default function ReportsPage() {
  const [timeRange, setTimeRange] = useState("7d");
  const [selectedLine, setSelectedLine] = useState("all");

  const filteredDowntimeData = useMemo(() => {
    if (selectedLine === 'all') {
      return downtimeByCategory[timeRange as keyof typeof downtimeByCategory];
    }
    return downtimeByCategory[timeRange as keyof typeof downtimeByCategory].map(item => ({
      ...item,
      // Just for demonstration, let's generate some random-ish data based on line
      // In a real app, this data would come from the backend based on the filter
      hours: parseFloat((item.hours * (1 - (parseInt(selectedLine.slice(-1), 10) / 10))).toFixed(2))
    }))

  }, [timeRange, selectedLine]);

  return (
    <AppLayout>
      <main className="flex flex-1 flex-col gap-4 p-4 lg:gap-6 lg:p-6 bg-background">
        <div className="flex items-center justify-between">
          <h1 className="text-lg font-semibold md:text-2xl">Reports</h1>
        </div>
        <Tabs defaultValue={timeRange} onValueChange={setTimeRange}>
          <div className="flex items-center justify-between">
            <TabsList className="grid w-full grid-cols-3 md:w-[400px]">
              <TabsTrigger value="7d">Last 7 Days</TabsTrigger>
              <TabsTrigger value="30d">Last 30 Days</TabsTrigger>
              <TabsTrigger value="all">All Time</TabsTrigger>
            </TabsList>
            <div className="flex items-center gap-4">
                <Select value={selectedLine} onValueChange={setSelectedLine}>
                  <SelectTrigger className="w-[200px]">
                    <SelectValue placeholder="Filter by Line" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Production Lines</SelectItem>
                    {productionLines.map(line => (
                      <SelectItem key={line.id} value={line.id}>
                        {line.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
            </div>
          </div>
          <TabsContent value="7d">
            <div className="grid gap-6 mt-4">
              <div className="grid md:grid-cols-2 gap-6">
                {kpiData.map((kpi) => (
                  <Card key={kpi.title}>
                    <CardHeader>
                      <CardTitle className="text-sm font-medium">{kpi.title}</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">{kpi.value}</div>
                      <p className="text-xs text-muted-foreground">{kpi.subtitle}</p>
                    </CardContent>
                  </Card>
                ))}
              </div>
              <div className="grid md:grid-cols-2 gap-6">
                 <Card>
                  <CardHeader>
                    <CardTitle>Downtime by Category</CardTitle>
                    <CardDescription>
                      Total production downtime (in hours) caused by each issue category.
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <DowntimeChart data={filteredDowntimeData} />
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader>
                    <CardTitle>Avg. Resolution Time by Category</CardTitle>
                    <CardDescription>
                      Average time (in hours) to resolve issues per category.
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ResolutionTimeChart data={downtimeByCategory['7d']} />
                  </CardContent>
                </Card>
              </div>
               <Card>
                  <CardHeader>
                    <CardTitle>Issues Reported</CardTitle>
                    <CardDescription>
                      Number of issues reported over the selected period.
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <IssuesTrendChart data={issuesByDay} />
                  </CardContent>
                </Card>
            </div>
          </TabsContent>
           <TabsContent value="30d">
            <div className="grid gap-6 mt-4">
               <p className="text-muted-foreground">Data for the last 30 days would be displayed here.</p>
            </div>
          </TabsContent>
           <TabsContent value="all">
            <div className="grid gap-6 mt-4">
               <p className="text-muted-foreground">Data for all time would be displayed here.</p>
            </div>
          </TabsContent>
        </Tabs>
      </main>
    </AppLayout>
  );
}
