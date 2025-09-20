
"use client";

import { useState, useEffect } from "react";
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
import { getIssues, getProductionLines } from "@/lib/data";
import { PlusCircle, LoaderCircle } from "lucide-react";
import type { Issue, ProductionLine } from "@/lib/types";
import { subHours } from "date-fns";
import { useUser } from "@/contexts/user-context";

export default function LineStatusPage() {
  const { currentUser } = useUser();
  const [selectedLineId, setSelectedLineId] = useState<string | undefined>(undefined);
  const [selectedWorkstation, setSelectedWorkstation] = useState<string | undefined>();
  const [selectionConfirmed, setSelectionConfirmed] = useState(false);
  const [productionLines, setProductionLines] = useState<ProductionLine[]>([]);
  const [issues, setIssues] = useState<Issue[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
        setLoading(true);
        const [linesData, issuesData] = await Promise.all([
            getProductionLines(),
            getIssues()
        ]);
        setProductionLines(linesData);
        setIssues(issuesData);
        setLoading(false);
    }
    fetchData();
  }, []);

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
  const userIssues = issues.filter((issue) => 
      issue.productionLineId === selectedLineId && 
      issue.reportedAt > twentyFourHoursAgo &&
      (issue.status === 'reported' || issue.status === 'in_progress' || issue.status === 'resolved')
    );
  
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
        <div className="flex items-center justify-between">
          <h1 className="text-lg font-semibold md:text-2xl">Line Status</h1>
        </div>
        
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
                    <IssuesDataTable issues={userIssues} loading={loading} />
                </div>
            )}
        </div>
      </main>
    </AppLayout>
  );
}
