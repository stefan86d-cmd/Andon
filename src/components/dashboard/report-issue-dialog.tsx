
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
  description: z.string().optional(),
  location: z.string().optional(),
  priority: z.enum(["low", "medium", "high", "critical"]),
  itemNumber: z.string().optional(),
  quantity: z.coerce.number().optional(),
  productionLineId: z.string().optional(),
  productionStopped: z.boolean().default(false),
  title: z.string().optional(),
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
      description: "",
      location: "",
      priority: "medium",
      itemNumber: "",
      quantity: "" as any, // Use empty string for controlled input
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
        description: "",
        location: currentLocation,
        priority: "medium",
        itemNumber: "",
        quantity: "" as any, // Use empty string for controlled input
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
      const categoryInfo = categories.find((c) => c.id === data.category);
      const subCategoryInfo = categoryInfo?.subCategories.find(
        (sc) => sc.id === data.subCategory
      );

      const title = data.description || subCategoryInfo?.label || categoryInfo?.label || "Untitled Issue";

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
        title,
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
  
  const watchedSubCategory = form.watch("subCategory");

  const showExtraFields =
    selectedCategory === "quality" ||
    (selectedCategory === "logistics" &&
      (watchedSubCategory === "material-shortage" ||
        watchedSubCategory === "incorrect-material"));


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
              onClick={() => setStep(step - 1)}
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back
            </Button>
          )}
          <DialogTitle className="pt-8 text-center">
            {step === 1
              ? "Report a New Issue"
              : currentCategory?.label || "Provide Details"}
          </DialogTitle>
          <DialogDescription className="text-center">
            {step === 1
              ? "Select a category"
              : step === 2
              ? "Select a sub-category"
              : "Provide issue details"}
          </DialogDescription>
        </DialogHeader>

        {/* Category Selection */}
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
                    setStep(category.subCategories.length > 0 ? 2 : 3);
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

        {/* Subcategory Selection */}
        {step === 2 && currentCategory && (
          <div className="grid grid-cols-2 gap-4 py-4">
            {currentCategory.subCategories.map((subCategory) => (
              <Card
                key={subCategory.id}
                onClick={() => {
                  form.setValue("subCategory", subCategory.id);
                  setStep(3);
                }}
                className="flex flex-col items-center justify-center text-center p-4 hover:bg-accent hover:text-accent-foreground cursor-pointer"
              >
                <p className="text-sm font-medium">{subCategory.label}</p>
              </Card>
            ))}
          </div>
        )}

        {/* Details Form */}
        {step === 3 && (
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              
              {showExtraFields && (
                <div className="grid grid-cols-2 gap-4">
                    <FormField
                    control={form.control}
                    name="itemNumber"
                    render={({ field }) => (
                        <FormItem>
                        <FormLabel>Item Number</FormLabel>
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
                        <FormLabel>Quantity/Pieces</FormLabel>
                        <FormControl>
                            <Input type="number" {...field} />
                        </FormControl>
                        <FormMessage />
                        </FormItem>
                    )}
                    />
                </div>
              )}
              
              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description</FormLabel>
                    <FormControl>
                      <Textarea {...field} />
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
                    <FormLabel>Priority</FormLabel>
                    <div className="flex gap-2">
                      <Select
                        onValueChange={field.onChange}
                        value={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="low">Low</SelectItem>
                          <SelectItem value="medium">Medium</SelectItem>
                          <SelectItem value="high">High</SelectItem>
                          <SelectItem value="critical">Critical</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </FormItem>
                )}
              />

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
