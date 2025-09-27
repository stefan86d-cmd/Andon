

"use client";

import React from "react";
import type { Issue, Priority, Status, User, IssueCategory } from "@/lib/types";
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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { MoreHorizontal, ArrowDownCircle, TriangleAlert, Flame, Siren, CircleDotDashed, LoaderCircle, CheckCircle2, Archive, Monitor, Truck, Wrench, BadgeCheck, LifeBuoy, HelpCircle } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { formatDistanceToNow } from "date-fns";
import { cn } from "@/lib/utils";
import { ResolveIssueDialog } from "./resolve-issue-dialog";
import { useState } from "react";
import { useUser } from "@/contexts/user-context";
import { SafeHydrate } from "../layout/safe-hydrate";
import { Skeleton } from "../ui/skeleton";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";

const categoryInfo: Record<IssueCategory, { label: string; icon: React.ElementType, color: string }> = {
    it: { label: 'IT & Network', icon: Monitor, color: 'text-blue-500' },
    logistics: { label: 'Logistics', icon: Truck, color: 'text-orange-500' },
    tool: { label: 'Tool & Equipment', icon: Wrench, color: 'text-gray-500' },
    quality: { label: 'Quality', icon: BadgeCheck, color: 'text-green-500' },
    assistance: { label: 'Need Assistance', icon: LifeBuoy, color: 'text-red-500' },
    other: { label: 'Other', icon: HelpCircle, color: 'text-purple-500' },
};

const CategoryDisplay = ({ category }: { category: IssueCategory }) => {
    const { icon: Icon, label, color } = categoryInfo[category] || categoryInfo.other;
    return (
        <Badge variant="outline" className={cn("capitalize border-0 font-medium", color)}>
            <Icon className="mr-2 h-4 w-4" />
            {label}
        </Badge>
    );
};

const priorityIcons: Record<Priority, React.ElementType> = {
  low: ArrowDownCircle,
  medium: TriangleAlert,
  high: Flame,
  critical: Siren,
};

const priorityColors: Record<Priority, string> = {
  low: "text-blue-500",
  medium: "text-yellow-500",
  high: "text-orange-500",
  critical: "text-red-500",
};

const statusIcons: Record<Status, React.ElementType> = {
  reported: CircleDotDashed,
  in_progress: LoaderCircle,
  resolved: CheckCircle2,
  archived: Archive,
};

const StatusDisplay = ({ status }: { status: Status }) => {
    const Icon = statusIcons[status];
    return (
        <Badge variant={status === 'resolved' ? 'default' : 'secondary'} className={cn('capitalize', status === 'resolved' ? 'bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300' : '')}>
            <Icon className={cn("h-3 w-3 mr-1", status === 'in_progress' && 'animate-spin')} />
            {status.replace("_", " ")}
        </Badge>
    );
};

const getInitials = (name: string) => {
    const names = name.split(' ');
    if (names.length > 1) {
        return `${names[0]?.[0] || ''}${names[names.length - 1]?.[0] || ''}`.toUpperCase();
    }
    return `${names[0]?.[0] || ''}${names[0]?.[1] || ''}`.toUpperCase();
}


export function IssuesDataTable({ issues, title, description, loading }: { issues: Issue[], title?: string, description?: string, loading?: boolean }) {
  const { currentUser } = useUser();
  const [selectedIssue, setSelectedIssue] = useState<Issue | null>(null);

  const handleIssueUpdate = (updatedIssue: Issue) => {
    // In a real app with client-side state management (like SWR or React Query),
    // you would trigger a re-fetch or optimistically update the local cache.
    // Since we are using server actions and revalidatePath, a page refresh will show the update.
    console.log("Issue updated:", updatedIssue);
    setSelectedIssue(null);
    // For now, we manually reload to see the change.
    window.location.reload();
  };
  
  const canResolveIssues = currentUser?.role === 'admin' || currentUser?.role === 'supervisor';

  return (
    <Card>
      <CardHeader>
        <CardTitle>{title || (currentUser?.role === 'admin' ? 'Recent Issues' : 'Recent Issues on Your Line')}</CardTitle>
        <CardDescription>
          {description || (currentUser?.role === 'admin' ? 'A list of recently reported issues on the production line.' : 'Issues reported on your selected line within the last 24 hours.')}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Category</TableHead>
              <TableHead>Issue</TableHead>
              <TableHead>Priority</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Reported By</TableHead>
              <TableHead>Time</TableHead>
              {canResolveIssues && (
                <TableHead>
                  <span className="sr-only">Actions</span>
                </TableHead>
              )}
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
                Array.from({ length: 5 }).map((_, i) => (
                    <TableRow key={i}>
                        <TableCell><Skeleton className="h-6 w-28" /></TableCell>
                        <TableCell><Skeleton className="h-6 w-3/4" /></TableCell>
                        <TableCell><Skeleton className="h-6 w-20" /></TableCell>
                        <TableCell><Skeleton className="h-6 w-20" /></TableCell>
                        <TableCell><Skeleton className="h-9 w-9 rounded-full" /></TableCell>
                        <TableCell><Skeleton className="h-6 w-20" /></TableCell>
                        {canResolveIssues && <TableCell />}
                    </TableRow>
                ))
            ) : issues.length > 0 ? (
              issues.map((issue) => (
                <TableRow key={issue.id} onClick={() => canResolveIssues && setSelectedIssue(issue)} className={cn(canResolveIssues && "cursor-pointer")}>
                  <TableCell>
                    <div>
                      <CategoryDisplay category={issue.category} />
                      {issue.subCategory && (
                        <div className="text-xs text-muted-foreground capitalize pl-7 mt-1">
                          {issue.subCategory.replace(/-/g, ' ')}
                        </div>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="font-medium">{issue.location}</div>
                    <div className="text-sm text-muted-foreground">
                      {issue.title}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className={cn(`capitalize border-0 font-medium`, priorityColors[issue.priority])}>
                        {React.createElement(priorityIcons[issue.priority], { className: "h-4 w-4 mr-1" })}
                        {issue.priority}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <StatusDisplay status={issue.status} />
                  </TableCell>
                   <TableCell>
                        <Avatar className="h-9 w-9 border-2 border-primary">
                            <AvatarImage src={issue.reportedBy.avatarUrl} alt={issue.reportedBy.name} />
                            <AvatarFallback>{getInitials(issue.reportedBy.name)}</AvatarFallback>
                        </Avatar>
                   </TableCell>
                  <TableCell>
                    <SafeHydrate>
                        <span className="text-muted-foreground text-sm">{formatDistanceToNow(issue.reportedAt, { addSuffix: true })}</span>
                    </SafeHydrate>
                  </TableCell>
                  {canResolveIssues && (
                    <TableCell>
                      {/* The entire row is clickable, so this is no longer needed */}
                    </TableCell>
                  )}
                </TableRow>
              ))
            ) : (
                <TableRow>
                    <TableCell colSpan={canResolveIssues ? 7 : 6} className="h-24 text-center">
                        No issues found.
                    </TableCell>
                </TableRow>
            )}
          </TableBody>
        </Table>
      </CardContent>
       {selectedIssue && (
         <ResolveIssueDialog
          isOpen={!!selectedIssue}
          onOpenChange={(isOpen) => !isOpen && setSelectedIssue(null)}
          issue={selectedIssue}
          onIssueUpdate={handleIssueUpdate}
        />
      )}
    </Card>
  );
}




