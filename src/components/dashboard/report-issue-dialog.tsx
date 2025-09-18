
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
import { Card } from "@/components/ui/card";
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
import { Sparkles, LoaderCircle, Monitor, Truck, Wrench, HelpCircle, ArrowLeft, LifeBuoy, BadgeCheck, Factory, HardHat } from "lucide-react";
import type { Priority } from "@/lib/types";
import { cn } from "@/lib/utils";
import { productionLines, users } from "@/lib/data";

const issueFormSchema = z.object({
  category: z.string(),
  subCategory: z.string(),
  description: z.string().min(1, {
    message: "Description is required.",
  }),
  location: z.string(),
  priority: z.enum(["low", "medium", "high", "critical"]),
});

type IssueFormValues = z.infer<typeof issueFormSchema>;

const categories = [
    { 
        id: 'it', 
        label: 'It & Network', 
        icon: Monitor, 
        color: 'text-blue-500',
        subCategories: [
            { id: 'network', label: 'Network Down' },
            { id: 'software', label: 'Software Issue' },
            { id: 'hardware', label: 'Hardware Malfunction' },
            { id: 'other', label: 'Other IT Issue' },
        ]
    },
    { 
        id: 'logistics', 
        label: 'Logistics', 
        icon: Truck, 
        color: 'text-orange-500',
        subCategories: [
            { id: 'material-shortage', label: 'Material Shortage' },
            { id: 'incorrect-material', label: 'Incorrect Material' },
            { id: 'transport-delay', label: 'Transport Delay' },
            { id: 'other', label: 'Other Logistics Issue' },
        ]
    },
    { 
        id: 'tool', 
        label: 'Tool & Equipment', 
        icon: Wrench, 
        color: 'text-gray-500',
        subCategories: [
            { id: 'tool-broken', label: 'Tool Broken' },
            { id: 'calibration', label: 'Needs Calibration' },
            { id: 'power-issue', label: 'Power Issue' },
            { id: 'other', label: 'Other Tool Issue' },
        ]
    },
    { 
        id: 'safety', 
        label: 'Safety Concern', 
        icon: HardHat, 
        color: 'text-yellow-500',
        subCategories: [
            { id: 'spill', label: 'Spill or Leak' },
            { id: 'ppe', label: 'Missing PPE' },
            { id: 'unsafe-condition', label: 'Unsafe Condition' },
            { id: 'other', label: 'Other Safety Concern' },
        ]
    },
    { 
        id: 'quality', 
        label: 'Quality Control', 
        icon: BadgeCheck, 
        color: 'text-green-500',
        subCategories: [
            { id: 'defect-found', label: 'Defect Found' },
            { id: 'measurement', label: 'Incorrect Measurement' },
            { id: 'inspection-fail', label: 'Inspection Failed' },
            { id: 'other', label: 'Other Quality Issue' },
        ]
    },
    { 
        id: 'assistance', 
        label: 'Assistance Needed', 
        icon: LifeBuoy, 
        color: 'text-red-500',
        subCategories: []
    },
];

export function ReportIssueDialog({
  children,
  selectedLineId,
  selectedWorkstation,
}: {
  children: React.ReactNode;
  selectedLineId?: string;
  selectedWorkstation?: string;
}) {
  const [open, setOpen] = useState(false);
  const [isAiPending, startAiTransition] = useTransition();
  const [step, setStep] = useState(1);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  
  const currentUser = users.current;
  
  const getLineName = () => productionLines.find(line => line.id === selectedLineId)?.name || "";
  const getLocation = () => {
    const lineName = getLineName();
    if (lineName && selectedWorkstation) {
      return `${lineName} - ${selectedWorkstation}`;
    }
    return currentUser.productionLineId 
      ? productionLines.find(line => line.id === currentUser.productionLineId)?.name || ""
      : "";
  };

  const form = useForm<IssueFormValues>({
    resolver: zodResolver(issueFormSchema),
  });

  React.useEffect(() => {
    if (open) {
      form.reset({
        category: "",
        subCategory: "",
        description: "",
        location: getLocation(),
        priority: "medium",
      });
      setStep(1);
      setSelectedCategory(null);
    }
  }, [open, selectedLineId, selectedWorkstation, form]);

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
    setOpen(false);
  }

  const handleCategorySelect = (categoryId: string) => {
    setSelectedCategory(categoryId);
    form.setValue("category", categoryId);
    const category = categories.find(c => c.id === categoryId);
    if (category && category.subCategories.length > 0) {
      setStep(2);
    } else {
      setStep(3);
    }
  }

  const handleSubCategorySelect = (subCategoryId: string) => {
    form.setValue("subCategory", subCategoryId);
    setStep(3);
  }

  const handleBack = () => {
    if (step > 1) {
      setStep(step - 1);
    }
  }

  const handleOpenChange = (isOpen: boolean) => {
    if (!isOpen) {
      setStep(1);
      setSelectedCategory(null);
    }
    setOpen(isOpen);
  }
  
  const currentCategory = categories.find(c => c.id === selectedCategory);
  const location = getLocation();

  const getDialogTitle = () => {
    if (step === 1) return "Report a New Issue";
    if (step === 2) return currentCategory?.label;
    if (step === 3) {
      const subCategoryLabel = currentCategory?.subCategories.find(sc => sc.id === form.getValues('subCategory'))?.label;
      return subCategoryLabel || currentCategory?.label;
    }
  }

  const getDialogDescription = () => {
    if (step === 1) return "Select a category for the issue.";
    if (step === 2) return "Select a sub-category.";
    if (step === 3) return "Provide details for the issue.";
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
            {step > 1 && (
                 <Button variant="ghost" size="sm" className="absolute left-4 top-4 w-auto px-2 justify-start" onClick={handleBack}>
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Back
                </Button>
            )}
          <DialogTitle className="pt-8 text-center">{getDialogTitle()}</DialogTitle>
          <DialogDescription className="text-center">
            {getDialogDescription()}
          </DialogDescription>
        </DialogHeader>

        {step === 1 && (
            <div className="grid grid-cols-2 gap-4 py-4">
                {categories.map((category) => {
                    const Icon = category.icon;
                    return (
                    <Card 
                        key={category.id} 
                        className="flex flex-col items-center justify-center text-center p-4 hover:bg-accent hover:text-accent-foreground cursor-pointer"
                        onClick={() => handleCategorySelect(category.id)}
                    >
                        <Icon className={cn("h-12 w-12 mb-2", category.color)} />
                        <p className="text-sm font-medium">{category.label}</p>
                    </Card>
                )})}
            </div>
        )}

        {step === 2 && currentCategory && (
             <div className="grid grid-cols-2 gap-4 py-4">
                {currentCategory.subCategories.map((subCategory) => (
                    <Card 
                        key={subCategory.id} 
                        className="flex flex-col items-center justify-center text-center p-4 hover:bg-accent hover:text-accent-foreground cursor-pointer"
                        onClick={() => handleSubCategorySelect(subCategory.id)}
                    >
                        <p className="text-sm font-medium">{subCategory.label}</p>
                    </Card>
                ))}
            </div>
        )}

        {step === 3 && (
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            {location && (
                 <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground bg-muted/50 p-2 rounded-md">
                    <Factory className="h-4 w-4" />
                    <span>{location}</span>
                </div>
            )}
            <div className="flex justify-center">
                {currentCategory && (
                    <currentCategory.icon className={cn("h-16 w-16", currentCategory.color)} />
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
                <FormItem className="hidden">
                  <FormLabel>Location / Machine ID</FormLabel>
                  <FormControl>
                    <Input {...field} />
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
                      disabled={isAiPending || !descriptionValue}
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
