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
import { Sparkles, LoaderCircle, Monitor, Truck, Wrench, HelpCircle, ArrowLeft } from "lucide-react";
import type { Priority } from "@/lib/types";
import { PlaceHolderImages } from "@/lib/placeholder-images";
import Image from "next/image";
import { Card, CardContent } from "../ui/card";
import { cn } from "@/lib/utils";

const issueFormSchema = z.object({
  category: z.string(),
  description: z.string().min(10, {
    message: "Description must be at least 10 characters.",
  }),
  location: z.string().min(3, {
    message: "Location must be at least 3 characters.",
  }),
  priority: z.enum(["low", "medium", "high", "critical"]),
});

type IssueFormValues = z.infer<typeof issueFormSchema>;

const categories = [
    { id: 'it', label: 'IT Problem', icon: Monitor },
    { id: 'logistics', label: 'Logistics', icon: Truck },
    { id: 'tool', label: 'Tool Problem', icon: Wrench },
    { id: 'other', label: 'Other', icon: HelpCircle },
];

export function ReportIssueDialog({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useState(false);
  const [isAiPending, startAiTransition] = useTransition();
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  const form = useForm<IssueFormValues>({
    resolver: zodResolver(issueFormSchema),
    defaultValues: {
      category: "",
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
    setSelectedCategory(null);
    setOpen(false);
  }

  const handleCategorySelect = (categoryId: string) => {
    setSelectedCategory(categoryId);
    form.setValue("category", categoryId);
  }

  const handleBack = () => {
    setSelectedCategory(null);
    form.reset();
  }

  const handleOpenChange = (isOpen: boolean) => {
    if (!isOpen) {
      form.reset();
      setSelectedCategory(null);
    }
    setOpen(isOpen);
  }
  
  const currentCategory = categories.find(c => c.id === selectedCategory);

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
            {selectedCategory && (
                 <Button variant="ghost" size="sm" className="absolute left-4 top-4 w-auto px-2 justify-start" onClick={handleBack}>
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Back
                </Button>
            )}
          <DialogTitle className={cn("pt-8", selectedCategory ? 'text-center' : '')}>Report a New Issue</DialogTitle>
          <DialogDescription className={cn(selectedCategory ? 'text-center' : '')}>
            {selectedCategory ? `Provide details for the '${currentCategory?.label}' issue.` : 'Select a category for the issue.'}
          </DialogDescription>
        </DialogHeader>

        {!selectedCategory ? (
            <div className="grid grid-cols-2 gap-4 py-4">
                {categories.map((category) => {
                    const Icon = category.icon;
                    return (
                    <Card 
                        key={category.id} 
                        className="flex flex-col items-center justify-center text-center p-4 hover:bg-accent hover:text-accent-foreground cursor-pointer"
                        onClick={() => handleCategorySelect(category.id)}
                    >
                        <Icon className="h-12 w-12 mb-2" />
                        <p className="text-sm font-medium">{category.label}</p>
                    </Card>
                )})}
            </div>
        ) : (
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div className="flex justify-center">
            {currentCategory && (
                <currentCategory.icon className="h-16 w-16" />
            )}
            </div>
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
        )}
      </DialogContent>
    </Dialog>
  );
}
