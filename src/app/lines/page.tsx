
"use client";

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
import { Edit, PlusCircle, Lock, LoaderCircle } from "lucide-react";
import { useUser } from "@/contexts/user-context";
import Link from "next/link";
import { useCollection, useFirestore, useMemoFirebase } from "@/firebase";
import { collection } from "firebase/firestore";
import type { User, ProductionLine } from "@/lib/types";

const planLimits = {
  starter: { lines: 1, users: 5 },
  standard: { lines: 5, users: 50 },
  pro: { lines: 10, users: 150 },
  enterprise: { lines: Infinity, users: Infinity },
}

export default function LinesPage() {
  const { currentUser } = useUser();
  const firestore = useFirestore();

  const linesQuery = useMemoFirebase(() => {
    if (!firestore) return null;
    return collection(firestore, "productionLines");
  }, [firestore]);

  const { data: productionLines, isLoading } = useCollection<ProductionLine>(linesQuery);

  if (!currentUser) {
     return <AppLayout><div className="flex h-screen items-center justify-center"><LoaderCircle className="h-8 w-8 animate-spin" /></div></AppLayout>
  }
  
  const allLines = productionLines || [];
  const lineLimit = planLimits[currentUser.plan].lines;
  const canAddLine = allLines.length < lineLimit;

  return (
    <AppLayout>
      <main className="flex flex-1 flex-col gap-4 p-4 lg:gap-6 lg:p-6 bg-background">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-lg font-semibold md:text-2xl">
              Production Lines
            </h1>
            <p className="text-sm text-muted-foreground">
              You are using {allLines.length} of {lineLimit} available lines on the {currentUser.plan} plan.
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
        {isLoading ? (
          <div className="flex justify-center items-center h-64">
            <LoaderCircle className="h-8 w-8 animate-spin" />
          </div>
        ) : (
          <div className="grid gap-6">
            {allLines.map((line) => (
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
        )}
      </main>
    </AppLayout>
  );
}
