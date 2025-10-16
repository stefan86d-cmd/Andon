

import type { Role, User } from "@/lib/types";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { MoreHorizontal, UserCog, User as UserIcon, ShieldCheck } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { DeleteUserDialog } from "./delete-user-dialog";
import { EditUserDialog } from "./edit-user-dialog";
import React from "react";
import { Skeleton } from "../ui/skeleton";
import { useUser } from "@/contexts/user-context";

const roleIcons: Record<Role, React.ElementType> = {
    admin: UserCog,
    supervisor: ShieldCheck,
    operator: UserIcon,
};

const RoleDisplay = ({ role }: { role: Role }) => {
    const Icon = roleIcons[role];
    return (
        <Badge variant="outline" className="capitalize border-0 font-medium">
            <Icon className="mr-2 h-4 w-4 text-muted-foreground" />
            {role}
        </Badge>
    );
};

const getInitials = (firstName: string, lastName: string) => {
    return `${firstName?.[0] || ''}${lastName?.[0] || ''}`;
}


export function UsersDataTable({ users, loading }: { users: User[], loading?: boolean }) {
  const { currentUser } = useUser();
  return (
    <Card>
      <CardHeader>
        <CardTitle>All Users</CardTitle>
        <CardDescription>
          Manage user accounts and permissions.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>User</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Role</TableHead>
              <TableHead>
                <span className="sr-only">Actions</span>
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
                Array.from({ length: 3 }).map((_, i) => (
                     <TableRow key={i}>
                        <TableCell>
                            <div className="flex items-center gap-3">
                                <Skeleton className="h-9 w-9 rounded-full" />
                                <Skeleton className="h-6 w-32" />
                            </div>
                        </TableCell>
                        <TableCell><Skeleton className="h-6 w-40" /></TableCell>
                        <TableCell><Skeleton className="h-6 w-24" /></TableCell>
                        <TableCell><Skeleton className="h-8 w-8" /></TableCell>
                    </TableRow>
                ))
            ) : users.length > 0 ? (
                users.map((user) => {
                    const name = `${user.firstName || ''} ${user.lastName || ''}`.trim();
                    const isCurrentUser = currentUser?.id === user.id;
                    return (
                        <TableRow key={user.email}>
                            <TableCell>
                                <div className="flex items-center gap-3">
                                    <Avatar className="h-9 w-9 border-2 border-primary">
                                        <AvatarFallback>{getInitials(user.firstName, user.lastName)}</AvatarFallback>
                                    </Avatar>
                                    <div className="font-medium">{name}</div>
                                </div>
                            </TableCell>
                            <TableCell>{user.email}</TableCell>
                            <TableCell>
                                <RoleDisplay role={user.role} />
                            </TableCell>
                            <TableCell>
                                <DropdownMenu>
                                    <DropdownMenuTrigger asChild disabled={isCurrentUser}>
                                    <Button
                                        aria-haspopup="true"
                                        size="icon"
                                        variant="ghost"
                                    >
                                        <MoreHorizontal className="h-4 w-4" />
                                        <span className="sr-only">Toggle menu</span>
                                    </Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent align="end">
                                    <DropdownMenuLabel>Actions</DropdownMenuLabel>
                                    <EditUserDialog user={user} />
                                    <DeleteUserDialog user={user} />
                                    </DropdownMenuContent>
                                </DropdownMenu>
                            </TableCell>
                        </TableRow>
                    )
                })
            ) : (
                <TableRow>
                    <TableCell colSpan={4} className="h-24 text-center">
                        No users found.
                    </TableCell>
                </TableRow>
            )}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
