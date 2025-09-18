import { AppLayout } from "@/components/layout/app-layout";
import { AddProductionLineDialog } from "@/components/lines/add-production-line-dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { productionLines } from "@/lib/data";
import { Edit, PlusCircle, Trash2 } from "lucide-react";

export default function LinesPage() {
  return (
    <AppLayout>
      <main className="flex flex-1 flex-col gap-4 p-4 lg:gap-6 lg:p-6 bg-background">
        <div className="flex items-center justify-between">
          <h1 className="text-lg font-semibold md:text-2xl">
            Production Lines
          </h1>
          <AddProductionLineDialog>
            <Button size="sm" className="gap-1">
              <PlusCircle className="h-4 w-4" />
              Add Production Line
            </Button>
          </AddProductionLineDialog>
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
                <div className="flex gap-2">
                  <Button variant="outline" size="sm">
                    <Edit className="h-4 w-4" />
                    <span className="sr-only sm:not-sr-only sm:ml-2">Edit</span>
                  </Button>
                   <Button variant="destructive" size="sm">
                    <Trash2 className="h-4 w-4" />
                     <span className="sr-only sm:not-sr-only sm:ml-2">Delete</span>
                  </Button>
                </div>
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
    </AppLayout>
  );
}
