
"use client";

import React, { useState, useTransition } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useRouter } from "next/navigation";

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
import { LoaderCircle } from "lucide-react";
import { editProductionLine } from "@/app/actions";
import type { ProductionLine } from "@/lib/types";
import { WorkstationFormField } from "./workstation-form-field";
import { useUser } from "@/contexts/user-context";
import { ScrollArea } from "../ui/scroll-area";

const planLimits = {
  starter: { workstations: 5 },
  standard: { workstations: 10 },
  pro: { workstations: 15 },
  enterprise: { workstations: 20 },
  custom: { workstations: Infinity },
};

const lineFormSchema = z.object({
  name: z.string().min(1, "Line name is required."),
  workstations: z
    .array(
      z.object({
        value: z.string().min(1, "Workstation name cannot be empty."),
      })
    )
    .default([]),
});

type LineFormValues = z.infer<typeof lineFormSchema>;

interface EditProductionLineDialogProps {
  children: React.ReactNode;
  productionLine: ProductionLine;
}

export function EditProductionLineDialog({
  children,
  productionLine,
}: EditProductionLineDialogProps) {
  const [open, setOpen] = useState(false);
  const [isSubmitting, startSubmittingTransition] = useTransition();
  const { currentUser } = useUser();

  const form = useForm<LineFormValues>({
    resolver: zodResolver(lineFormSchema),
    defaultValues: {
      name: productionLine.name,
      workstations: productionLine.workstations.map((ws) => ({ value: ws })),
    },
  });

  const workstationCount = form.watch("workstations").length;
  const userPlan = currentUser?.plan || "starter";
  
  const workstationLimit = currentUser?.plan === 'custom'
    ? (currentUser.customWorkstationLimit || Infinity)
    : (planLimits[userPlan as keyof typeof planLimits]?.workstations || Infinity);
  
  const canAddWorkstation = workstationCount < workstationLimit;

  function onSubmit(data: LineFormValues) {
    startSubmittingTransition(async () => {
      const result = await editProductionLine(productionLine.id, data);

      if (result.success) {
        toast({
          title: "Production Line Updated",
          description: `The line "${data.name}" has been updated.`,
        });
        setOpen(false);
        // No need for router.refresh() due to onSnapshot listener
      } else {
        const errorMsg =
          "error" in result && typeof result.error === 'string'
            ? result.error
            : "An unexpected error occurred while updating the line.";

        toast({
          variant: "destructive",
          title: "Failed to update line",
          description: errorMsg,
        });
      }
    });
  }

  const handleOpenChange = (isOpen: boolean) => {
    if (!isOpen) {
      form.reset({
        name: productionLine.name,
        workstations: productionLine.workstations.map((ws) => ({ value: ws })),
      });
    }
    setOpen(isOpen);
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="sm:max-w-md grid-rows-[auto,1fr,auto]">
        <DialogHeader>
          <DialogTitle>Edit Production Line</DialogTitle>
          <DialogDescription>
            Update the line name and manage its workstations.
          </DialogDescription>
        </DialogHeader>
        <ScrollArea className="h-full max-h-[60vh] overflow-y-auto">
          <div className="pr-6">
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} id="edit-line-form" className="space-y-4">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Line Name</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <WorkstationFormField
                  form={form}
                  canAdd={canAddWorkstation}
                  limit={
                    workstationLimit === Infinity
                      ? "Unlimited"
                      : workstationLimit
                  }
                  plan={userPlan}
                />
              </form>
            </Form>
          </div>
        </ScrollArea>
        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={() => setOpen(false)}
            disabled={isSubmitting}
          >
            Cancel
          </Button>
          <Button type="submit" form="edit-line-form" disabled={isSubmitting}>
            {isSubmitting && (
              <LoaderCircle className="mr-2 h-4 w-4 animate-spin" />
            )}
            Save Changes
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
