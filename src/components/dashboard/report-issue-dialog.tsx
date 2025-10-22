
"use client";

import React, { useState, useTransition } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { reportIssue } from "@/app/actions";
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
import {
  LoaderCircle,
  Monitor,
  Truck,
  Wrench,
  HelpCircle,
  ArrowLeft,
  LifeBuoy,
  BadgeCheck,
} from "lucide-react";
import type { ProductionLine, Priority, IssueCategory } from "@/lib/types";
import { cn } from "@/lib/utils";
import { useUser } from "@/contexts/user-context";

const issueFormSchema = z.object({
  category: z.string().min(1, "Category is required."),
  subCategory: z.string().optional(),
  title: z.string().min(1, "A short title for the issue is required."),
  itemNumber: z.string().optional(),
  quantity: z.coerce.number().optional(),
  location: z.string().optional(),
  priority: z.enum(["low", "medium", "high", "critical"]),
  productionLineId: z.string().optional(),
  productionStopped: z.boolean().default(false),
});

type IssueFormValues = z.infer<typeof issueFormSchema>;

const categories: {
    id: IssueCategory;
    label: string;
    icon: React.ElementType;
    color: string;
    subCategories: { id: string; label: string }[];
}[] = [
  {
    id: "it",
    label: "IT & Network",
    icon: Monitor,
    color: "text-blue-500",
    subCategories: [
      { id: "network", label: "Network Down" },
      { id: "software", label: "Software Issue" },
      { id: "hardware", label: "Hardware Malfunction" },
      { id: "other", label: "Other IT Issue" },
    ],
  },
  {
    id: "logistics",
    label: "Logistics",
    icon: Truck,
    color: "text-orange-500",
    subCategories: [
      { id: "material-shortage", label: "Material Shortage" },
      { id: "incorrect-material", label: "Incorrect Material" },
      { id: "transport-delay", label: "Transport Delay" },
      { id: "other", label: "Other Logistics Issue" },
    ],
  },
  {
    id: "tool",
    label: "Tool & Equipment",
    icon: Wrench,
    color: "text-gray-500",
    subCategories: [
      { id: "tool-broken", label: "Tool Broken" },
      { id: "calibration", label: "Needs Calibration" },
      { id: "power-issue", label: "Power Issue" },
      { id: "other", label: "Other Tool Issue" },
    ],
  },
  {
    id: "quality",
    label: "Quality Control",
    icon: BadgeCheck,
    color: "text-green-500",
    subCategories: [
      { id: "defect-found", label: "Defect Found" },
      { id: "measurement", label: "Incorrect Measurement" },
      { id: "inspection-fail", label: "Inspection Failed" },
      { id: "other", label: "Other Quality Issue" },
    ],
  },
  {
    id: "assistance",
    label: "Need Assistance",
    icon: LifeBuoy,
    color: "text-red-500",
    subCategories: [],
  },
  {
    id: "other",
    label: "Other",
    icon: HelpCircle,
    color: "text-purple-500",
    subCategories: [],
  },
];

export function ReportIssueDialog({
  children,
  productionLines,
  selectedLineId,
  selectedWorkstation,
  onIssueReported,
}: {
  children: React.ReactNode;
  productionLines: ProductionLine[];
  selectedLineId?: string;
  selectedWorkstation?: string;
  onIssueReported?: () => void;
}) {
  const [open, setOpen] = useState(false);
  const [isSubmitting, startSubmittingTransition] = useTransition();
  const [step, setStep] = useState(1);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const router = useRouter();
  const { currentUser } = useUser();

  const form = useForm<IssueFormValues>({
    resolver: zodResolver(issueFormSchema),
    defaultValues: {
      category: "",
      subCategory: "",
      title: "",
      itemNumber: "",
      quantity: "" as any,
      location: "",
      priority: "medium",
      productionStopped: false,
    },
  });

  const getLocation = React.useCallback(() => {
    const lineName =
      productionLines.find((line) => line.id === selectedLineId)?.name || "";
    if (lineName && selectedWorkstation) {
      return `${lineName} - ${selectedWorkstation}`;
    }
    return currentUser?.productionLineId
      ? productionLines.find((line) => line.id === currentUser.productionLineId)
          ?.name || ""
      : "";
  }, [selectedLineId, selectedWorkstation, currentUser?.productionLineId, productionLines]);

  React.useEffect(() => {
    if (open) {
      const currentLocation = getLocation();
      form.reset({
        category: "",
        subCategory: "",
        title: "",
        itemNumber: "",
        quantity: "" as any,
        location: currentLocation,
        priority: "medium",
        productionStopped: false,
      });
      setStep(1);
      setSelectedCategory(null);
    }
  }, [open, getLocation, form]);

  function onSubmit(data: IssueFormValues) {
    if (!currentUser?.email) {
      toast({
        variant: "destructive",
        title: "Not Logged In",
        description: "You must be logged in to report an issue.",
      });
      return;
    }

    startSubmittingTransition(async () => {
      const lineId = selectedLineId || currentUser?.productionLineId;
      if (!lineId || !currentUser?.orgId) {
        toast({
            variant: "destructive",
            title: "Configuration Error",
            description: "Could not determine the production line or organization.",
        });
        return;
      }

      const issueData = {
        title: data.title,
        location: data.location || getLocation(),
        productionLineId: lineId,
        orgId: currentUser.orgId,
        priority: data.priority,
        category: data.category as IssueCategory,
        subCategory: data.subCategory || "",
        itemNumber: data.itemNumber || "",
        quantity: data.quantity || 0,
        productionStopped: data.productionStopped ?? false,
      };

      const result = await reportIssue(issueData, currentUser.email!);

      if (result.success) {
        toast({
          title: "Issue Reported",
          description: "Your issue has been successfully submitted.",
        });
        setOpen(false);
        if (onIssueReported) {
          onIssueReported();
        } else {
          router.refresh();
        }
      } else {
        toast({
          variant: "destructive",
          title: "Report Failed",
          description: result.error || "Failed to report issue. Please try again.",
        });
      }
    });
  }

  const currentCategory = categories.find((c) => c.id === selectedCategory);
  
  const showExtraFields =
    selectedCategory === "quality" || selectedCategory === "logistics";

  const handleBack = () => {
    if (step > 1) {
        if (step === 2 && currentCategory && currentCategory.subCategories.length === 0) {
            setStep(1);
        } else {
            setStep(step - 1);
        }
    }
  }


  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          {step > 1 && (
            <Button
              variant="ghost"
              size="sm"
              className="absolute left-4 top-4 w-auto px-2 justify-start"
              onClick={handleBack}
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back
            </Button>
          )}
          <DialogTitle className="pt-8 text-center">
            {step === 1
              ? "Report a New Issue"
              : "Provide Details"}
          </DialogTitle>
          <DialogDescription className="text-center">
            {step === 1
              ? "Select a category that best describes the issue"
              : "Add more details about the issue below"}
          </DialogDescription>
        </DialogHeader>

        {step === 1 && (
          <div className="grid grid-cols-2 gap-4 py-4">
            {categories.map((category) => {
              const Icon = category.icon;
              return (
                <Card
                  key={category.id}
                  onClick={() => {
                    setSelectedCategory(category.id);
                    form.setValue("category", category.id);
                    setStep(2);
                  }}
                  className="flex flex-col items-center justify-center text-center p-4 hover:bg-accent hover:text-accent-foreground cursor-pointer"
                >
                  <Icon className={cn("h-12 w-12 mb-2", category.color)} />
                  <p className="text-sm font-medium">{category.label}</p>
                </Card>
              );
            })}
          </div>
        )}

        {step === 2 && (
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 pt-4">
              
              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Issue Title</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="e.g., Conveyor belt jammed" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              {currentCategory?.subCategories && currentCategory.subCategories.length > 0 && (
                 <FormField
                    control={form.control}
                    name="subCategory"
                    render={({ field }) => (
                    <FormItem>
                        <FormLabel>Sub-Category</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                            <SelectTrigger>
                                <SelectValue placeholder="Select a sub-category" />
                            </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                                {currentCategory.subCategories.map(sc => (
                                    <SelectItem key={sc.id} value={sc.id}>{sc.label}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                        <FormMessage />
                    </FormItem>
                    )}
                />
              )}

              {showExtraFields && (
                <div className="grid grid-cols-2 gap-4">
                    <FormField
                    control={form.control}
                    name="itemNumber"
                    render={({ field }) => (
                        <FormItem>
                        <FormLabel>Item Number (Optional)</FormLabel>
                        <FormControl>
                            <Input {...field} />
                        </FormControl>
                        <FormMessage />
                        </FormItem>
                    )}
                    />
                    <FormField
                    control={form.control}
                    name="quantity"
                    render={({ field }) => (
                        <FormItem>
                        <FormLabel>Quantity (Optional)</FormLabel>
                        <FormControl>
                            <Input type="number" {...field} />
                        </FormControl>
                        <FormMessage />
                        </FormItem>
                    )}
                    />
                </div>
              )}

              <DialogFooter>
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting && (
                    <LoaderCircle className="mr-2 h-4 w-4 animate-spin" />
                  )}
                  Submit Issue
                </Button>
              </DialogFooter>
            </form>
          </Form>
        )}
      </DialogContent>
    </Dialog>
  );
}
