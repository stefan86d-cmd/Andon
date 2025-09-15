import { AppLayout } from "@/components/layout/app-layout";
import { UsersDataTable } from "@/components/users/users-data-table";
import { Button } from "@/components/ui/button";
import { allUsers } from "@/lib/data";
import { PlusCircle } from "lucide-react";

export default function UsersPage() {
  return (
    <AppLayout>
      <main className="flex flex-1 flex-col gap-4 p-4 lg:gap-6 lg:p-6 bg-background">
        <div className="flex items-center justify-between">
          <h1 className="text-lg font-semibold md:text-2xl">
            User Management
          </h1>
          <Button size="sm" className="gap-1">
            <PlusCircle className="h-4 w-4" />
            Add User
          </Button>
        </div>
        <UsersDataTable users={allUsers} />
      </main>
    </AppLayout>
  );
}
