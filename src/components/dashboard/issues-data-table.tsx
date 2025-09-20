
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
  HardHat,
} from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { format, formatDistanceToNow, intervalToDuration } from "date-fns";
import { cn } from "@/lib/utils";
import { ResolveIssueDialog } from "./resolve-issue-dialog";
import { useState } from "react";
import { useUser } from "@/contexts/user-context";
import { SafeHydrate } from "../layout/safe-hydrate";

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
    'assistance': { label: 'Assistance', icon: LifeBuoy, color: 'text-red-500' },
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

function formatDuration(start: Date, end: Date) {
  const duration = intervalToDuration({ start, end });
  
  const parts = [];
  if (duration.days && duration.days > 0) parts.push(`${duration.days}d`);
  if (duration.hours && duration.hours > 0) parts.push(`${duration.hours}h`);
  if (duration.minutes && duration.minutes > 0) parts.push(`${duration.minutes}m`);
  if (duration.seconds && duration.seconds > 0) parts.push(`${duration.seconds}s`);
  
  return parts.length > 0 ? parts.slice(0, 2).join(' ') : '0s';
}

export function IssuesDataTable({ issues, title, description }: { issues: Issue[], title?: string, description?: string }) {
  const { currentUser } = useUser();
  const [selectedIssue, setSelectedIssue] = useState<Issue | null>(null);
  const isResolvedView = issues.length > 0 && issues.every(issue => issue.status === 'resolved');

  const handleIssueUpdate = (updatedIssue: Issue) => {
    // In a real app, this would trigger a re-fetch of the issues data
    console.log("Issue updated:", updatedIssue);
    // For now, we just close the dialog
    setSelectedIssue(null);
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
              <TableHead>Sub-Category</TableHead>
              <TableHead className="min-w-[300px]">Description</TableHead>
              <TableHead>Priority</TableHead>
              <TableHead>Status</TableHead>
              {isResolvedView ? (
                <>
                  <TableHead>Resolved</TableHead>
                  <TableHead>Resolution Time</TableHead>
                  <TableHead>Resolved By</TableHead>
                </>
              ) : (
                <>
                  <TableHead>Reported At</TableHead>
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
                  onClick={() => canResolveIssues && setSelectedIssue(issue)}
                  className={cn(canResolveIssues && 'cursor-pointer')}
                >
                  <TableCell>
                    <div className="flex items-center gap-2">
                        <CategoryIcon className={cn("h-6 w-6", categoryInfo.color)} />
                        <div className="font-medium">{categoryInfo.label}</div>
                    </div>
                  </TableCell>
                  <TableCell>
                    {issue.subCategory && <div className="text-sm capitalize">{issue.subCategory.replace(/-/g, ' ')}</div>}
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
                           {issue.resolvedAt && (
                            <div className="flex flex-col">
                                <SafeHydrate>
                                    <span className="font-medium">{format(issue.resolvedAt, 'PPpp')}</span>
                                    <span className="text-sm text-muted-foreground">{formatDistanceToNow(issue.resolvedAt, { addSuffix: true })}</span>
                                </SafeHydrate>
                            </div>
                           )}
                        </TableCell>
                        <TableCell>
                           {issue.resolvedAt && formatDuration(issue.reportedAt, issue.resolvedAt)}
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
                            <div className="flex flex-col">
                                <SafeHydrate>
                                    <span className="font-medium">{format(issue.reportedAt, 'PPpp')}</span>
                                    <span className="text-sm text-muted-foreground">{formatDistanceToNow(issue.reportedAt, { addSuffix: true })}</span>
                                </SafeHydrate>
                            </div>
                        </TableCell>
                        <TableCell>
                            {issue.reportedBy && (
                            <div className="flex items-center gap-2">
                                <Avatar className="h-8 w-8">
                                    <AvatarImage src={issue.reportedBy.avatarUrl} alt={issue.reportedBy.name} />
                                    <AvatarFallback>{issue.reportedBy.name.charAt(0)}</AvatarFallback>
                                </Avatar>
                                <span>{issue.reportedBy.name}</span>
                            </div>
                            )}
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
