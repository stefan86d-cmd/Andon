
"use client";

import React, { useState, useTransition } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { toast } from "@/hooks/use-toast";
import { LoaderCircle, PlusCircle } from "lucide-react";
import { editProductionLine } from "@/app/actions";
import type { ProductionLine } from "@/lib/types";
import { WorkstationFormField } from "./workstation-form-field";

const lineFormSchema = z.object({
  name: z.string().min(1, "Line name is required."),
  workstations: z.array(
    z.object({
      value: z.string().min(1, "Workstation name cannot be empty."),
    })
  ).default([]),
});

type LineFormValues = z.infer<typeof lineFormSchema>;

interface EditProductionLineDialogProps {
    children: React.ReactNode;
    productionLine: ProductionLine;
}

export function EditProductionLineDialog({ children, productionLine }: EditProductionLineDialogProps) {
  const [open, setOpen] = useState(false);
  const [isSubmitting, startSubmittingTransition] = useTransition();

  const form = useForm<LineFormValues>({
    resolver: zodResolver(lineFormSchema),
    defaultValues: {
      name: productionLine.name,
      workstations: productionLine.workstations.map(ws => ({ value: ws })),
    },
  });

  function onSubmit(data: LineFormValues) {
    startSubmittingTransition(async () => {
        const result = await editProductionLine(productionLine.id, data);

        if (result.success) {
            toast({
                title: "Production Line Updated",
                description: `The line "${data.name}" has been updated.`,
            });
            setOpen(false);
        } else {
            toast({
                variant: "destructive",
                title: "Failed to update line",
                description: result.error,
            });
        }
    });
  }

  const handleOpenChange = (isOpen: boolean) => {
    if (!isOpen) {
      form.reset({
        name: productionLine.name,
        workstations: productionLine.workstations.map(ws => ({ value: ws })),
      });
    }
    setOpen(isOpen);
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Edit Production Line</DialogTitle>
          <DialogDescription>
            Update the line name and manage its workstations.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Line Name</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g., Assembly Line 4" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <WorkstationFormField form={form} />

            <DialogFooter>
                <Button
                    type="button"
                    variant="outline"
                    onClick={() => setOpen(false)}
                    disabled={isSubmitting}
                >
                    Cancel
                </Button>
                <Button type="submit" disabled={isSubmitting}>
                    {isSubmitting && <LoaderCircle className="mr-2 h-4 w-4 animate-spin" />}
                    Save Changes
                </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
