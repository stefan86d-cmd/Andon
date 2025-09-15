
import { Header } from "@/components/layout/header";
import { Sidebar } from "@/components/layout/sidebar";
import { IssuesDataTable } from "@/components/dashboard/issues-data-table";
import { issues } from "@/lib/data";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { isToday } from "date-fns";
import type { Issue } from "@/lib/types";

export default function IssuesPage() {
  const activeIssues: Issue[] = issues.filter(
    (issue) => issue.status === "reported" || issue.status === "in_progress"
  );
  const todaysIssues: Issue[] = issues.filter((issue) =>
    isToday(issue.reportedAt)
  );

  return (
    <div className="grid min-h-screen w-full md:grid-cols-[220px_1fr] lg:grid-cols-[280px_1fr]">
      <Sidebar />
      <div className="flex flex-col">
        <Header />
        <main className="flex flex-1 flex-col gap-4 p-4 lg:gap-6 lg:p-6 bg-background">
          <div className="flex items-center">
            <h1 className="text-lg font-semibold md:text-2xl">All Issues</h1>
          </div>
          <Tabs defaultValue="active">
            <TabsList>
              <TabsTrigger value="active">Active</TabsTrigger>
              <TabsTrigger value="today">Today</TabsTrigger>
            </TabsList>
            <TabsContent value="active">
              <IssuesDataTable issues={activeIssues} />
            </TabsContent>
            <TabsContent value="today">
              <IssuesDataTable issues={todaysIssues} />
            </TabsContent>
          </Tabs>
        </main>
      </div>
    </div>
  );
}
