
"use client";

import { useState, useEffect } from "react";
import { IssuesDataTable } from "@/components/dashboard/issues-data-table";
import { AppLayout } from "@/components/layout/app-layout";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import type { Issue, ProductionLine } from "@/lib/types";
import { ListFilter } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { subHours } from "date-fns";
import { useUser } from "@/contexts/user-context";
import { getIssues, getProductionLines } from "@/lib/data";

export default function IssuesPage() {
  const { currentUser } = useUser();
  const [issues, setIssues] = useState<Issue[]>([]);
  const [productionLines, setProductionLines] = useState<ProductionLine[]>([]);
  const [selectedLines, setSelectedLines] = useState<string[]>([]);
  const [tempSelectedLines, setTempSelectedLines] = useState<string[]>([]);
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

  const filteredIssues =
    selectedLines.length > 0
      ? issues.filter((issue) => selectedLines.includes(issue.productionLineId))
      : issues;

  const activeIssues: Issue[] = filteredIssues.filter(
    (issue) => issue.status === "reported" || issue.status === "in_progress"
  );
  
  const twentyFourHoursAgo = subHours(new Date(), 24);
  const resolvedIssues: Issue[] = filteredIssues.filter(
    (issue) => issue.status === "resolved" && issue.resolvedAt && issue.resolvedAt > twentyFourHoursAgo
  );

  return (
    <AppLayout>
      <main className="flex flex-1 flex-col gap-4 p-4 lg:gap-6 lg:p-6 bg-background">
        <Tabs defaultValue="active">
          <div className="flex items-center justify-between mb-4">
             <div>
                <h1 className="text-lg font-semibold md:text-2xl">Issue Tracker</h1>
            </div>
            {currentUser?.role !== 'operator' && (
              <div className="flex items-center gap-2">
                <TabsList>
                  <TabsTrigger value="active">Active</TabsTrigger>
                  <TabsTrigger value="resolved">Resolved (24h)</TabsTrigger>
                </TabsList>
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
            )}
          </div>
          <TabsContent value="active">
            <IssuesDataTable
              issues={activeIssues}
              title="Active Issues"
              description="A list of recently reported issues on the production line."
              loading={loading}
            />
          </TabsContent>
          <TabsContent value="resolved">
            <IssuesDataTable
              issues={resolvedIssues}
              title="Resolved Issues"
              description="A list of issues resolved in the last 24 hours."
              loading={loading}
            />
          </TabsContent>
        </Tabs>
      </main>
    </AppLayout>
  );
}
