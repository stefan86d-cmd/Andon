
"use client";

import React, { useState, useTransition } from "react";
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
import { DropdownMenuItem } from "@/components/ui/dropdown-menu";
import { toast } from "@/hooks/use-toast";
import { LoaderCircle, Trash2 } from "lucide-react";
import { deleteUser } from "@/app/actions";
import type { User } from "@/lib/types";

interface DeleteUserDialogProps {
  user: User;
}

export function DeleteUserDialog({ user }: DeleteUserDialogProps) {
  const [open, setOpen] = useState(false);
  const [isSubmitting, startSubmittingTransition] = useTransition();

  const handleDelete = () => {
    startSubmittingTransition(async () => {
      const result = await deleteUser(user.email);

      if (result.success) {
        toast({
          title: "User Deleted",
          description: `The user "${user.name}" has been deleted.`,
        });
        setOpen(false);
      } else {
        toast({
          variant: "destructive",
          title: "Failed to delete user",
          description: result.error,
        });
      }
    });
  };

  return (
    <AlertDialog open={open} onOpenChange={setOpen}>
      <AlertDialogTrigger asChild>
        <DropdownMenuItem
          onSelect={(e) => e.preventDefault()}
          className="text-destructive focus:text-destructive focus:bg-destructive/10"
        >
          <Trash2 className="mr-2 h-4 w-4" />
          Delete
        </DropdownMenuItem>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
          <AlertDialogDescription>
            This action cannot be undone. This will permanently delete the user account for
            <span className="font-semibold"> {user.name} </span>.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isSubmitting}>Cancel</AlertDialogCancel>
          <AlertDialogAction onClick={handleDelete} disabled={isSubmitting} className="bg-destructive hover:bg-destructive/90">
            {isSubmitting && <LoaderCircle className="mr-2 h-4 w-4 animate-spin" />}
            Yes, delete user
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
