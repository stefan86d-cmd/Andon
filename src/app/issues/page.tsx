
"use client";

import { useState } from "react";
import { IssuesDataTable } from "@/components/dashboard/issues-data-table";
import { AppLayout } from "@/components/layout/app-layout";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { issues, productionLines, users } from "@/lib/data";
import type { Issue } from "@/lib/types";
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

export default function IssuesPage() {
  const currentUser = users.current;
  const [selectedLines, setSelectedLines] = useState<string[]>([]);

  const handleLineFilterChange = (lineId: string) => {
    setSelectedLines((prev) =>
      prev.includes(lineId)
        ? prev.filter((id) => id !== lineId)
        : [...prev, lineId]
    );
  };

  const filteredIssues =
    selectedLines.length > 0
      ? issues.filter((issue) => selectedLines.includes(issue.productionLineId))
      : issues;

  const activeIssues: Issue[] = filteredIssues.filter(
    (issue) => issue.status === "reported" || issue.status === "in_progress"
  );
  const resolvedIssues: Issue[] = filteredIssues.filter(
    (issue) => issue.status === "resolved"
  );

  return (
    <AppLayout>
      <main className="flex flex-1 flex-col gap-4 p-4 lg:gap-6 lg:p-6 bg-background">
        <div className="flex items-center justify-between">
          <h1 className="text-lg font-semibold md:text-2xl">All Issues</h1>
        </div>
        <Tabs defaultValue="active">
          <div className="flex items-center justify-between">
            <TabsList>
              <TabsTrigger value="active">Active</TabsTrigger>
              <TabsTrigger value="resolved">Resolved</TabsTrigger>
            </TabsList>
            {currentUser.role === 'admin' && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="sm" className="gap-1">
                    <ListFilter className="h-4 w-4" />
                    <span className="sr-only sm:not-sr-only sm:whitespace-nowrap">
                      Filter Lines
                    </span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuLabel>Filter by production line</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  {productionLines.map((line) => (
                    <DropdownMenuCheckboxItem
                      key={line.id}
                      checked={selectedLines.includes(line.id)}
                      onCheckedChange={() => handleLineFilterChange(line.id)}
                    >
                      {line.name}
                    </DropdownMenuCheckboxItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          </div>
          <TabsContent value="active">
            <IssuesDataTable
              issues={activeIssues}
              title="Active Issues"
              description="A list of recently reported issues on the production line."
            />
          </TabsContent>
          <TabsContent value="resolved">
            <IssuesDataTable
              issues={resolvedIssues}
              title="Resolved Issues"
              description="A list of recently resolved issues on the production line."
            />
          </TabsContent>
        </Tabs>
      </main>
    </AppLayout>
  );
}
