
"use client";

import React from "react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { LoaderCircle } from "lucide-react";

interface CancelSubscriptionDialogProps {
  children: React.ReactNode;
  onConfirm: () => void;
  disabled?: boolean;
}

export function CancelSubscriptionDialog({ children, onConfirm, disabled = false }: CancelSubscriptionDialogProps) {

  const handleConfirm = () => {
    if (!disabled) {
      onConfirm();
    }
  };

  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        {children}
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
          <AlertDialogDescription>
            This action cannot be undone. Your subscription will be cancelled at the end of the current billing period. You will lose access to your plan features at that time.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={disabled}>No, keep plan</AlertDialogCancel>
          <AlertDialogAction onClick={handleConfirm} className="bg-destructive hover:bg-destructive/90" disabled={disabled}>
             {disabled && <LoaderCircle className="mr-2 h-4 w-4 animate-spin" />}
            Yes, cancel subscription
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

    