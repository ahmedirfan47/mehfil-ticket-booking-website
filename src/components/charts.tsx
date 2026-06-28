"use client";

import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

const PRIMARY = "#5B3DF5";
const PALETTE = ["#5B3DF5", "#FF6B4A", "#0FAE7E", "#F5A623", "#9B6DFF", "#3DA5F5"];

export function RevenueArea({
  data,
}: {
  data: { label: string; value: number }[];
}) {
  return (
    <ResponsiveContainer width="100%" height={260}>
      <AreaChart data={data} margin={{ top: 8, right: 8, bottom: 0, left: -16 }}>
        <defs>
          <linearGradient id="rev" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={PRIMARY} stopOpacity={0.35} />
            <stop offset="100%" stopColor={PRIMARY} stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke="#ECEAF3" vertical={false} />
        <XAxis dataKey="label" tickLine={false} axisLine={false} fontSize={12} stroke="#6B6580" />
        <YAxis tickLine={false} axisLine={false} fontSize={12} stroke="#6B6580" />
        <Tooltip
          contentStyle={{
            borderRadius: 12,
            border: "1px solid #ECEAF3",
            fontSize: 13,
          }}
          formatter={(v: number) => [`Rs ${v.toLocaleString("en-PK")}`, "Revenue"]}
        />
        <Area type="monotone" dataKey="value" stroke={PRIMARY} strokeWidth={2.5} fill="url(#rev)" />
      </AreaChart>
    </ResponsiveContainer>
  );
}

export function SalesBars({
  data,
}: {
  data: { label: string; value: number }[];
}) {
  return (
    <ResponsiveContainer width="100%" height={260}>
      <BarChart data={data} margin={{ top: 8, right: 8, bottom: 0, left: -16 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#ECEAF3" vertical={false} />
        <XAxis dataKey="label" tickLine={false} axisLine={false} fontSize={12} stroke="#6B6580" />
        <YAxis tickLine={false} axisLine={false} fontSize={12} stroke="#6B6580" />
        <Tooltip
          cursor={{ fill: "#F4F2FE" }}
          contentStyle={{ borderRadius: 12, border: "1px solid #ECEAF3", fontSize: 13 }}
        />
        <Bar dataKey="value" radius={[6, 6, 0, 0]} fill={PRIMARY} />
      </BarChart>
    </ResponsiveContainer>
  );
}

export function CategoryPie({
  data,
}: {
  data: { label: string; value: number }[];
}) {
  return (
    <ResponsiveContainer width="100%" height={260}>
      <PieChart>
        <Pie
          data={data}
          dataKey="value"
          nameKey="label"
          innerRadius={56}
          outerRadius={92}
          paddingAngle={3}
        >
          {data.map((_, i) => (
            <Cell key={i} fill={PALETTE[i % PALETTE.length]} />
          ))}
        </Pie>
        <Tooltip contentStyle={{ borderRadius: 12, border: "1px solid #ECEAF3", fontSize: 13 }} />
      </PieChart>
    </ResponsiveContainer>
  );
}