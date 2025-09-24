
"use client"

import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis, Tooltip, Cell, LabelList } from "recharts"

interface FilteredBarChartProps {
    data: {
        name: string;
        value: number;
        fill?: string;
        color?: string;
    }[];
}

export function FilteredBarChart({ data }: FilteredBarChartProps) {
    const defaultFill = "hsl(var(--primary))";

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
        <Bar dataKey="value" radius={[0, 4, 4, 0]}>
            {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.fill || defaultFill} />
            ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  )
}

    