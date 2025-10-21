
"use client";

import React, { useState, useTransition } from "react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { toast } from "@/hooks/use-toast";
import { LoaderCircle, Trash2 } from "lucide-react";
import { deleteProductionLine } from "@/app/actions";
import type { ProductionLine } from "@/lib/types";

interface DeleteProductionLineDialogProps {
  productionLine: ProductionLine;
}

export function DeleteProductionLineDialog({
  productionLine,
}: DeleteProductionLineDialogProps) {
  const [open, setOpen] = useState(false);
  const [isSubmitting, startSubmittingTransition] = useTransition();

  const handleDelete = () => {
    startSubmittingTransition(async () => {
      const result = await deleteProductionLine(productionLine.id);

      if (result.success) {
        toast({
          title: "Production Line Deleted",
          description: `The line "${productionLine.name}" has been deleted.`,
        });
        setOpen(false);
        // No need for router.refresh() due to onSnapshot listener
      } else {
        toast({
          variant: "destructive",
          title: "Failed to delete line",
          description:
            "error" in result ? result.error : "Unknown error occurred.",
        });
      }
    });
  };

  return (
    <AlertDialog open={open} onOpenChange={setOpen}>
      <AlertDialogTrigger asChild>
        <Button variant="destructive" size="sm">
          <Trash2 className="h-4 w-4" />
          <span className="sr-only sm:not-sr-only sm:ml-2">Delete</span>
        </Button>
      </AlertDialogTrigger>

      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
          <AlertDialogDescription>
            This action cannot be undone. This will permanently delete the
            <span className="font-semibold"> {productionLine.name} </span>
            production line and all of its associated data.
          </AlertDialogDescription>
        </AlertDialogHeader>

        <AlertDialogFooter>
          <AlertDialogCancel disabled={isSubmitting}>No</AlertDialogCancel>
          <AlertDialogAction
            onClick={handleDelete}
            disabled={isSubmitting}
            className="bg-destructive hover:bg-destructive/90"
          >
            {isSubmitting && (
              <LoaderCircle className="mr-2 h-4 w-4 animate-spin" />
            )}
            Yes, delete
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
