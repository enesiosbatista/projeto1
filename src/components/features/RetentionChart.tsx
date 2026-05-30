import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ReferenceLine,
  ResponsiveContainer,
} from "recharts";
import type { RetentionPoint } from "@/types/database";

interface Props {
  data: RetentionPoint[];
}

export function RetentionChart({ data }: Props) {
  const hasData = data && data.length > 0;

  // Maior queda
  const dropIndex = hasData
    ? data.reduce(
        (maxIdx, _, i) =>
          i < data.length - 1 &&
          data[i].retention - data[i + 1].retention >
            data[maxIdx].retention - data[maxIdx + 1].retention
            ? i
            : maxIdx,
        0,
      )
    : 0;

  // Pico após ponto 5
  const peakIndex =
    hasData && data.length > 5
      ? data
          .slice(5)
          .reduce(
            (maxIdx, item, i) => (item.retention > data[5 + maxIdx].retention ? i : maxIdx),
            0,
          ) + 5
      : 0;

  return (
    <div className="mb-6 rounded-xl border border-zinc-800 bg-zinc-900 p-4">
      <ResponsiveContainer width="100%" height={220}>
        <AreaChart data={data} margin={{ top: 15, right: 15, left: -20, bottom: 5 }}>
          <defs>
            <linearGradient id="retentionGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#7C3AED" stopOpacity={0.3} />
              <stop offset="95%" stopColor="#7C3AED" stopOpacity={0} />
            </linearGradient>
          </defs>

          <CartesianGrid horizontal={true} vertical={false} stroke="#27272A" />

          <XAxis
            dataKey="second"
            tickFormatter={(v) => v + "s"}
            stroke="#52525B"
            tick={{ fontSize: 11 }}
          />

          <YAxis
            domain={[0, 100]}
            tickFormatter={(v) => v + "%"}
            stroke="#52525B"
            tick={{ fontSize: 11 }}
          />

          <Tooltip
            contentStyle={{
              backgroundColor: "#18181B",
              border: "1px solid #3F3F46",
              borderRadius: "8px",
              fontSize: "11px",
              color: "#F4F4F5",
            }}
          />

          <Area
            type="monotone"
            dataKey="retention"
            stroke="#7C3AED"
            strokeWidth={2}
            fill="url(#retentionGradient)"
          />

          {hasData && data[dropIndex] && (
            <ReferenceLine
              x={data[dropIndex].second}
              stroke="#F59E0B"
              strokeDasharray="3 3"
              label={{
                value: "⚠ Queda",
                fill: "#FBBF24",
                fontSize: 10,
                position: "top",
              }}
            />
          )}

          {hasData && data[peakIndex] && (
            <ReferenceLine
              x={data[peakIndex].second}
              stroke="#22C55E"
              strokeDasharray="3 3"
              label={{
                value: "📈 Pico",
                fill: "#22C55E",
                fontSize: 10,
                position: "top",
              }}
            />
          )}
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
