import type { StatCard } from "@/lib/types";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ArrowUp, ArrowDown } from "lucide-react";
import { cn } from "@/lib/utils";

export function StatsCards({ stats }: { stats: StatCard[] }) {
  return (
    <div className="grid gap-4 md:grid-cols-2 md:gap-8 lg:grid-cols-4">
      {stats.map((stat) => (
        <Card key={stat.title}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
            {stat.changeType === "increase" ? (
              <ArrowUp
                className={cn(
                  "h-4 w-4 text-muted-foreground",
                  stat.title === "Critical Alerts" || stat.title === "Open Issues" ? "text-red-500" : "text-green-500"
                )}
              />
            ) : (
              <ArrowDown className="h-4 w-4 text-green-500" />
            )}
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stat.value}</div>
            <p className="text-xs text-muted-foreground">
              <span
                className={cn(
                  stat.title === "Critical Alerts" || stat.title === "Open Issues" ? "text-red-500" : "text-green-500"
                )}
              >
                {stat.change}
              </span>{" "}
              {stat.description}
            </p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
