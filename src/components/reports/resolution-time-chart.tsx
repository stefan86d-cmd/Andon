"use client"

import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis, Tooltip } from "recharts"

interface ResolutionTimeChartProps {
    data: {
        category: string;
        hours: number;
    }[];
}

export function ResolutionTimeChart({ data }: ResolutionTimeChartProps) {
  return (
    <ResponsiveContainer width="100%" height={350}>
      <BarChart data={data}>
        <XAxis
          dataKey="category"
          stroke="hsl(var(--muted-foreground))"
          fontSize={12}
          tickLine={false}
          axisLine={false}
          tickFormatter={(value) => value.length > 12 ? `${value.substring(0, 12)}...` : value}
        />
        <YAxis
          stroke="hsl(var(--muted-foreground))"
          fontSize={12}
          tickLine={false}
          axisLine={false}
          tickFormatter={(value) => `${value}h`}
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
            formatter={(value, name) => [`${value} hours`, "Avg. Time"]}
        />
        <Bar dataKey="hours" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  )
}
