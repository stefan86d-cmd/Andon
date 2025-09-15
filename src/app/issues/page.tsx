import { IssuesDataTable } from "@/components/dashboard/issues-data-table";
import { AppLayout } from "@/components/layout/app-layout";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { issues } from "@/lib/data";
import type { Issue } from "@/lib/types";
import { isToday } from "date-fns";

export default function IssuesPage() {
  const activeIssues: Issue[] = issues.filter(
    (issue) => issue.status === "reported" || issue.status === "in_progress"
  );
  const todaysIssues: Issue[] = issues.filter((issue) =>
    isToday(issue.reportedAt)
  );

  return (
    <AppLayout>
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
    </AppLayout>
  );
}
