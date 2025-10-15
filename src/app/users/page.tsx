
"use client";

import React, { useEffect, useState } from "react";
import { AppLayout } from "@/components/layout/app-layout";
import { AddUserDialog } from "@/components/users/add-user-dialog";
import { UsersDataTable } from "@/components/users/users-data-table";
import { Button } from "@/components/ui/button";
import { useUser } from "@/contexts/user-context";
import { PlusCircle, Lock, LoaderCircle } from "lucide-react";
import Link from "next/link";
import type { User } from "@/lib/types";
import { collection, query, where, onSnapshot } from "firebase/firestore";
import { db } from "@/firebase/client";

const planLimits = {
  starter: { users: 5 },
  standard: { users: 80 },
  pro: { users: 150 },
  enterprise: { users: 400 },
  custom: { users: Infinity },
}

export default function UsersPage() {
  const { currentUser } = useUser();
  const [allUsers, setAllUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!currentUser?.orgId) {
      setLoading(false);
      return;
    };
    
    setLoading(true);
    const usersCollection = collection(db, "users");
    const q = query(usersCollection, where("orgId", "==", currentUser.orgId));
    
    const unsubscribe = onSnapshot(q, (querySnapshot) => {
        const usersData = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as User));
        setAllUsers(usersData);
        setLoading(false);
    }, (error) => {
        console.error("Error fetching users:", error);
        setLoading(false);
    });

    return () => unsubscribe();

  }, [currentUser?.orgId]);

  if (loading || !currentUser) {
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

  const userLimit = currentUser.plan === 'custom' 
    ? (currentUser.customUserLimit || Infinity)
    : (planLimits[currentUser.plan as keyof typeof planLimits]?.users || Infinity);

  const canAddUser = allUsers.length < userLimit;

  return (
    <AppLayout>
      <main className="flex flex-1 flex-col gap-4 p-4 lg:gap-6 lg:p-6 bg-background">
        <div className="flex items-center justify-between">
           <div>
            <h1 className="text-lg font-semibold md:text-2xl">
              User Management
            </h1>
             <p className="text-sm text-muted-foreground">
              You are using {allUsers?.length || 0} of {userLimit === Infinity ? 'unlimited' : userLimit} available user seats on the {currentUser.plan} plan.
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
              <Link href="/settings/account">
                <Lock className="h-4 w-4" />
                Upgrade to Add More
              </Link>
            </Button>
          )}
        </div>
        <UsersDataTable users={allUsers || []} loading={loading} />
      </main>
    </AppLayout>
  );
}

    

    
