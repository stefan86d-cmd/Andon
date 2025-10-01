
"use client";

import { useState, useEffect } from "react";
import { IssuesDataTable } from "@/components/dashboard/issues-data-table";
import { AppLayout } from "@/components/layout/app-layout";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import type { Issue, ProductionLine, IssueCategory } from "@/lib/types";
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
import { allCategories } from "@/lib/constants";

export default function IssuesPage() {
  const { currentUser } = useUser();
  const [issues, setIssues] = useState<Issue[]>([]);
  const [productionLines, setProductionLines] = useState<ProductionLine[]>([]);
  const [loading, setLoading] = useState(true);

  const [selectedLines, setSelectedLines] = useState<string[]>([]);
  const [tempSelectedLines, setTempSelectedLines] = useState<string[]>([]);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [tempSelectedCategories, setTempSelectedCategories] = useState<string[]>([]);

  useEffect(() => {
    if (!currentUser?.orgId) return;

    const fetchData = async () => {
        setLoading(true);
        const [issuesData, linesData] = await Promise.all([
            getIssues(currentUser.orgId!),
            getProductionLines(currentUser.orgId!),
        ]);
        setIssues(issuesData);
        setProductionLines(linesData);
        setLoading(false);

        if (issuesData.length > 0) {
            const latestIssueTimestamp = new Date(issuesData[0].reportedAt).getTime();
            const lastSeen = localStorage.getItem('lastSeenIssueTimestamp');
            if (!lastSeen || latestIssueTimestamp > parseInt(lastSeen, 10)) {
                localStorage.setItem('lastSeenIssueTimestamp', latestIssueTimestamp.toString());
                window.dispatchEvent(new StorageEvent('storage', { key: 'lastSeenIssueTimestamp' }));
            }
        }
    };
    fetchData();

    const handleStorageChange = (event: StorageEvent) => {
        if (event.key === 'lastSeenIssueTimestamp') {
            fetchData();
        }
    };

    window.addEventListener('storage', handleStorageChange);
    const interval = setInterval(fetchData, 30000); 

    return () => {
        clearInterval(interval);
        window.removeEventListener('storage', handleStorageChange);
    };
  }, [currentUser?.orgId]);

  useEffect(() => {
    setTempSelectedLines(selectedLines);
  }, [selectedLines]);
  
  useEffect(() => {
    setTempSelectedCategories(selectedCategories);
  }, [selectedCategories]);

  const handleLineFilterChange = (lineId: string) => {
    setTempSelectedLines((prev) =>
      prev.includes(lineId)
        ? prev.filter((id) => id !== lineId)
        : [...prev, lineId]
    );
  };
  
  const handleCategoryFilterChange = (categoryId: string) => {
    setTempSelectedCategories((prev) =>
      prev.includes(categoryId)
        ? prev.filter((id) => id !== categoryId)
        : [...prev, categoryId]
    );
  }

  const handleFilterConfirm = () => {
    setSelectedLines(tempSelectedLines);
    setSelectedCategories(tempSelectedCategories);
  };
  
  const handleFilterReset = () => {
    setTempSelectedLines([]);
    setSelectedLines([]);
    setTempSelectedCategories([]);
    setSelectedCategories([]);
  };

  const allIssues = issues || [];

  const filteredIssues = allIssues.filter(issue => {
    const lineMatch = selectedLines.length === 0 || selectedLines.includes(issue.productionLineId);
    const categoryMatch = selectedCategories.length === 0 || selectedCategories.includes(issue.category);
    return lineMatch && categoryMatch;
  });

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
            <h1 className="text-lg font-semibold md:text-2xl">Issue Tracker</h1>
          </div>
          
          {currentUser?.role !== 'operator' && (
            <div className="relative flex justify-center mb-4">
              <TabsList className="grid w-full grid-cols-2 max-w-sm">
                <TabsTrigger value="active">Active</TabsTrigger>
                <TabsTrigger value="resolved">Resolved</TabsTrigger>
              </TabsList>
              <div className="absolute right-0 flex gap-2">
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
                    {(productionLines || []).map((line) => (
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

                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" size="sm" className="gap-1">
                      <ListFilter className="h-4 w-4" />
                      <span className="sr-only sm:not-sr-only sm:whitespace-nowrap">
                        Category
                      </span>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-56">
                    <DropdownMenuLabel>Filter by category</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    {allCategories.map((category) => (
                      <DropdownMenuCheckboxItem
                        key={category.id}
                        checked={tempSelectedCategories.includes(category.id)}
                        onCheckedChange={() => handleCategoryFilterChange(category.id)}
                        onSelect={(e) => e.preventDefault()}
                      >
                        {category.label}
                      </DropdownMenuCheckboxItem>
                    ))}
                  </DropdownMenuContent>
                </DropdownMenu>

                <div className="pl-2 border-l">
                    <Button variant="outline" size="sm" onClick={handleFilterReset}>Reset</Button>
                </div>
                <div >
                    <Button size="sm" onClick={handleFilterConfirm}>Confirm</Button>
                </div>
              </div>
            </div>
          )}

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
