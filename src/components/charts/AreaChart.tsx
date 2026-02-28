"use client";

import {
  AreaChart as RechartsAreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

export interface AreaChartSeries {
  dataKey: string;
  name: string;
  color: string;
}

interface AreaChartProps {
  data: Record<string, unknown>[];
  xAxisKey: string;
  series: AreaChartSeries[];
  title?: string;
  height?: number;
  showLegend?: boolean;
  showGrid?: boolean;
}

export default function AreaChart({
  data,
  xAxisKey,
  series,
  title,
  height = 400,
  showLegend = true,
  showGrid = true,
}: AreaChartProps) {
  return (
    <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
      {title && (
        <h3 className="mb-4 text-lg font-semibold text-gray-800">{title}</h3>
      )}
      <ResponsiveContainer width="100%" height={height}>
        <RechartsAreaChart data={data} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
          {showGrid && <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />}
          <XAxis dataKey={xAxisKey} tick={{ fontSize: 12 }} />
          <YAxis tick={{ fontSize: 12 }} />
          <Tooltip
            contentStyle={{
              borderRadius: "8px",
              border: "1px solid #e5e7eb",
              boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
            }}
          />
          {showLegend && <Legend />}
          {series.map((s) => (
            <Area
              key={s.dataKey}
              type="monotone"
              dataKey={s.dataKey}
              name={s.name}
              stroke={s.color}
              fill={s.color}
              fillOpacity={0.15}
              strokeWidth={2}
            />
          ))}
        </RechartsAreaChart>
      </ResponsiveContainer>
    </div>
  );
}
