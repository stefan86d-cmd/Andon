
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
import { PlusCircle } from "lucide-react";
import type { ProductionLine } from "@/lib/types";
import { subHours } from "date-fns";

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

  const twentyFourHoursAgo = subHours(new Date(), 24);
  const userIssues =
    currentUser.role === "admin"
      ? issues
      : issues.filter((issue) => 
          issue.productionLineId === selectedLineId && 
          issue.reportedAt > twentyFourHoursAgo &&
          (issue.status === 'reported' || issue.status === 'in_progress' || issue.status === 'resolved')
        );

  return (
    <AppLayout>
      <main className="flex flex-1 flex-col gap-4 p-4 lg:gap-6 lg:p-6 bg-background">
        <div className="flex items-center justify-between">
          <h1 className="text-lg font-semibold md:text-2xl">{currentUser.role === 'admin' ? 'Dashboard' : 'Line Status'}</h1>
        </div>
        
        {currentUser.role === 'admin' ? (
          <>
            <StatsCards stats={stats} />
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
                 <CardFooter className="justify-end">
                     <Button onClick={confirmSelection} disabled={!selectedLineId || !selectedWorkstation}>
                        Confirm Selection
                     </Button>
                 </CardFooter>
               </Card>
            ) : (
                <>
                 <Card>
                    <CardHeader>
                        <CardTitle>Current Location</CardTitle>
                        <CardDescription>You are currently working at:</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <p className="text-xl font-semibold">{selectedLine?.name} - {selectedWorkstation}</p>
                    </CardContent>
                    <CardFooter className="justify-between">
                        <Button variant="outline" onClick={changeSelection}>Change Location</Button>
                        <ReportIssueDialog
                            key={`${selectedLineId}-${selectedWorkstation}`}
                            productionLines={productionLines}
                            selectedLineId={selectedLineId}
                            selectedWorkstation={selectedWorkstation}
                        >
                            <Button className="gap-1">
                                <PlusCircle className="h-4 w-4" />
                                Report Issue
                            </Button>
                        </ReportIssueDialog>
                    </CardFooter>
                 </Card>
                 <IssuesDataTable issues={userIssues} title="Reported Issues" />
                </>
            )}
          </div>
        )}
        
      </main>
    </AppLayout>
  );
}
