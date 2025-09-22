
"use client";

import { useFieldArray, type UseFormReturn } from "react-hook-form";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Lock, PlusCircle, Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";
import Link from "next/link";
import type { Plan } from "@/lib/types";

const lineFormSchema = z.object({
  name: z.string().min(1, "Line name is required."),
  workstations: z.array(
    z.object({
      value: z.string().min(1, "Workstation name cannot be empty."),
    })
  ).default([]),
});

type LineFormValues = z.infer<typeof lineFormSchema>;

interface WorkstationFormFieldProps {
  form: UseFormReturn<LineFormValues>;
  canAdd: boolean;
  limit: number;
  plan: Plan;
}

export function WorkstationFormField({ form, canAdd, limit, plan }: WorkstationFormFieldProps) {
  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "workstations",
  });

  return (
    <div className="space-y-2">
      <div className="flex justify-between items-center">
        <FormLabel>Workstations ({fields.length}/{limit})</FormLabel>
         {!canAdd && plan !== 'enterprise' && (
            <Button variant="link" size="sm" asChild className="text-xs h-auto p-0">
                <Link href="/settings">
                    <Lock className="mr-1 h-3 w-3" />
                    Upgrade to add more
                </Link>
            </Button>
        )}
      </div>
      <div className="space-y-2">
        {fields.map((field, index) => (
          <div key={field.id} className="flex items-center gap-2">
            <FormField
              control={form.control}
              name={`workstations.${index}.value`}
              render={({ field }) => (
                <FormItem className="flex-1">
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="text-muted-foreground hover:text-destructive"
              onClick={() => remove(index)}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        ))}
      </div>
      <Button
        type="button"
        variant="ghost"
        size="sm"
        className="gap-1 text-muted-foreground"
        onClick={() => append({ value: "" })}
        disabled={!canAdd}
      >
        <PlusCircle className="h-4 w-4" />
        Add Workstation
      </Button>
    </div>
  );
}
