

import { AppLayout } from "@/components/layout/app-layout";
import { AddUserDialog } from "@/components/users/add-user-dialog";
import { UsersDataTable } from "@/components/users/users-data-table";
import { Button } from "@/components/ui/button";
import { getAllUsers } from "@/lib/data";
import { PlusCircle, Lock } from "lucide-react";
import Link from "next/link";

const planLimits = {
  starter: { users: 5 },
  standard: { users: 20 },
  pro: { users: 50 },
  enterprise: { users: Infinity },
}

export default async function UsersPage() {
  // This is a server component, so we can't use the useUser hook directly.
  // In a real app, you would get the current user from the session on the server.
  // For this mock, we'll assume an admin 'pro' user.
  const currentUser = { role: 'admin', plan: 'pro' as const };
  const allUsers = await getAllUsers();

  const userLimit = planLimits[currentUser.plan].users;
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
              You are using {allUsers.length} of {userLimit} available user seats on the {currentUser.plan} plan.
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
        <UsersDataTable users={allUsers} />
      </main>
    </AppLayout>
  );
}
