
"use client";

import { useState, useEffect, useCallback } from "react";
import { IssuesDataTable } from "@/components/dashboard/issues-data-table";
import { ReportIssueDialog } from "@/components/dashboard/report-issue-dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { PlusCircle, LoaderCircle, LayoutGrid, Rows } from "lucide-react";
import type { Issue, ProductionLine } from "@/lib/types";
import { subHours } from "date-fns";
import { useUser } from "@/contexts/user-context";
import { getClientProductionLines, getClientIssues } from "@/lib/data";
import { useIsMobile } from "@/hooks/use-mobile";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { IssuesGrid } from "@/components/dashboard/issues-grid";

export default function LineStatusPage() {
  const { currentUser } = useUser();
  const isMobile = useIsMobile();
  const [selectedLineId, setSelectedLineId] = useState<string | undefined>(undefined);
  const [selectedWorkstation, setSelectedWorkstation] = useState<string | undefined>();
  const [selectionConfirmed, setSelectionConfirmed] = useState(false);
  const [productionLines, setProductionLines] = useState<ProductionLine[]>([]);
  const [issues, setIssues] = useState<Issue[]>([]);
  const [linesLoading, setLinesLoading] = useState(true);
  const [issuesLoading, setIssuesLoading] = useState(false);
  const [view, setView] = useState<'list' | 'grid'>();

  useEffect(() => {
    if (isMobile) {
      setView('grid');
    } else {
      setView('list');
    }
  }, [isMobile]);

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
  
  const fetchIssuesForStation = useCallback(async (isInitialLoad = false) => {
    if (selectedLineId && selectedWorkstation && selectedLine && currentUser?.orgId) {
        if (isInitialLoad) {
          setIssuesLoading(true);
        }
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
        
        if (isInitialLoad) {
          setIssuesLoading(false);
        }
    }
  }, [selectedLineId, selectedWorkstation, selectedLine, currentUser?.orgId]);


  useEffect(() => {
    if (selectionConfirmed) {
      fetchIssuesForStation(true);
      const interval = setInterval(() => fetchIssuesForStation(false), 10000);
      return () => clearInterval(interval);
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

  const renderContent = () => {
    if (!view) return null; // Don't render until view is determined

    const title = "Recent Issues at Your Station";
    const description = "Issues reported on this workstation in the last 24 hours.";

    if (view === 'grid') {
        return (
            <IssuesGrid 
                issues={userIssues}
                loading={issuesLoading}
                title={title}
                description={description}
                onIssueUpdate={() => fetchIssuesForStation(false)}
            />
        );
    }
    
    return (
        <IssuesDataTable 
            issues={userIssues} 
            loading={issuesLoading}
            title={title}
            description={description} 
            onIssueUpdate={() => fetchIssuesForStation(false)}
            productionLines={productionLines}
        />
    );
  };
  
  if (!currentUser || loading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <LoaderCircle className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
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
                  <div className="flex items-center gap-2 w-full sm:w-auto">
                      <Button variant="outline" onClick={changeSelection} className="flex-1 sm:flex-initial">Change Station</Button>
                      <ReportIssueDialog
                          key={`${selectedLineId}-${selectedWorkstation}`}
                          productionLines={allLines}
                          selectedLineId={selectedLineId}
                          selectedWorkstation={selectedWorkstation}
                          onIssueReported={() => fetchIssuesForStation(false)}
                      >
                          <Button className="flex-1 sm:flex-initial">
                              <PlusCircle className="mr-2 h-4 w-4" />
                              Report Issue
                          </Button>
                      </ReportIssueDialog>
                  </div>
              </div>
              <div className="flex items-center justify-end">
                {view && !issuesLoading && (
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
              {renderContent()}
          </div>
      )}
    </main>
  );
}
