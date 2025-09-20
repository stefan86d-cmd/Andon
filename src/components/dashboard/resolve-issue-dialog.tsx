
"use client";

import React from "react";
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
import type { Issue, Status } from "@/lib/types";
import { issues } from "@/lib/data";
import { useUser } from "@/contexts/user-context";
import { Checkbox } from "../ui/checkbox";


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
    onIssueUpdate: (issue: Issue) => void;
}

export function ResolveIssueDialog({ isOpen, onOpenChange, issue, onIssueUpdate }: ResolveIssueDialogProps) {
  const form = useForm<ResolveIssueFormValues>({
    resolver: zodResolver(resolveIssueFormSchema),
    defaultValues: {
      resolutionNotes: issue.resolutionNotes || "",
      status: issue.status === 'resolved' ? 'resolved' : 'in_progress',
      productionStopped: issue.productionStopped || false,
    },
  });

  const { currentUser } = useUser();

  function onSubmit(data: ResolveIssueFormValues) {
    if (!currentUser) {
        toast({ title: "Error", description: "You must be logged in.", variant: "destructive"});
        return;
    }
    // Find the issue in our mock data and update it
    const issueIndex = issues.findIndex((i) => i.id === issue.id);
    if (issueIndex !== -1) {
      const updatedIssue = {
        ...issues[issueIndex],
        status: data.status as Status,
        resolutionNotes: data.resolutionNotes,
        productionStopped: data.productionStopped,
      };

      if (data.status === 'resolved') {
        updatedIssue.resolvedAt = new Date();
        updatedIssue.resolvedBy = currentUser;
      }

      issues[issueIndex] = updatedIssue;
    }

    toast({
      title: "Issue Updated",
      description: `The issue has been marked as ${data.status}.`,
    });
    
    onIssueUpdate(issues[issueIndex]);
    onOpenChange(false);
    form.reset();
  }

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Resolve Issue: {issue.id}</DialogTitle>
          <DialogDescription>
            {issue.title}
          </DialogDescription>
        </DialogHeader>
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
                    defaultValue={field.value}
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
                <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
                <Button type="submit">Save Changes</Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
