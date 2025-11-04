
"use client";

import { useState, useEffect, useCallback } from "react";
import { IssuesDataTable } from "@/components/dashboard/issues-data-table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import type { Issue, ProductionLine, IssueCategory } from "@/lib/types";
import { ListFilter, LayoutGrid, Rows } from "lucide-react";
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
import { getClientIssues, getClientProductionLines } from "@/lib/data";
import { allCategories } from "@/lib/constants";
import { IssuesGrid } from "@/components/dashboard/issues-grid";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { useIsMobile } from "@/hooks/use-mobile";

export default function IssuesPage() {
  const { currentUser } = useUser();
  const isMobile = useIsMobile();
  const [issues, setIssues] = useState<Issue[]>([]);
  const [productionLines, setProductionLines] = useState<ProductionLine[]>([]);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState<'list' | 'grid'>();

  const [selectedLines, setSelectedLines] = useState<string[]>([]);
  const [tempSelectedLines, setTempSelectedLines] = useState<string[]>([]);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [tempSelectedCategories, setTempSelectedCategories] = useState<string[]>([]);

  useEffect(() => {
    if (isMobile) {
      setView('grid');
    } else {
      setView('list');
    }
  }, [isMobile]);

  const fetchData = useCallback(async (isInitialLoad = false) => {
      if (!currentUser?.orgId) return;
      if (isInitialLoad) {
        setLoading(true);
      }
      const [issuesData, linesData] = await Promise.all([
          getClientIssues(currentUser.orgId),
          getClientProductionLines(currentUser.orgId),
      ]);
      setIssues(issuesData);
      setProductionLines(linesData);
      
      if (isInitialLoad) {
        setLoading(false);
      }

      if (issuesData.length > 0) {
          const latestIssueTimestamp = new Date(issuesData[0].reportedAt).getTime();
          const lastSeen = localStorage.getItem('lastSeenIssueTimestamp');
          if (!lastSeen || latestIssueTimestamp > parseInt(lastSeen, 10)) {
              localStorage.setItem('lastSeenIssueTimestamp', latestIssueTimestamp.toString());
              window.dispatchEvent(new StorageEvent('storage', { key: 'lastSeenIssueTimestamp' }));
          }
      }
  }, [currentUser?.orgId]);

  useEffect(() => {
    if (!currentUser?.orgId) return;

    fetchData(true);

    const handleStorageChange = (event: StorageEvent) => {
        if (event.key === 'lastSeenIssueTimestamp') {
            fetchData(false);
        }
    };

    window.addEventListener('storage', handleStorageChange);
    const interval = setInterval(() => fetchData(false), 30000); 

    return () => {
        clearInterval(interval);
        window.removeEventListener('storage', handleStorageChange);
    };
  }, [currentUser?.orgId, fetchData]);

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

  const renderContent = (issues: Issue[], title: string, description: string) => {
    if (!view) return null; // Don't render until view is determined

    if (view === 'list') {
      return (
        <IssuesDataTable
          issues={issues}
          title={title}
          description={description}
          loading={loading}
          onIssueUpdate={() => fetchData(false)}
          productionLines={productionLines}
        />
      );
    }
    return (
      <IssuesGrid
        issues={issues}
        title={title}
        description={description}
        loading={loading}
        onIssueUpdate={() => fetchData(false)}
      />
    );
  };

  return (
    <main className="flex flex-1 flex-col gap-4 p-4 lg:gap-6 lg:p-6 bg-background">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-lg font-semibold md:text-2xl">Issue Tracker</h1>
        {view && <ToggleGroup type="single" value={view} onValueChange={(value) => value && setView(value as 'list' | 'grid')} aria-label="View mode">
            <ToggleGroupItem value="list" aria-label="List view">
                <Rows className="h-4 w-4" />
            </ToggleGroupItem>
            <ToggleGroupItem value="grid" aria-label="Grid view">
                <LayoutGrid className="h-4 w-4" />
            </ToggleGroupItem>
        </ToggleGroup>}
      </div>
      
      {currentUser?.role !== 'operator' && (
        <>
          <div className="flex justify-center mb-4">
              <div className="flex flex-col sm:flex-row items-center justify-center gap-2 sm:gap-4">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" size="sm" className="gap-1 w-full sm:w-auto">
                      <ListFilter className="h-4 w-4" />
                      <span className="sr-only sm:not-sr-only sm:whitespace-nowrap">
                        Lines
                      </span>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="center" className="w-56">
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
                    <Button variant="outline" size="sm" className="gap-1 w-full sm:w-auto">
                      <ListFilter className="h-4 w-4" />
                      <span className="sr-only sm:not-sr-only sm:whitespace-nowrap">
                        Category
                      </span>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="center" className="w-56">
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

                <div className="pl-0 sm:pl-2 flex gap-2">
                    <Button variant="outline" size="sm" onClick={handleFilterReset}>Reset</Button>
                    <Button size="sm" onClick={handleFilterConfirm}>Confirm</Button>
                </div>
              </div>
          </div>
          
          <Tabs defaultValue="active">
            <div className="flex justify-center mb-4">
              <TabsList className="grid w-full grid-cols-2 max-w-sm">
                <TabsTrigger value="active">Active</TabsTrigger>
                <TabsTrigger value="resolved">Resolved</TabsTrigger>
              </TabsList>
            </div>

            <TabsContent value="active">
              {renderContent(
                activeIssues,
                "Active Issues",
                "A list of recently reported issues on the production line."
              )}
            </TabsContent>
            <TabsContent value="resolved">
              {renderContent(
                resolvedIssues,
                "Resolved Issues",
                "A list of issues resolved in the last 24 hours."
              )}
            </TabsContent>
          </Tabs>
        </>
      )}
    </main>
  );
}
