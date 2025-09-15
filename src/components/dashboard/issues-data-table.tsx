import type { Issue, Priority, Status } from "@/lib/types";
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
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import {
  MoreHorizontal,
  ArrowDownCircle,
  TriangleAlert,
  Flame,
  Siren,
  CircleDotDashed,
  LoaderCircle,
  CheckCircle2,
  Archive,
} from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { formatDistanceToNow } from "date-fns";

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

const StatusSelector = ({ status }: { status: Status }) => (
  <Select defaultValue={status}>
    <SelectTrigger className="w-36 h-8 text-xs focus:ring-0 focus:ring-offset-0 border-0 shadow-none bg-transparent">
      <SelectValue placeholder="Status" />
    </SelectTrigger>
    <SelectContent>
      {Object.entries(statusLabels).map(([key, label]) => {
        const Icon = statusIcons[key as Status];
        return (
          <SelectItem key={key} value={key}>
            <div className="flex items-center gap-2">
              <Icon className="h-4 w-4" />
              {label}
            </div>
          </SelectItem>
        );
      })}
    </SelectContent>
  </Select>
);


export function IssuesDataTable({ issues }: { issues: Issue[] }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Recent Issues</CardTitle>
        <CardDescription>
          A list of recently reported issues on the production line.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Issue ID</TableHead>
              <TableHead className="min-w-[300px]">Description</TableHead>
              <TableHead>Priority</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Reported</TableHead>
              <TableHead>Reported By</TableHead>
              <TableHead>
                <span className="sr-only">Actions</span>
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {issues.map((issue) => {
              const PriorityIcon = priorityIcons[issue.priority];
              return (
                <TableRow key={issue.id}>
                  <TableCell className="font-medium">{issue.id}</TableCell>
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
                    <StatusSelector status={issue.status} />
                  </TableCell>
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
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
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
                        <DropdownMenuItem>View Details</DropdownMenuItem>
                        <DropdownMenuItem>Assign</DropdownMenuItem>
                        <DropdownMenuItem>Archive</DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
