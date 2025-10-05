
"use client";

import { useState, useEffect, useCallback } from "react";
import { IssuesDataTable } from "@/components/dashboard/issues-data-table";
import { ReportIssueDialog } from "@/components/dashboard/report-issue-dialog";
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
import { PlusCircle, LoaderCircle } from "lucide-react";
import type { Issue, ProductionLine } from "@/lib/types";
import { subHours } from "date-fns";
import { useUser } from "@/contexts/user-context";
import { getClientProductionLines, getClientIssues } from "@/lib/data";

export default function LineStatusPage() {
  const { currentUser } = useUser();
  const [selectedLineId, setSelectedLineId] = useState<string | undefined>(undefined);
  const [selectedWorkstation, setSelectedWorkstation] = useState<string | undefined>();
  const [selectionConfirmed, setSelectionConfirmed] = useState(false);
  const [productionLines, setProductionLines] = useState<ProductionLine[]>([]);
  const [issues, setIssues] = useState<Issue[]>([]);
  const [linesLoading, setLinesLoading] = useState(true);
  const [issuesLoading, setIssuesLoading] = useState(false);

  useEffect(() => {
    if (!currentUser?.orgId) return;
    const fetchLines = async () => {
      setLinesLoading(true);
      const linesData = await getClientProductionLines(currentUser.orgId!);
      setProductionLines(linesData);
      setLinesLoading(false);
    };
    fetchLines();
  }, [currentUser?.orgId]);

  const allLines = productionLines || [];
  const selectedLine: ProductionLine | undefined = allLines.find(
    (line) => line.id === selectedLineId
  );
  
  const fetchIssuesForStation = useCallback(async () => {
    if (selectedLineId && selectedWorkstation && selectedLine && currentUser?.orgId) {
        setIssuesLoading(true);
        const allIssues = await getClientIssues(currentUser.orgId);
        const twentyFourHoursAgo = subHours(new Date(), 24);
        const fullWorkstationName = `${selectedLine.name} - ${selectedWorkstation}`;
        
        const filteredIssues = allIssues.filter(
          (issue) =>
            issue.productionLineId === selectedLineId &&
            issue.location === fullWorkstationName &&
            issue.reportedAt >= twentyFourHoursAgo
        );
        setIssues(filteredIssues.sort((a, b) => b.reportedAt.getTime() - a.reportedAt.getTime()));
        setIssuesLoading(false);
    }
  }, [selectedLineId, selectedWorkstation, selectedLine, currentUser?.orgId]);


  useEffect(() => {
    if (selectionConfirmed) {
      fetchIssuesForStation();
    }
  }, [selectionConfirmed, fetchIssuesForStation]);

  const loading = linesLoading;

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
  
  const userIssues = issues || [];
  
  if (!currentUser || loading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <LoaderCircle className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <AppLayout>
      <main className="flex flex-1 flex-col gap-4 p-4 lg:gap-6 lg:p-6 bg-background">
        
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
                     {allLines.map((line) => (
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
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-lg font-semibold md:text-2xl">{selectedLine?.name}</h1>
                        <p className="text-sm text-muted-foreground">{selectedWorkstation}</p>
                    </div>
                    <div className="flex items-center gap-2">
                        <Button variant="outline" onClick={changeSelection}>Change Station</Button>
                        <ReportIssueDialog
                            key={`${selectedLineId}-${selectedWorkstation}`}
                            productionLines={allLines}
                            selectedLineId={selectedLineId}
                            selectedWorkstation={selectedWorkstation}
                            onIssueReported={fetchIssuesForStation}
                        >
                            <Button>
                                <PlusCircle className="mr-2 h-4 w-4" />
                                Report Issue
                            </Button>
                        </ReportIssueDialog>
                    </div>
                </div>
                <IssuesDataTable 
                    issues={userIssues} 
                    loading={issuesLoading}
                    title="Recent Issues at Your Station"
                    description="Issues reported on this workstation in the last 24 hours." 
                />
            </div>
        )}
      </main>
    </AppLayout>
  );
}
