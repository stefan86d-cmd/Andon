
"use client"

import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis, Tooltip, LabelList } from "recharts"

interface FilteredBarChartProps {
    data: {
        name: string;
        value: number;
    }[];
}

export function FilteredBarChart({ data }: FilteredBarChartProps) {
  return (
    <ResponsiveContainer width="100%" height={350}>
      <BarChart data={data} layout="vertical" margin={{ left: 20, right: 40}}>
        <XAxis
          type="number"
          stroke="hsl(var(--muted-foreground))"
          fontSize={12}
          tickLine={false}
          axisLine={false}
          allowDecimals={false}
        />
        <YAxis
          dataKey="name"
          type="category"
          stroke="hsl(var(--muted-foreground))"
          fontSize={12}
          tickLine={false}
          axisLine={false}
          tickFormatter={(value) => value.length > 20 ? `${value.substring(0, 20)}...` : value}
          width={150}
        />
        <Tooltip
            cursor={{ fill: 'hsl(var(--accent))' }}
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
        />
        <Bar dataKey="value" fill="hsl(var(--primary))" radius={[0, 4, 4, 0]}>
            <LabelList dataKey="value" position="right" offset={8} className="fill-foreground text-sm" />
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  )
}

    