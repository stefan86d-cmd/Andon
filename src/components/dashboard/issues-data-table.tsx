

"use client";

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
import { Badge } from "@/components/ui/badge";
import {
  ArrowDownCircle,
  TriangleAlert,
  Flame,
  Siren,
  CircleDotDashed,
  LoaderCircle,
  CheckCircle2,
  Archive,
  Monitor,
  Truck,
  Wrench,
  HelpCircle,
  LifeBuoy,
  BadgeCheck,
} from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { formatDistanceToNow } from "date-fns";
import { users } from "@/lib/data";
import { cn } from "@/lib/utils";
import { ResolveIssueDialog } from "./resolve-issue-dialog";
import { useState } from "react";

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

const statusLabels: Record<Status, string> = {
    reported: "Reported",
    in_progress: "In Progress",
    resolved: "Resolved",
    archived: "Archived",
};

const categories: Record<IssueCategory, { label: string, icon: React.ElementType, color: string }> = {
    'it': { label: 'It & Network', icon: Monitor, color: 'text-blue-500' },
    'logistics': { label: 'Logistics', icon: Truck, color: 'text-orange-500' },
    'tool': { label: 'Tool & Equipment', icon: Wrench, color: 'text-gray-500' },
    'assistance': { label: 'Need Assistance', icon: LifeBuoy, color: 'text-red-500' },
    'quality': { label: 'Quality', icon: BadgeCheck, color: 'text-green-500' },
    'other': { label: 'Other', icon: HelpCircle, color: 'text-purple-500' },
};

const StatusDisplay = ({ status }: { status: Status }) => {
    const Icon = statusIcons[status];
    const label = statusLabels[status];
    const color = status === 'resolved' ? 'text-green-500' : 'text-muted-foreground';

    return (
        <div className={cn("flex items-center gap-2", color)}>
            <Icon className={cn("h-4 w-4", status === 'in_progress' && 'animate-spin')} />
            {label}
        </div>
    );
};


export function IssuesDataTable({ issues, title, description }: { issues: Issue[], title?: string, description?: string }) {
  const currentUser = users.operator;
  const [selectedIssue, setSelectedIssue] = useState<Issue | null>(null);
  const isResolvedView = issues.length > 0 && issues.every(issue => issue.status === 'resolved');

  const handleIssueUpdate = (updatedIssue: Issue) => {
    // In a real app, this would trigger a re-fetch of the issues data
    console.log("Issue updated:", updatedIssue);
    // For now, we just close the dialog
    setSelectedIssue(null);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>{title || (currentUser.role === 'admin' ? 'Recent Issues' : 'Recent Issues on Your Line')}</CardTitle>
        <CardDescription>
          {description || (currentUser.role === 'admin' ? 'A list of recently reported issues on the production line.' : 'Issues reported on your assigned production line.')}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Category</TableHead>
              <TableHead className="min-w-[300px]">Description</TableHead>
              <TableHead>Priority</TableHead>
              <TableHead>Status</TableHead>
              {isResolvedView ? (
                <>
                  <TableHead>Resolved</TableHead>
                  <TableHead>Resolved By</TableHead>
                </>
              ) : (
                <>
                  <TableHead>Reported</TableHead>
                  <TableHead>Reported By</TableHead>
                </>
              )}
            </TableRow>
          </TableHeader>
          <TableBody>
            {issues.map((issue) => {
              const PriorityIcon = priorityIcons[issue.priority];
              const categoryInfo = categories[issue.category];
              const CategoryIcon = categoryInfo.icon;
              return (
                <TableRow 
                  key={issue.id} 
                  onClick={() => currentUser.role === 'admin' && setSelectedIssue(issue)}
                  className={cn(currentUser.role === 'admin' && 'cursor-pointer')}
                >
                  <TableCell>
                    <div className="flex items-center gap-2">
                        <CategoryIcon className={cn("h-6 w-6", categoryInfo.color)} />
                        <span className="font-medium">{categoryInfo.label}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="font-medium">{issue.title}</div>
                    <div className="text-sm text-muted-foreground">{issue.location}</div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className={`capitalize border-0 ${priorityColors[issue.priority]}`}>
                      <PriorityIcon className="mr-2 h-4 w-4" />
                      {issue.priority}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <StatusDisplay status={issue.status} />
                  </TableCell>
                  {isResolvedView ? (
                     <>
                        <TableCell>
                            {issue.resolvedAt && formatDistanceToNow(issue.resolvedAt, { addSuffix: true })}
                        </TableCell>
                        <TableCell>
                           {issue.resolvedBy && (
                             <div className="flex items-center gap-2">
                                <Avatar className="h-8 w-8">
                                    <AvatarImage src={issue.resolvedBy.avatarUrl} alt={issue.resolvedBy.name} />
                                    <AvatarFallback>{issue.resolvedBy.name.charAt(0)}</AvatarFallback>
                                </Avatar>
                                <span>{issue.resolvedBy.name}</span>
                            </div>
                           )}
                        </TableCell>
                    </>
                  ) : (
                    <>
                        <TableCell>
                            {formatDistanceToNow(issue.reportedAt, { addSuffix: true })}
                        </TableCell>
                        <TableCell>
                            <div className="flex items-center gap-2">
                                <Avatar className="h-8 w-8">
                                    <AvatarImage src={issue.reportedBy.avatarUrl} alt={issue.reportedBy.name} />
                                    <AvatarFallback>{issue.reportedBy.name.charAt(0)}</AvatarFallback>
                                </Avatar>
                                <span>{issue.reportedBy.name}</span>
                            </div>
                        </TableCell>
                    </>
                  )}
                </TableRow>
              );
            })}
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
