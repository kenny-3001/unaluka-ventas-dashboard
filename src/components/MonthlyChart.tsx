"use client";

import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from "recharts";

const MESES: Record<string, string> = {
  "01": "Ene",
  "02": "Feb",
  "03": "Mar",
  "04": "Abr",
  "05": "May",
  "06": "Jun",
  "07": "Jul",
  "08": "Ago",
  "09": "Sep",
  "10": "Oct",
  "11": "Nov",
  "12": "Dic",
};

function formatMes(mes: string) {
  const [, mm] = mes.split("-");
  return MESES[mm] ?? mes;
}

function formatSoles(value: number | undefined) {
  return `S/ ${(value ?? 0).toLocaleString("es-PE", { maximumFractionDigits: 0 })}`;
}

export default function MonthlyChart({
  data,
}: {
  data: { mes: string; total: number }[];
}) {
  const chartData = data.map((d) => ({ ...d, label: formatMes(d.mes) }));

  return (
    <ResponsiveContainer width="100%" height={260}>
      <LineChart data={chartData} margin={{ top: 10, right: 20, left: 10, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#e1e0d9" />
        <XAxis dataKey="label" fontSize={12} stroke="#898781" />
        <YAxis
          fontSize={12}
          stroke="#898781"
          tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`}
        />
        <Tooltip
          formatter={(value) => formatSoles(Number(value))}
          contentStyle={{ borderColor: "#e1e0d9", fontSize: 13 }}
          labelStyle={{ color: "#0b0b0b" }}
        />
        <Line
          type="monotone"
          dataKey="total"
          stroke="#2a78d6"
          strokeWidth={2}
          dot={{ r: 3, fill: "#2a78d6" }}
          activeDot={{ r: 5 }}
        />
      </LineChart>
    </ResponsiveContainer>
  );
}
