"use client";

import React, { useState, useTransition } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { suggestPriority } from "@/app/actions";

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
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "@/hooks/use-toast";
import { Sparkles, LoaderCircle } from "lucide-react";
import type { Priority } from "@/lib/types";

const issueFormSchema = z.object({
  description: z.string().min(10, {
    message: "Description must be at least 10 characters.",
  }),
  location: z.string().min(3, {
    message: "Location must be at least 3 characters.",
  }),
  priority: z.enum(["low", "medium", "high", "critical"]),
});

type IssueFormValues = z.infer<typeof issueFormSchema>;

export function ReportIssueDialog({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useState(false);
  const [isAiPending, startAiTransition] = useTransition();

  const form = useForm<IssueFormValues>({
    resolver: zodResolver(issueFormSchema),
    defaultValues: {
      description: "",
      location: "",
      priority: "medium",
    },
  });

  const descriptionValue = form.watch("description");

  const handleSuggestPriority = () => {
    startAiTransition(async () => {
      const result = await suggestPriority(descriptionValue);
      if (result.error) {
        toast({
          variant: "destructive",
          title: "AI Suggestion Failed",
          description: result.error,
        });
      } else if (result.priority) {
        form.setValue("priority", result.priority, { shouldValidate: true });
        toast({
          title: "AI Suggestion Complete",
          description: `Priority set to "${result.priority}".`,
        });
      }
    });
  };

  function onSubmit(data: IssueFormValues) {
    console.log(data);
    toast({
      title: "Issue Reported",
      description: "Your issue has been successfully submitted.",
    });
    form.reset();
    setOpen(false);
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Report a New Issue</DialogTitle>
          <DialogDescription>
            Provide details about the issue on the production line.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="e.g., Conveyor belt is making a loud squeaking noise."
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="location"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Location / Machine ID</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g., Assembly Line 2, Machine #4B" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="priority"
              render={({ field }) => (
                <FormItem>
                  <div className="flex items-center justify-between">
                    <FormLabel>Priority</FormLabel>
                    <Button
                      type="button"
                      variant="link"
                      size="sm"
                      className="text-accent-foreground h-auto p-0 gap-1"
                      onClick={handleSuggestPriority}
                      disabled={isAiPending || descriptionValue.length < 10}
                    >
                      {isAiPending ? (
                         <LoaderCircle className="h-4 w-4 animate-spin" />
                      ) : (
                         <Sparkles className="h-4 w-4" />
                      )}
                      Suggest with AI
                    </Button>
                  </div>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                    value={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a priority" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="low">Low</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="high">High</SelectItem>
                      <SelectItem value="critical">Critical</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <DialogFooter>
              <Button type="submit">Submit Issue</Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
