
"use client";

import React, { useState } from "react";
import type { Issue, Priority, Status, IssueCategory } from "@/lib/types";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { MoreHorizontal, ArrowDownCircle, TriangleAlert, Flame, Siren, CircleDotDashed, LoaderCircle, CheckCircle2, Archive, Monitor, Truck, Wrench, BadgeCheck, LifeBuoy, HelpCircle } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { formatDistanceToNow } from "date-fns";
import { cn } from "@/lib/utils";
import { ResolveIssueDialog } from "./resolve-issue-dialog";
import { useUser } from "@/contexts/user-context";
import { SafeHydrate } from "../layout/safe-hydrate";
import { Skeleton } from "../ui/skeleton";
import { Avatar, AvatarFallback } from "../ui/avatar";

const categoryInfo: Record<IssueCategory, { label: string; icon: React.ElementType, textColor: string, borderColor: string }> = {
    it: { label: 'IT & Network', icon: Monitor, textColor: 'text-blue-500', borderColor: 'border-blue-500' },
    logistics: { label: 'Logistics', icon: Truck, textColor: 'text-orange-500', borderColor: 'border-orange-500' },
    tool: { label: 'Tool & Equipment', icon: Wrench, textColor: 'text-gray-500', borderColor: 'border-gray-500' },
    quality: { label: 'Quality', icon: BadgeCheck, textColor: 'text-green-500', borderColor: 'border-green-500' },
    assistance: { label: 'Need Assistance', icon: LifeBuoy, textColor: 'text-red-500', borderColor: 'border-red-500' },
    other: { label: 'Other', icon: HelpCircle, textColor: 'text-purple-500', borderColor: 'border-purple-500' },
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

const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('');
}


export function IssuesGrid({ issues, title, description, loading, onIssueUpdate }: { issues: Issue[], title?: string, description?: string, loading?: boolean, onIssueUpdate?: () => void }) {
  const { currentUser } = useUser();
  const [selectedIssue, setSelectedIssue] = useState<Issue | null>(null);

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
        {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {Array.from({ length: 3 }).map((_, i) => (
                    <Card key={i}><CardContent className="p-6"><Skeleton className="h-48" /></CardContent></Card>
                ))}
            </div>
        ) : issues.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {issues.map((issue) => {
                const categoryStyle = categoryInfo[issue.category] || categoryInfo.other;
                return (
                    <Card 
                        key={issue.id} 
                        onClick={() => canResolveIssues && setSelectedIssue(issue)} 
                        className={cn(
                            "flex flex-col dark:bg-[--card-nested] dark:shadow-md border-2", 
                            categoryStyle.borderColor,
                            canResolveIssues && "cursor-pointer hover:bg-muted/50 dark:hover:bg-card-nested/80"
                        )}
                    >
                        <CardHeader>
                            <div className="flex items-center justify-between">
                                <CategoryDisplay category={issue.category} />
                                <StatusDisplay status={issue.status} />
                            </div>
                        </CardHeader>
                      <CardContent className="flex-1 space-y-3">
                        <div className="font-medium">{issue.location}</div>
                        <p className="text-sm text-muted-foreground">{issue.title}</p>
                        
                         {(issue.itemNumber || (issue.quantity && issue.quantity > 0)) && (
                            <div className="text-xs text-muted-foreground pt-2 space-x-4">
                               {issue.itemNumber && <span>Item: <span className="font-semibold text-foreground">{issue.itemNumber}</span></span>}
                               {issue.quantity && issue.quantity > 0 && <span>Qty: <span className="font-semibold text-foreground">{issue.quantity}</span></span>}
                            </div>
                        )}
                      </CardContent>
                      <CardFooter className="flex justify-between items-center text-sm text-muted-foreground border-t pt-4">
                         <div className="flex items-center gap-2">
                            <Badge variant="outline" className={cn(`capitalize border-0 font-medium`, priorityColors[issue.priority])}>
                                {React.createElement(priorityIcons[issue.priority], { className: "h-4 w-4" })}
                            </Badge>
                            <span>{issue.reportedBy.name}</span>
                        </div>
                        <SafeHydrate>
                            <span>{formatDistanceToNow(issue.reportedAt, { addSuffix: true })}</span>
                        </SafeHydrate>
                      </CardFooter>
                    </Card>
                )
              })}
            </div>
        ) : (
            <div className="h-48 flex items-center justify-center text-muted-foreground">
                No issues found.
            </div>
        )}
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
