

"use client";

import React from "react";
import type { Issue, Priority, Status, User, IssueCategory } from "@/lib/types";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
    CardFooter,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
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
import { useRouter } from "next/navigation";

const categoryInfo: Record<IssueCategory, { label: string; icon: React.ElementType, textColor: string, bgColor: string }> = {
    it: { label: 'IT & Network', icon: Monitor, textColor: 'text-blue-500', bgColor: 'bg-blue-500' },
    logistics: { label: 'Logistics', icon: Truck, textColor: 'text-orange-500', bgColor: 'bg-orange-500' },
    tool: { label: 'Tool & Equipment', icon: Wrench, textColor: 'text-gray-500', bgColor: 'bg-gray-500' },
    quality: { label: 'Quality', icon: BadgeCheck, textColor: 'text-green-500', bgColor: 'bg-green-500' },
    assistance: { label: 'Need Assistance', icon: LifeBuoy, textColor: 'text-red-500', bgColor: 'bg-red-500' },
    other: { label: 'Other', icon: HelpCircle, textColor: 'text-purple-500', bgColor: 'bg-purple-500' },
};

const CategoryDisplay = ({ category }: { category: IssueCategory }) => {
    const { icon: Icon, label, textColor } = categoryInfo[category] || categoryInfo.other;
    return (
        <div className={cn("capitalize font-medium flex items-center", textColor)}>
            <Icon className="mr-2 h-4 w-4" />
            {label}
        </div>
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

export function IssuesDataTable({ issues, title, description, loading, onIssueUpdate }: { issues: Issue[], title?: string, description?: string, loading?: boolean, onIssueUpdate?: () => void }) {
  const { currentUser } = useUser();
  const [selectedIssue, setSelectedIssue] = useState<Issue | null>(null);
  const router = useRouter();

  const handleIssueUpdate = () => {
    setSelectedIssue(null);
    if (onIssueUpdate) onIssueUpdate();
  };
  
  const canResolveIssues = currentUser?.role === 'admin' || currentUser?.role === 'supervisor';
  const formatSubCategory = (subCategory?: string) => {
    if (!subCategory) return 'N/A';
    return subCategory.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
  };

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
              <TableHead>Sub-Category</TableHead>
              <TableHead>Location</TableHead>
              <TableHead>Issue</TableHead>
              <TableHead>Priority</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Reported By</TableHead>
              <TableHead className="text-right">Time</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              Array.from({ length: 5 }).map((_, i) => (
                <TableRow key={i}>
                  <TableCell colSpan={8}>
                    <Skeleton className="h-8" />
                  </TableCell>
                </TableRow>
              ))
            ) : issues.length > 0 ? (
              issues.map((issue) => (
                <TableRow
                  key={issue.id}
                  onClick={() => canResolveIssues && setSelectedIssue(issue)}
                  className={cn(canResolveIssues && "cursor-pointer")}
                >
                  <TableCell>
                    <CategoryDisplay category={issue.category} />
                  </TableCell>
                  <TableCell className="capitalize">{formatSubCategory(issue.subCategory)}</TableCell>
                  <TableCell className="font-medium">{issue.location}</TableCell>
                  <TableCell className="text-sm text-muted-foreground">{issue.title}</TableCell>
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
                    <div className="font-medium">{issue.reportedBy.name}</div>
                  </TableCell>
                  <TableCell className="text-right">
                    <SafeHydrate>
                        <span>{formatDistanceToNow(issue.reportedAt, { addSuffix: true })}</span>
                    </SafeHydrate>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={8} className="h-24 text-center">
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
