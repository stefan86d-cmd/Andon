

import { AppLayout } from "@/components/layout/app-layout";
import { AddProductionLineDialog } from "@/components/lines/add-production-line-dialog";
import { DeleteProductionLineDialog } from "@/components/lines/delete-production-line-dialog";
import { EditProductionLineDialog } from "@/components/lines/edit-production-line-dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { getProductionLines, getAllUsers } from "@/lib/data";
import { Edit, PlusCircle, Lock } from "lucide-react";
import { useUser } from "@/contexts/user-context";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { buttonVariants } from "@/components/ui/button";

const planLimits = {
  starter: { lines: 1, users: 5 },
  standard: { lines: 5, users: 20 },
  pro: { lines: 10, users: 50 },
  enterprise: { lines: Infinity, users: Infinity },
}

export default async function LinesPage() {
  // This is a server component, so we can't use the useUser hook directly.
  // In a real app, you would get the current user from the session on the server.
  // For this mock, we'll assume an admin 'pro' user.
  const currentUser = { role: 'admin', plan: 'pro' as const };
  
  const productionLines = await getProductionLines();
  const allUsers = await getAllUsers();
  
  const lineLimit = planLimits[currentUser.plan].lines;
  const canAddLine = productionLines.length < lineLimit;

  return (
    <AppLayout>
      <main className="flex flex-1 flex-col gap-4 p-4 lg:gap-6 lg:p-6 bg-background">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-lg font-semibold md:text-2xl">
              Production Lines
            </h1>
            <p className="text-sm text-muted-foreground">
              You are using {productionLines.length} of {lineLimit} available lines on the {currentUser.plan} plan.
            </p>
          </div>
          {canAddLine ? (
            <AddProductionLineDialog>
              <Button size="sm" className="gap-1">
                <PlusCircle className="h-4 w-4" />
                Add Production Line
              </Button>
            </AddProductionLineDialog>
          ) : (
             <Button size="sm" className="gap-1" asChild>
              <Link href="/settings">
                <Lock className="h-4 w-4" />
                Upgrade to Add More
              </Link>
            </Button>
          )}
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
                  <EditProductionLineDialog productionLine={line}>
                    <Button variant="outline" size="sm">
                      <Edit className="h-4 w-4" />
                      <span className="sr-only sm:not-sr-only sm:ml-2">Edit</span>
                    </Button>
                  </EditProductionLineDialog>
                  <DeleteProductionLineDialog productionLine={line} />
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {line.workstations.map((station) => (
                    <Badge key={station} variant="secondary">
                      {station}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </main>
    </AppLayout>
  );
}
