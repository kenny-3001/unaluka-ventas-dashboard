"use client";

import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from "recharts";

function formatSoles(value: number | undefined) {
  return `S/ ${(value ?? 0).toLocaleString("es-PE", { maximumFractionDigits: 0 })}`;
}

export default function VendorChart({
  data,
}: {
  data: { vendedor: string; total: number }[];
}) {
  return (
    <ResponsiveContainer width="100%" height={300}>
      <BarChart
        data={data}
        layout="vertical"
        margin={{ top: 10, right: 30, left: 10, bottom: 0 }}
      >
        <CartesianGrid strokeDasharray="3 3" stroke="#e1e0d9" horizontal={false} />
        <XAxis
          type="number"
          fontSize={12}
          stroke="#898781"
          tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`}
        />
        <YAxis
          type="category"
          dataKey="vendedor"
          width={150}
          fontSize={12}
          stroke="#52514e"
        />
        <Tooltip
          formatter={(value) => formatSoles(Number(value))}
          contentStyle={{ borderColor: "#e1e0d9", fontSize: 13 }}
          labelStyle={{ color: "#0b0b0b" }}
          cursor={{ fill: "#f0efec" }}
        />
        <Bar dataKey="total" fill="#2a78d6" radius={[0, 4, 4, 0]} />
      </BarChart>
    </ResponsiveContainer>
  );
}
