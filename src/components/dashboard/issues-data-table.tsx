

"use client";

import React from "react";
import type { Issue, Priority, Status, User, IssueCategory, ProductionLine } from "@/lib/types";
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
import { MoreHorizontal, ArrowDownCircle, TriangleAlert, Flame, Siren, CircleDotDashed, LoaderCircle, CheckCircle2, Archive, Monitor, Truck, Wrench, BadgeCheck, LifeBuoy, HelpCircle, Factory } from "lucide-react";
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

const CategoryDisplay = ({ category, subCategory }: { category: IssueCategory, subCategory?: string }) => {
    const { icon: Icon, label, textColor } = categoryInfo[category] || categoryInfo.other;
    const formatSubCategory = (subCategory?: string) => {
        if (!subCategory) return null;
        return subCategory.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
    };

    return (
        <div>
            <div className={cn("capitalize font-medium flex items-center", textColor)}>
                <Icon className="mr-2 h-4 w-4" />
                {label}
            </div>
            {subCategory && <div className="text-xs text-muted-foreground ml-6 capitalize">{formatSubCategory(subCategory)}</div>}
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

export function IssuesDataTable({ issues, title, description, loading, onIssueUpdate, productionLines }: { issues: Issue[], title?: string, description?: string, loading?: boolean, onIssueUpdate?: () => void, productionLines: ProductionLine[] }) {
  const { currentUser } = useUser();
  const [selectedIssue, setSelectedIssue] = useState<Issue | null>(null);
  const router = useRouter();

  const handleIssueUpdate = () => {
    setSelectedIssue(null);
    if (onIssueUpdate) onIssueUpdate();
  };
  
  const canResolveIssues = currentUser?.role === 'admin' || currentUser?.role === 'supervisor';

  const CardComponent = title ? Card : 'div';
  const CardHeaderComponent = title ? CardHeader : 'div';
  const CardTitleComponent = title ? CardTitle : 'div';
  const CardDescriptionComponent = title ? CardDescription : 'div';
  const CardContentComponent = title ? CardContent : 'div';
  
  const getLineName = (lineId: string) => {
    return productionLines.find(line => line.id === lineId)?.name || 'N/A';
  }

  return (
    <CardComponent>
      {title && (
        <CardHeaderComponent>
          <CardTitleComponent>{title}</CardTitleComponent>
          {description && <CardDescriptionComponent>{description}</CardDescriptionComponent>}
        </CardHeaderComponent>
      )}
      <CardContentComponent className={!title ? 'p-0' : ''}>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Category</TableHead>
              <TableHead>Issue</TableHead>
              <TableHead>Line</TableHead>
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
                  <TableCell colSpan={7}>
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
                    <CategoryDisplay category={issue.category} subCategory={issue.subCategory} />
                  </TableCell>
                  <TableCell>
                    <div className="font-medium">{issue.title}</div>
                    <div className="text-sm text-muted-foreground">{issue.location}</div>
                    {(issue.itemNumber || (issue.quantity && issue.quantity > 0)) && (
                        <div className="text-xs text-muted-foreground pt-1 space-x-4">
                           {issue.itemNumber && <span>Item: <span className="font-semibold text-foreground">{issue.itemNumber}</span></span>}
                           {issue.quantity && issue.quantity > 0 && <span>Qty: <span className="font-semibold text-foreground">{issue.quantity}</span></span>}
                        </div>
                    )}
                  </TableCell>
                   <TableCell>
                    <div className="flex items-center gap-2">
                      <Factory className="h-4 w-4 text-muted-foreground"/>
                      <span>{getLineName(issue.productionLineId)}</span>
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
                <TableCell colSpan={7} className="h-24 text-center">
                  No issues found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </CardContentComponent>
       {selectedIssue && (
         <ResolveIssueDialog
          isOpen={!!selectedIssue}
          onOpenChange={(isOpen) => !isOpen && setSelectedIssue(null)}
          issue={selectedIssue}
          onIssueUpdate={handleIssueUpdate}
        />
      )}
    </CardComponent>
  );
}
