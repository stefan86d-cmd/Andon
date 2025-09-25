
"use client";

import React from "react";
import { AppLayout } from "@/components/layout/app-layout";
import { AddUserDialog } from "@/components/users/add-user-dialog";
import { UsersDataTable } from "@/components/users/users-data-table";
import { Button } from "@/components/ui/button";
import { useUser, useFirestore, useCollection, useMemoFirebase } from "@/firebase";
import { PlusCircle, Lock, LoaderCircle } from "lucide-react";
import Link from "next/link";
import { collection } from "firebase/firestore";
import type { User } from "@/lib/types";

const planLimits = {
  starter: { users: 5 },
  standard: { users: 50 },
  pro: { users: 150 },
  enterprise: { users: Infinity },
}

export default function UsersPage() {
  const { currentUser, loading: userLoading } = useUser();
  const firestore = useFirestore();

  const usersQuery = useMemoFirebase(() => {
    if (!firestore) return null;
    return collection(firestore, "users");
  }, [firestore]);

  const { data: allUsers, isLoading: usersLoading } = useCollection<User>(usersQuery);

  const isLoading = userLoading || usersLoading;

  if (isLoading) {
    return <AppLayout>
      <main className="flex flex-1 items-center justify-center">
        <LoaderCircle className="h-8 w-8 animate-spin" />
      </main>
    </AppLayout>
  }
  
  if (currentUser?.role !== 'admin') {
     return <AppLayout>
      <main className="flex flex-1 flex-col gap-4 p-4 lg:gap-6 lg:p-6 bg-background">
        <p>You do not have permission to view this page.</p>
      </main>
    </AppLayout>
  }

  const userLimit = planLimits[currentUser.plan].users;
  const canAddUser = (allUsers?.length || 0) < userLimit;

  return (
    <AppLayout>
      <main className="flex flex-1 flex-col gap-4 p-4 lg:gap-6 lg:p-6 bg-background">
        <div className="flex items-center justify-between">
           <div>
            <h1 className="text-lg font-semibold md:text-2xl">
              User Management
            </h1>
             <p className="text-sm text-muted-foreground">
              You are using {allUsers?.length || 0} of {userLimit} available user seats on the {currentUser.plan} plan.
            </p>
          </div>
          {canAddUser ? (
            <AddUserDialog>
              <Button size="sm" className="gap-1">
                <PlusCircle className="h-4 w-4" />
                Add User
              </Button>
            </AddUserDialog>
          ) : (
            <Button size="sm" asChild className="gap-1">
              <Link href="/settings">
                <Lock className="h-4 w-4" />
                Upgrade to Add More
              </Link>
            </Button>
          )}
        </div>
        <UsersDataTable users={allUsers || []} />
      </main>
    </AppLayout>
  );
}
