import { Header } from "@/components/layout/header";
import { Sidebar } from "@/components/layout/sidebar";
import { IssuesDataTable } from "@/components/dashboard/issues-data-table";
import { StatsCards } from "@/components/dashboard/stats-cards";
import { ReportIssueDialog } from "@/components/dashboard/report-issue-dialog";
import { Button } from "@/components/ui/button";
import { PlusCircle } from "lucide-react";
import { issues, stats, users, productionLines } from "@/lib/data";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function Home() {
  // To test different user roles, change 'current' to 'operator'
  const currentUser = users.current; 

  const userIssues =
    currentUser.role === "admin"
      ? issues
      : issues.filter((issue) => issue.productionLineId === currentUser.productionLineId);

  const currentProductionLine = productionLines.find(line => line.id === currentUser.productionLineId);

  return (
    <div className="grid min-h-screen w-full md:grid-cols-[220px_1fr] lg:grid-cols-[280px_1fr]">
      <Sidebar />
      <div className="flex flex-col">
        <Header />
        <main className="flex flex-1 flex-col gap-4 p-4 lg:gap-6 lg:p-6 bg-background">
          <div className="flex items-center justify-between">
            <h1 className="text-lg font-semibold md:text-2xl">Dashboard</h1>
            <ReportIssueDialog>
              <Button size="sm" className="gap-1">
                <PlusCircle className="h-4 w-4" />
                Report Issue
              </Button>
            </ReportIssueDialog>
          </div>
          
          {currentUser.role === 'admin' ? (
            <>
              <StatsCards stats={stats} />
              <IssuesDataTable issues={userIssues} />
            </>
          ) : (
            <div className="flex flex-col gap-4">
               <Card>
                <CardHeader>
                  <CardTitle>Your Production Line</CardTitle>
                  <CardDescription>Details about your assigned work area.</CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-2xl font-bold">{currentProductionLine?.name || 'No line assigned'}</p>
                </CardContent>
              </Card>
              <IssuesDataTable issues={userIssues} />
            </div>
          )}
          
        </main>
      </div>
    </div>
  );
}
