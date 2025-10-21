

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
        <Badge variant="outline" className={cn("capitalize border-0 font-medium", textColor)}>
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

export function IssuesDataTable({ issues, title, description, loading, onIssueUpdate }: { issues: Issue[], title?: string, description?: string, loading?: boolean, onIssueUpdate?: () => void }) {
  const { currentUser } = useUser();
  const [selectedIssue, setSelectedIssue] = useState<Issue | null>(null);
  const router = useRouter();

  const handleIssueUpdate = () => {
    setSelectedIssue(null);
    if (onIssueUpdate) onIssueUpdate();
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
        <div className="space-y-4">
            {loading ? (
                Array.from({ length: 5 }).map((_, i) => (
                    <Card key={i}><CardContent className="p-6"><Skeleton className="h-16" /></CardContent></Card>
                ))
            ) : issues.length > 0 ? (
              issues.map((issue) => {
                const categoryStyle = categoryInfo[issue.category] || categoryInfo.other;
                return (
                <Card 
                    key={issue.id} 
                    onClick={() => canResolveIssues && setSelectedIssue(issue)} 
                    className={cn(
                        "overflow-hidden dark:bg-card-nested", 
                        canResolveIssues && "cursor-pointer hover:bg-muted/50 dark:hover:bg-card-nested/80"
                    )}
                >
                    <div className={cn("h-2 w-full", categoryStyle.bgColor)}></div>
                    <CardContent className="p-4 flex flex-col md:flex-row items-start md:items-center gap-4">
                       <div className="flex-1 space-y-2">
                           <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
                                <CategoryDisplay category={issue.category} />
                                <Badge variant="outline" className={cn(`capitalize border-0 font-medium`, priorityColors[issue.priority])}>
                                    {React.createElement(priorityIcons[issue.priority], { className: "h-4 w-4 mr-1" })}
                                    {issue.priority}
                                </Badge>
                                <StatusDisplay status={issue.status} />
                           </div>
                           <div className="pt-1">
                             <div className="font-medium">{issue.location}</div>
                             <div className="text-sm text-muted-foreground">{issue.title}</div>
                           </div>
                           {(issue.itemNumber || (issue.quantity && issue.quantity > 0)) && (
                                <div className="text-xs text-muted-foreground space-x-2">
                                {issue.itemNumber && <span>Item: <span className="font-semibold">{issue.itemNumber}</span></span>}
                                {issue.quantity && issue.quantity > 0 && <span>Qty: <span className="font-semibold">{issue.quantity}</span></span>}
                                </div>
                            )}
                            {issue.status === 'resolved' && issue.resolutionNotes && (
                                <div className="text-xs text-muted-foreground pt-1 border-l-2 pl-2">
                                <span className="italic">"{issue.resolutionNotes}"</span>
                                {issue.resolvedBy && <span className="text-foreground font-semibold"> - {issue.resolvedBy.name}</span>}
                                </div>
                            )}
                       </div>
                       <div className="w-full md:w-auto flex md:flex-col justify-between items-end text-sm text-muted-foreground text-right space-y-2">
                            <div className="font-medium text-foreground">{issue.reportedBy.name}</div>
                            <SafeHydrate>
                                <span>{formatDistanceToNow(issue.reportedAt, { addSuffix: true })}</span>
                            </SafeHydrate>
                       </div>
                    </CardContent>
                </Card>
              )})
            ) : (
                <div className="h-48 flex items-center justify-center text-muted-foreground">
                    No issues found.
                </div>
            )}
        </div>
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
