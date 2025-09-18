
"use client";

import { useState } from "react";
import { IssuesDataTable } from "@/components/dashboard/issues-data-table";
import { ReportIssueDialog } from "@/components/dashboard/report-issue-dialog";
import { StatsCards } from "@/components/dashboard/stats-cards";
import { AppLayout } from "@/components/layout/app-layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { issues, productionLines, users } from "@/lib/data";
import { PlusCircle, LoaderCircle } from "lucide-react";
import type { ProductionLine } from "@/lib/types";
import { subHours, addHours } from "date-fns";

export default function Home() {
  const currentUser = users.current;
  const [selectedLineId, setSelectedLineId] = useState<string | undefined>(undefined);
  const [selectedWorkstation, setSelectedWorkstation] = useState<string | undefined>();
  const [selectionConfirmed, setSelectionConfirmed] = useState(false);


  const handleLineChange = (lineId: string) => {
    setSelectedLineId(lineId);
    setSelectedWorkstation(undefined); // Reset workstation when line changes
  };

  const confirmSelection = () => {
    if (selectedLineId && selectedWorkstation) {
        setSelectionConfirmed(true);
    }
  }

  const changeSelection = () => {
    setSelectionConfirmed(false);
    setSelectedLineId(undefined);
    setSelectedWorkstation(undefined);
  }

  const selectedLine: ProductionLine | undefined = productionLines.find(
    (line) => line.id === selectedLineId
  );
  
  const now = new Date();
  const twentyFourHoursAgo = subHours(now, 24);
  const userIssues =
    currentUser?.role === "admin"
      ? issues
      : issues.filter((issue) => 
          issue.productionLineId === selectedLineId && 
          issue.reportedAt > twentyFourHoursAgo &&
          (issue.status === 'reported' || issue.status === 'in_progress' || issue.status === 'resolved')
        );
  
  const stats = {
    openIssues: issues.filter(issue => issue.status === 'in_progress' || issue.status === 'reported').length,
    avgResolutionTime: '3.2 hours',
    lineUptime: '98.7%',
    criticalAlerts: issues.filter(issue => issue.priority === 'critical' && issue.reportedAt > twentyFourHoursAgo).length,
  };

  return (
    <AppLayout>
      <main className="flex flex-1 flex-col gap-4 p-4 lg:gap-6 lg:p-6 bg-background">
        <div className="flex items-center justify-between">
          <h1 className="text-lg font-semibold md:text-2xl">{currentUser?.role === 'admin' ? 'Dashboard' : 'Line Status'}</h1>
        </div>
        
        {!currentUser ? (
             <div className="flex flex-1 items-center justify-center">
                <LoaderCircle className="h-8 w-8 animate-spin text-muted-foreground" />
             </div>
        ) : currentUser.role === 'admin' ? (
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
        ) : (
          <div className="flex flex-col gap-4">
            {!selectionConfirmed ? (
                 <Card>
                 <CardHeader>
                   <CardTitle>Select Your Workstation</CardTitle>
                   <CardDescription>Choose the production line and workstation you are currently at.</CardDescription>
                 </CardHeader>
                 <CardContent className="grid md:grid-cols-2 gap-4">
                   <div className="flex flex-col gap-2">
                     <Select onValueChange={handleLineChange} value={selectedLineId}>
                       <SelectTrigger>
                         <SelectValue placeholder="Select Production Line" />
                       </SelectTrigger>
                       <SelectContent>
                         {productionLines.map((line) => (
                           <SelectItem key={line.id} value={line.id}>
                             {line.name}
                           </SelectItem>
                         ))}
                       </SelectContent>
                     </Select>
                   </div>
                   <div className="flex flex-col gap-2">
                      <Select onValueChange={setSelectedWorkstation} value={selectedWorkstation} disabled={!selectedLine}>
                       <SelectTrigger>
                         <SelectValue placeholder="Select Workstation" />
                       </SelectTrigger>
                       <SelectContent>
                          {selectedLine?.workstations.map((station) => (
                            <SelectItem key={station} value={station}>
                              {station}
                            </SelectItem>
                          ))}
                       </SelectContent>
                     </Select>
                   </div>
                 </CardContent>
                 <CardFooter>
                    <Button onClick={confirmSelection} disabled={!selectedLineId || !selectedWorkstation}>Confirm Selection</Button>
                 </CardFooter>
               </Card>
            ) : (
                <div className="flex flex-col gap-4">
                    <Card>
                        <CardHeader>
                            <CardTitle>Current Station</CardTitle>
                        </CardHeader>
                        <CardContent className="flex items-center justify-between">
                            <div>
                                <p className="font-medium">{selectedLine?.name}</p>
                                <p className="text-sm text-muted-foreground">{selectedWorkstation}</p>
                            </div>
                            <Button variant="outline" onClick={changeSelection}>Change</Button>
                        </CardContent>
                    </Card>
                     <div className="flex items-center justify-end">
                        <ReportIssueDialog
                            key={`${selectedLineId}-${selectedWorkstation}`}
                            productionLines={productionLines}
                            selectedLineId={selectedLineId}
                            selectedWorkstation={selectedWorkstation}
                        >
                            <Button>
                                <PlusCircle className="mr-2 h-4 w-4" />
                                Report New Issue
                            </Button>
                        </ReportIssueDialog>
                    </div>
                    <IssuesDataTable issues={userIssues} />
                </div>
            )}
          </div>
        )}
      </main>
    </AppLayout>
  );
}
