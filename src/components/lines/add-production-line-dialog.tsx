
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
import { createProductionLine } from "@/app/actions";
import { useUser } from "@/contexts/user-context";

const lineFormSchema = z.object({
  name: z.string().min(1, "Line name is required."),
});

type LineFormValues = z.infer<typeof lineFormSchema>;

export function AddProductionLineDialog({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useState(false);
  const [isSubmitting, startSubmittingTransition] = useTransition();
  const { currentUser } = useUser();

  const form = useForm<LineFormValues>({
    resolver: zodResolver(lineFormSchema),
    defaultValues: {
      name: "",
    },
  });

  function onSubmit(data: LineFormValues) {
    if (!currentUser || !currentUser.orgId) {
        toast({
            title: "Not authorized",
            description: "You must be part of an organization to add a line.",
            variant: "destructive"
        });
        return;
    }
    startSubmittingTransition(async () => {
        const result = await createProductionLine(data.name, currentUser.orgId!);

        if (result.success) {
            toast({
                title: "Production Line Added",
                description: `The line "${data.name}" has been created.`,
            });
            setOpen(false);
            // No need for router.refresh() due to onSnapshot listener
        } else {
            const errorMsg =
              typeof result.error === "string"
                ? result.error
                : "An unexpected error occurred while adding the line.";
    
            toast({
                variant: "destructive",
                title: "Failed to add line",
                description: errorMsg,
            });
        }
    });
  }

  const handleOpenChange = (isOpen: boolean) => {
    if (!isOpen) {
      form.reset();
    }
    setOpen(isOpen);
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Add Production Line</DialogTitle>
          <DialogDescription>
            Enter a name for the new production line.
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
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
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
                    Add Line
                </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
