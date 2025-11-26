
"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { PlusCircle, LoaderCircle, Factory, Edit, Lock } from "lucide-react";
import type { ProductionLine } from "@/lib/types";
import { useUser } from "@/contexts/user-context";
import { AddProductionLineDialog } from "@/components/lines/add-production-line-dialog";
import { EditProductionLineDialog } from "@/components/lines/edit-production-line-dialog";
import { DeleteProductionLineDialog } from "@/components/lines/delete-production-line-dialog";
import Link from "next/link";
import { Separator } from "@/components/ui/separator";
import { getClientInstances } from "@/firebase/client";
import { collection, query, where, onSnapshot } from "firebase/firestore";

const planLimits = {
  starter: { lines: 2 },
  standard: { lines: 5 },
  pro: { lines: 10 },
  enterprise: { lines: 20 },
  custom: { lines: Infinity },
};

export default function LinesPage() {
  const { currentUser } = useUser();
  const [productionLines, setProductionLines] = useState<ProductionLine[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!currentUser?.orgId) {
        setLoading(false);
        return;
    };

    setLoading(true);
    const { db } = getClientInstances();
    const linesCollection = collection(db, "productionLines");
    const q = query(linesCollection, where("orgId", "==", currentUser.orgId));
    
    const unsubscribe = onSnapshot(q, (querySnapshot) => {
        const linesData = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as ProductionLine));
        setProductionLines(linesData);
        setLoading(false);
    }, (error) => {
        console.error("Error fetching production lines:", error);
        setLoading(false);
    });

    return () => unsubscribe();
  }, [currentUser?.orgId]);

  if (!currentUser || loading) {
    return (
      <main className="flex flex-1 items-center justify-center">
          <LoaderCircle className="h-8 w-8 animate-spin" />
      </main>
    );
  }

  if (currentUser.role !== 'admin') {
    return (
      <main className="flex flex-1 flex-col gap-4 p-4 lg:gap-6 lg:p-6 bg-background">
        <p>You do not have permission to view this page.</p>
      </main>
    );
  }

  const allLines = productionLines || [];
  const lineLimit = currentUser.plan === 'custom' 
    ? (currentUser.customLineLimit || Infinity)
    : (planLimits[currentUser.plan as keyof typeof planLimits]?.lines || Infinity);
  
  const canAddLine = allLines.length < lineLimit;

  return (
    <main className="flex flex-1 flex-col gap-4 p-4 lg:gap-6 lg:p-6 bg-background">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-lg font-semibold md:text-2xl">Production Lines</h1>
          <p className="text-sm text-muted-foreground">
            You have created {allLines.length} of {lineLimit === Infinity ? 'unlimited' : lineLimit} production lines on the {currentUser.plan} plan.
          </p>
        </div>
        {canAddLine ? (
          <AddProductionLineDialog>
            <Button>
              <PlusCircle className="mr-2 h-4 w-4" />
              Add Line
            </Button>
          </AddProductionLineDialog>
        ) : (
           <Button asChild>
            <Link href="/settings/account">
              <Lock className="mr-2 h-4 w-4" />
              Upgrade to Add More
            </Link>
          </Button>
        )}
      </div>
      
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {allLines.map((line) => (
          <Card key={line.id}>
            <CardHeader className="flex flex-row items-start justify-between">
              <div>
                  <CardTitle>{line.name}</CardTitle>
                  <CardDescription>{line.workstations.length} workstations</CardDescription>
              </div>
              <Factory className="h-8 w-8 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                  {line.workstations.length > 0 ? (
                      line.workstations.map((ws, index) => (
                         <div key={index} className="text-sm text-muted-foreground">{ws}</div>
                      ))
                  ) : (
                      <p className="text-sm text-muted-foreground">No workstations added yet.</p>
                  )}
              </div>
            </CardContent>
            <CardFooter className="flex justify-end gap-2 border-t pt-6">
              <EditProductionLineDialog productionLine={line}>
                  <Button variant="outline" size="sm">
                      <Edit className="h-4 w-4" />
                      <span className="sr-only sm:not-sr-only sm:ml-2">Edit</span>
                  </Button>
              </EditProductionLineDialog>
              <DeleteProductionLineDialog productionLine={line} />
            </CardFooter>
          </Card>
        ))}
      </div>
    </main>
  );
}
