import { AppLayout } from "@/components/layout/app-layout";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  reportData,
  kpiData,
  issuesByDay,
} from "@/lib/data";
import { ResolutionTimeChart } from "@/components/reports/resolution-time-chart";
import { IssuesTrendChart } from "@/components/reports/issues-trend-chart";

export default function ReportsPage() {
  return (
    <AppLayout>
      <main className="flex flex-1 flex-col gap-4 p-4 lg:gap-6 lg:p-6 bg-background">
        <div className="flex items-center">
          <h1 className="text-lg font-semibold md:text-2xl">Reports</h1>
        </div>
        <Tabs defaultValue="7d">
          <TabsList className="grid w-full grid-cols-3 md:w-[400px]">
            <TabsTrigger value="7d">Last 7 Days</TabsTrigger>
            <TabsTrigger value="30d">Last 30 Days</TabsTrigger>
            <TabsTrigger value="all">All Time</TabsTrigger>
          </TabsList>
          <TabsContent value="7d">
            <div className="grid gap-6">
              <div className="grid md:grid-cols-2 gap-6">
                {kpiData.map((kpi) => (
                  <Card key={kpi.title}>
                    <CardHeader>
                      <CardTitle className="text-sm font-medium">{kpi.title}</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">{kpi.value}</div>
                      <p className="text-xs text-muted-foreground">{kpi.subtitle}</p>
                    </CardContent>
                  </Card>
                ))}
              </div>
              <div className="grid md:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Avg. Resolution Time by Category</CardTitle>
                    <CardDescription>
                      Average time (in hours) to resolve issues per category.
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ResolutionTimeChart data={reportData.resolutionTimeByCategory} />
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader>
                    <CardTitle>Issues Reported</CardTitle>
                    <CardDescription>
                      Number of issues reported over the last 7 days.
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <IssuesTrendChart data={issuesByDay} />
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>
          {/* Add TabsContent for 30d and all when ready */}
        </Tabs>
      </main>
    </AppLayout>
  );
}
