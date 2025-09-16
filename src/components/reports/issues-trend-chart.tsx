"use client"

import { Line, LineChart, ResponsiveContainer, XAxis, YAxis, Tooltip } from "recharts"

interface IssuesTrendChartProps {
    data: {
        date: string;
        issues: number;
    }[];
}

export function IssuesTrendChart({ data }: IssuesTrendChartProps) {
  return (
    <ResponsiveContainer width="100%" height={350}>
      <LineChart data={data}>
        <XAxis
          dataKey="date"
          stroke="hsl(var(--muted-foreground))"
          fontSize={12}
          tickLine={false}
          axisLine={false}
        />
        <YAxis
          stroke="hsl(var(--muted-foreground))"
          fontSize={12}
          tickLine={false}
          axisLine={false}
          allowDecimals={false}
        />
        <Tooltip
            contentStyle={{
                background: "hsl(var(--background))",
                borderColor: "hsl(var(--border))",
            }}
             labelStyle={{
                color: "hsl(var(--foreground))",
            }}
            itemStyle={{
                color: "hsl(var(--foreground))",
            }}
            formatter={(value, name) => [value, "Issues"]}
        />
        <Line type="monotone" dataKey="issues" stroke="hsl(var(--primary))" strokeWidth={2} dot={false} />
      </LineChart>
    </ResponsiveContainer>
  )
}
