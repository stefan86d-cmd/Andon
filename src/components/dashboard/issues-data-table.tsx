
"use client";

import type { Issue, Priority, Status, User, IssueCategory } from "@/lib/types";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
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
  Clock,
  User as UserIcon,
} from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { format, formatDistanceToNow, intervalToDuration } from "date-fns";
import { cn } from "@/lib/utils";
import { ResolveIssueDialog } from "./resolve-issue-dialog";
import { useState } from "react";
import { useUser } from "@/contexts/user-context";
import { SafeHydrate } from "../layout/safe-hydrate";
import { Skeleton } from "../ui/skeleton";

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
        <Badge variant={status === 'resolved' ? 'default' : 'secondary'} className={cn(status === 'resolved' ? 'bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300' : '')}>
            <Icon className={cn("h-4 w-4 mr-1", status === 'in_progress' && 'animate-spin')} />
            {label}
        </Badge>
    );
};

function formatDuration(start: Date, end: Date) {
  const duration = intervalToDuration({ start, end });
  
  const parts = [];
  if (duration.days && duration.days > 0) parts.push(`${duration.days}d`);
  if (duration.hours && duration.hours > 0) parts.push(`${duration.hours}h`);
  if (duration.minutes && duration.minutes > 0) parts.push(`${duration.minutes}m`);
  
  if (parts.length > 0) {
    return parts.slice(0, 2).join(' ');
  }
  
  if (duration.seconds && duration.seconds > 0) {
    return `${duration.seconds}s`
  }

  return '0s';
}

const IssueCard = ({ issue, onSelect, canResolve }: { issue: Issue, onSelect: (issue: Issue) => void, canResolve: boolean }) => {
    const PriorityIcon = priorityIcons[issue.priority];
    const categoryInfo = categories[issue.category];
    const CategoryIcon = categoryInfo.icon;
    const isResolved = issue.status === 'resolved';

    return (
        <Card onClick={() => canResolve && onSelect(issue)} className={cn(canResolve && 'cursor-pointer hover:shadow-md transition-shadow')}>
            <CardHeader>
                <div className="flex items-start justify-between gap-4">
                    <div>
                        <CardTitle className="text-lg">{issue.location}</CardTitle>
                        <CardDescription>{issue.title}</CardDescription>
                    </div>
                     <Badge variant="outline" className={`capitalize border-0 ${priorityColors[issue.priority]}`}>
                      <PriorityIcon className="mr-2 h-4 w-4" />
                      {issue.priority}
                    </Badge>
                </div>
            </CardHeader>
            <CardContent className="grid sm:grid-cols-2 md:grid-cols-3 gap-4 text-sm">
                <div className="flex items-center gap-2">
                    <CategoryIcon className={cn("h-5 w-5 text-muted-foreground", categoryInfo.color)} />
                    <div>
                        <p className="font-medium text-muted-foreground">Category</p>
                        <p>{categoryInfo.label} {issue.subCategory && `(${issue.subCategory.replace(/-/g, ' ')})`}</p>
                    </div>
                </div>

                <div className="flex items-center gap-2">
                    <Clock className="h-5 w-5 text-muted-foreground" />
                    <div>
                        <p className="font-medium text-muted-foreground">{isResolved ? 'Resolved At' : 'Reported At'}</p>
                        <SafeHydrate>
                            <p>{format(isResolved ? issue.resolvedAt! : issue.reportedAt, 'PPp')}</p>
                        </SafeHydrate>
                    </div>
                </div>

                <div className="flex items-center gap-2">
                    <UserIcon className="h-5 w-5 text-muted-foreground" />
                    <div>
                        <p className="font-medium text-muted-foreground">{isResolved ? 'Resolved By' : 'Reported By'}</p>
                        <p>{isResolved ? issue.resolvedBy?.name : issue.reportedBy.name}</p>
                    </div>
                </div>
            </CardContent>
            <CardFooter className="flex items-center justify-between">
                <StatusDisplay status={issue.status} />
                 {isResolved && issue.resolvedAt && (
                    <div className="text-sm text-muted-foreground">
                        Resolution Time: <strong>{formatDuration(issue.reportedAt, issue.resolvedAt)}</strong>
                    </div>
                )}
            </CardFooter>
        </Card>
    );
};


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
    <div className="space-y-4">
      <div className="px-4 lg:px-6">
        <h2 className="text-lg font-semibold md:text-xl">{title || (currentUser?.role === 'admin' ? 'Recent Issues' : 'Recent Issues on Your Line')}</h2>
        <p className="text-sm text-muted-foreground">
          {description || (currentUser?.role === 'admin' ? 'A list of recently reported issues on the production line.' : 'Issues reported on your selected line within the last 24 hours.')}
        </p>
      </div>

      <div className="space-y-4">
        {loading ? (
            Array.from({ length: 3 }).map((_, i) => (
                <Card key={i}>
                    <CardHeader><Skeleton className="h-6 w-3/4" /></CardHeader>
                    <CardContent><Skeleton className="h-10 w-full" /></CardContent>
                    <CardFooter><Skeleton className="h-8 w-1/4" /></CardFooter>
                </Card>
            ))
        ) : issues.length > 0 ? (
             issues.map((issue) => (
                <IssueCard 
                    key={issue.id} 
                    issue={issue}
                    onSelect={setSelectedIssue}
                    canResolve={canResolveIssues}
                />
            ))
        ) : (
            <Card>
                <CardContent className="p-6 text-center text-muted-foreground">
                    No issues to display.
                </CardContent>
            </Card>
        )}
      </div>

      {selectedIssue && (
         <ResolveIssueDialog
          isOpen={!!selectedIssue}
          onOpenChange={(isOpen) => !isOpen && setSelectedIssue(null)}
          issue={selectedIssue}
          onIssueUpdate={handleIssueUpdate}
        />
      )}
    </div>
  );
}
