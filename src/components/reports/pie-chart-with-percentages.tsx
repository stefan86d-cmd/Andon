
"use client"

import { Pie, PieChart, ResponsiveContainer, Tooltip, Cell, Legend } from "recharts"

interface PieChartWithPercentagesProps {
    data: {
        name: string;
        value: number;
        percentage: number;
        fill?: string;
        color?: string;
    }[];
}

const RADIAN = Math.PI / 180;
const renderCustomizedLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent, index, name }: any) => {
    const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
    const x = cx + radius * Math.cos(-midAngle * RADIAN);
    const y = cy + radius * Math.sin(-midAngle * RADIAN);

    if (percent < 0.05) return null;

    return (
        <text x={x} y={y} fill="white" textAnchor={x > cx ? 'start' : 'end'} dominantBaseline="central">
            {`${(percent * 100).toFixed(0)}%`}
        </text>
    );
};

const CustomLegend = (props: any) => {
    const { payload } = props;
    return (
        <ul className="flex justify-center flex-wrap gap-x-4 gap-y-2 mt-4">
            {
                payload.map((entry: any, index: number) => {
                    const { dataKey, color } = entry.payload;
                    return (
                        <li key={`item-${index}`} className="flex items-center text-sm">
                            <span className="w-3 h-3 rounded-full mr-2" style={{backgroundColor: color}}></span>
                            <span>{entry.value}</span>
                        </li>
                    )
                })
            }
        </ul>
    )
}

export function PieChartWithPercentages({ data }: PieChartWithPercentagesProps) {
    const defaultFill = "hsl(var(--primary))";

    return (
        <ResponsiveContainer width="100%" height={350}>
            <PieChart>
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
                    formatter={(value: number, name: string, props: { payload: any }) => {
                        return [`${props.payload.value} (${props.payload.percentage.toFixed(1)}%)`, name];
                    }}
                />
                 <Legend content={<CustomLegend />} verticalAlign="bottom" />
                <Pie
                    data={data}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={renderCustomizedLabel}
                    outerRadius={120}
                    fill="#8884d8"
                    dataKey="value"
                    nameKey="name"
                >
                    {data.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.fill || defaultFill} stroke={entry.color} />
                    ))}
                </Pie>
            </PieChart>
        </ResponsiveContainer>
    )
}
