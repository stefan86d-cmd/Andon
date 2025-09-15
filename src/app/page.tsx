import { Header } from "@/components/layout/header";
import { Sidebar } from "@/components/layout/sidebar";
import { IssuesDataTable } from "@/components/dashboard/issues-data-table";
import { StatsCards } from "@/components/dashboard/stats-cards";
import { ReportIssueDialog } from "@/components/dashboard/report-issue-dialog";
import { Button } from "@/components/ui/button";
import { PlusCircle } from "lucide-react";
import { issues, stats } from "@/lib/data";

export default function Home() {
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
          
          <StatsCards stats={stats} />
          
          <IssuesDataTable issues={issues} />
          
        </main>
      </div>
    </div>
  );
}
