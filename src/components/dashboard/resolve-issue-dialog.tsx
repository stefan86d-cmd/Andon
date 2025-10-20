
"use client";

import React, { useTransition } from "react";
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
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription,
} from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "@/hooks/use-toast";
import type { Issue } from "@/lib/types";
import { useUser } from "@/contexts/user-context";
import { Checkbox } from "../ui/checkbox";
import { updateIssue } from "@/app/actions";
import { LoaderCircle } from "lucide-react";


const resolveIssueFormSchema = z.object({
  resolutionNotes: z.string(),
  status: z.enum(["in_progress", "resolved"]),
  productionStopped: z.boolean().default(false),
});

type ResolveIssueFormValues = z.infer<typeof resolveIssueFormSchema>;

interface ResolveIssueDialogProps {
    isOpen: boolean;
    onOpenChange: (isOpen: boolean) => void;
    issue: Issue;
    onIssueUpdate: () => void;
}

export function ResolveIssueDialog({ isOpen, onOpenChange, issue, onIssueUpdate }: ResolveIssueDialogProps) {
  const [isSubmitting, startTransition] = useTransition();
  const { currentUser } = useUser();
  const router = useRouter();

  const form = useForm<ResolveIssueFormValues>({
    resolver: zodResolver(resolveIssueFormSchema),
    defaultValues: {
      resolutionNotes: issue.resolutionNotes || "",
      status: issue.status,
      productionStopped: issue.productionStopped || false,
    },
  });

  function onSubmit(data: ResolveIssueFormValues) {
    if (!currentUser?.email) {
        toast({ title: "Error", description: "You must be logged in.", variant: "destructive"});
        return;
    }

    startTransition(async () => {
        const result = await updateIssue(issue.id, data, currentUser.email!);
        if (result.success) {
            toast({
                title: "Issue Updated",
                description: `The issue has been marked as ${data.status.replace('_', ' ')}.`,
            });
            onIssueUpdate();
            onOpenChange(false);
        } else {
            toast({
                title: "Update Failed",
                description: result.error,
                variant: "destructive"
            });
        }
    });
  }

  // Reset form when the dialog opens or the issue changes
  React.useEffect(() => {
    if (isOpen) {
      form.reset({
        resolutionNotes: issue.resolutionNotes || "",
        status: issue.status,
        productionStopped: issue.productionStopped || false,
      });
    }
  }, [isOpen, issue, form]);


  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Resolve Issue: {issue.location}</DialogTitle>
          <DialogDescription>
            {issue.title}
          </DialogDescription>
        </DialogHeader>

        {(issue.itemNumber || (issue.quantity && issue.quantity > 0)) && (
            <div className="space-y-2 rounded-md border bg-muted p-4">
                <h4 className="font-medium text-sm">Item Details</h4>
                <div className="text-sm text-muted-foreground grid grid-cols-2 gap-x-4 gap-y-1">
                    {issue.itemNumber && <div>Item Number: <span className="font-semibold text-foreground">{issue.itemNumber}</span></div>}
                    {issue.quantity && issue.quantity > 0 && <div>Quantity: <span className="font-semibold text-foreground">{issue.quantity}</span></div>}
                </div>
            </div>
        )}

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="resolutionNotes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Resolution Notes</FormLabel>
                  <FormControl>
                    <Textarea
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="status"
              render={({ field }) => (
                <FormItem>
                    <FormLabel>Status</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    value={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a status" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="in_progress">In Progress</SelectItem>
                      <SelectItem value="resolved">Resolved</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
             <FormField
              control={form.control}
              name="productionStopped"
              render={({ field }) => (
                <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                  <FormControl>
                    <Checkbox
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                  <div className="space-y-1 leading-none">
                    <FormLabel>
                      Production Stop
                    </FormLabel>
                    <FormDescription>
                      Check this box if this issue caused the production line to stop.
                    </FormDescription>
                  </div>
                </FormItem>
              )}
            />
            <DialogFooter>
                <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={isSubmitting}>Cancel</Button>
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
