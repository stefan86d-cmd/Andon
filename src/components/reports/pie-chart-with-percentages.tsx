
"use client";

import React from "react";
import {
  PieChart,
  Pie,
  Tooltip,
  Cell,
  Legend,
  ResponsiveContainer,
  TooltipProps,
} from "recharts";

interface PieDataItem {
  name: string;
  value: number;
  percentage: number;
  color?: string;
  fill?: string;
}

interface PieChartWithPercentagesProps {
  data: PieDataItem[];
}

const RADIAN = Math.PI / 180;

// Label inside pie slices
const renderCustomizedLabel = ({
  cx,
  cy,
  midAngle,
  innerRadius,
  outerRadius,
  percent,
}: {
  cx: number;
  cy: number;
  midAngle: number;
  innerRadius: number;
  outerRadius: number;
  percent: number;
}) => {
  const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
  const x = cx + radius * Math.cos(-midAngle * RADIAN);
  const y = cy + radius * Math.sin(-midAngle * RADIAN);

  if (percent < 0.05) return null; // Skip tiny slices

  return (
    <text
      x={x}
      y={y}
      fill="white"
      textAnchor={x > cx ? "start" : "end"}
      dominantBaseline="central"
      className="text-xs font-bold"
    >
      {`${(percent * 100).toFixed(0)}%`}
    </text>
  );
};

// Custom legend below the chart
const CustomLegend = ({
  payload,
}: {
  payload?: { color?: string; value: string }[];
}) => {
  if (!payload) return null;

  return (
    <ul className="flex justify-center flex-wrap gap-x-4 gap-y-2 mt-4">
      {payload.map((entry, index) => (
        <li key={`item-${index}`} className="flex items-center text-sm">
          <span
            className="w-3 h-3 rounded-full mr-2"
            style={{ backgroundColor: entry.color }}
          />
          <span>{entry.value}</span>
        </li>
      ))}
    </ul>
  );
};

// Custom Tooltip Content to handle types safely
const CustomTooltip = ({ active, payload }: TooltipProps<number, string>) => {
    if (active && payload && payload.length) {
        const data = payload[0].payload as PieDataItem;
        const value = payload[0].value;
        const name = payload[0].name;

        return (
            <div className="p-2 bg-background border rounded-md shadow-sm">
                <p className="font-bold">{`${name}`}</p>
                <p className="text-sm">{`Count: ${value} (${data.percentage.toFixed(1)}%)`}</p>
            </div>
        );
    }
    return null;
};


export function PieChartWithPercentages({ data }: PieChartWithPercentagesProps) {
  const defaultColor = "hsl(var(--primary))";

  return (
    <ResponsiveContainer width="100%" height={350}>
      <PieChart>
        <Tooltip content={<CustomTooltip />} />
        <Legend content={<CustomLegend />} verticalAlign="bottom" />
        <Pie
          data={data}
          cx="50%"
          cy="50%"
          labelLine={false}
          label={renderCustomizedLabel}
          outerRadius={120}
          dataKey="value"
          nameKey="name"
        >
          {data.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={entry.fill || entry.color || defaultColor} />
          ))}
        </Pie>
      </PieChart>
    </ResponsiveContainer>
  );
}
