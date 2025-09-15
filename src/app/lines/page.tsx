import { Header } from "@/components/layout/header";
import { Sidebar } from "@/components/layout/sidebar";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { PlusCircle, Edit } from "lucide-react";
import { productionLines } from "@/lib/data";
import { Badge } from "@/components/ui/badge";

export default function LinesPage() {
  return (
    <div className="grid min-h-screen w-full md:grid-cols-[220px_1fr] lg:grid-cols-[280px_1fr]">
      <Sidebar />
      <div className="flex flex-col">
        <Header />
        <main className="flex flex-1 flex-col gap-4 p-4 lg:gap-6 lg:p-6 bg-background">
          <div className="flex items-center justify-between">
            <h1 className="text-lg font-semibold md:text-2xl">
              Production Lines
            </h1>
            <Button size="sm" className="gap-1">
              <PlusCircle className="h-4 w-4" />
              Add Production Line
            </Button>
          </div>
          <div className="grid gap-6">
            {productionLines.map((line) => (
              <Card key={line.id}>
                <CardHeader className="flex flex-row items-start justify-between">
                  <div>
                    <CardTitle>{line.name}</CardTitle>
                    <CardDescription>
                      {line.workstations.length} workstations
                    </CardDescription>
                  </div>
                  <Button variant="outline" size="sm">
                    <Edit className="h-4 w-4 mr-2" />
                    Edit Line
                  </Button>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2">
                    {line.workstations.map((station) => (
                      <Badge key={station} variant="secondary">
                        {station}
                      </Badge>
                    ))}
                     <Button variant="ghost" size="sm" className="gap-1 text-muted-foreground">
                        <PlusCircle className="h-4 w-4" />
                        Add Workstation
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </main>
      </div>
    </div>
  );
}
