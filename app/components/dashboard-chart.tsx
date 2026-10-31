"use client";

import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import { DailySales } from "@/lib/loyverse/types";

interface DashboardChartProps {
  data: DailySales[];
}

const money = new Intl.NumberFormat("en-PH", {
  style: "currency",
  currency: "PHP",
  maximumFractionDigits: 2,
});

export default function DashboardChart({
  data,
}: DashboardChartProps) {
  const chartData = data.slice(-30);

  return (
    <div className="h-[360px] w-full">
      <ResponsiveContainer
        width="100%"
        height="100%"
      >
        <AreaChart
          data={chartData}
          margin={{
            top: 10,
            right: 10,
            left: 0,
            bottom: 0,
          }}
        >
          <defs>
            <linearGradient
              id="salesGradient"
              x1="0"
              y1="0"
              x2="0"
              y2="1"
            >
              <stop
                offset="5%"
                stopColor="#92400e"
                stopOpacity={0.35}
              />

              <stop
                offset="95%"
                stopColor="#92400e"
                stopOpacity={0}
              />
            </linearGradient>
          </defs>

          <CartesianGrid
            strokeDasharray="4 4"
            vertical={false}
            stroke="#e7e5e4"
          />

          <XAxis
            dataKey="date"
            axisLine={false}
            tickLine={false}
            tick={{
              fontSize: 12,
              fill: "#78716c",
            }}
          />

          <YAxis
            axisLine={false}
            tickLine={false}
            tick={{
              fontSize: 12,
              fill: "#78716c",
            }}
            tickFormatter={(value) =>
              `₱${Number(value).toLocaleString()}`
            }
          />

          <Tooltip
            formatter={(value) => [
              money.format(Number(value)),
              "Net sales",
            ]}
            labelFormatter={(label) =>
              `Date: ${label}`
            }
            contentStyle={{
              borderRadius: "16px",
              border: "1px solid #e7e5e4",
            }}
          />

          <Area
            type="monotone"
            dataKey="netSales"
            stroke="#92400e"
            strokeWidth={3}
            fill="url(#salesGradient)"
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}