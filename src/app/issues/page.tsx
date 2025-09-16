import { IssuesDataTable } from "@/components/dashboard/issues-data-table";
import { AppLayout } from "@/components/layout/app-layout";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { issues, users } from "@/lib/data";
import type { Issue } from "@/lib/types";
import { Search } from "lucide-react";

export default function IssuesPage() {
  const currentUser = users.current;

  const activeIssues: Issue[] = issues.filter(
    (issue) => issue.status === "reported" || issue.status === "in_progress"
  );
  const resolvedIssues: Issue[] = issues.filter(
    (issue) => issue.status === "resolved"
  );

  return (
    <AppLayout>
      <main className="flex flex-1 flex-col gap-4 p-4 lg:gap-6 lg:p-6 bg-background">
        <div className="flex items-center justify-between">
          <h1 className="text-lg font-semibold md:text-2xl">All Issues</h1>
          {currentUser.role === 'admin' && (
            <div className="relative w-full max-w-sm">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                    type="search"
                    placeholder="Search issues..."
                    className="w-full appearance-none bg-background pl-8 shadow-none"
                />
            </div>
          )}
        </div>
        <Tabs defaultValue="active">
          <TabsList>
            <TabsTrigger value="active">Active</TabsTrigger>
            <TabsTrigger value="resolved">Resolved</TabsTrigger>
          </TabsList>
          <TabsContent value="active">
            <IssuesDataTable issues={activeIssues} title="Active Issues" />
          </TabsContent>
           <TabsContent value="resolved">
            <IssuesDataTable issues={resolvedIssues} title="Resolved Issues" />
          </TabsContent>
        </Tabs>
      </main>
    </AppLayout>
  );
}
