
import { AppLayout } from "@/components/layout/app-layout";
import { AddUserDialog } from "@/components/users/add-user-dialog";
import { UsersDataTable } from "@/components/users/users-data-table";
import { Button } from "@/components/ui/button";
import { getAllUsers } from "@/lib/data";
import { PlusCircle } from "lucide-react";

export default async function UsersPage() {
  const allUsers = await getAllUsers();
  
  return (
    <AppLayout>
      <main className="flex flex-1 flex-col gap-4 p-4 lg:gap-6 lg:p-6 bg-background">
        <div className="flex items-center justify-between">
          <h1 className="text-lg font-semibold md:text-2xl">
            User Management
          </h1>
          <AddUserDialog>
            <Button size="sm" className="gap-1">
              <PlusCircle className="h-4 w-4" />
              Add User
            </Button>
          </AddUserDialog>
        </div>
        <UsersDataTable users={allUsers} />
      </main>
    </AppLayout>
  );
}
