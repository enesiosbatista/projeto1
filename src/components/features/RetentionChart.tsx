import {
  Area,
  AreaChart,
  CartesianGrid,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import type { RetentionPoint } from '@/types/database';

interface Props {
  data: RetentionPoint[];
}

function CustomTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-lg border border-zinc-700 bg-zinc-900 px-3 py-2 text-xs">
      <div className="font-mono text-zinc-400">{label}s</div>
      <div className="font-mono text-primary">{payload[0].value}% retenção</div>
    </div>
  );
}

export function RetentionChart({ data }: Props) {
  // Find biggest drop (>15% in one step)
  let dropIndex: number | null = null;
  let maxDrop = 15;
  for (let i = 1; i < data.length; i++) {
    const diff = data[i - 1].retention - data[i].retention;
    if (diff > maxDrop) {
      maxDrop = diff;
      dropIndex = i;
    }
  }

  // Peak after first 10s (skip first index since seconds at 0)
  const afterTen = data.filter((p) => p.second > 10);
  const peak = afterTen.reduce(
    (acc, p) => (p.retention > acc.retention ? p : acc),
    afterTen[0],
  );

  return (
    <div className="rounded-xl border border-zinc-800 bg-zinc-900 p-4">
      <ResponsiveContainer width="100%" height={220}>
        <AreaChart data={data} margin={{ top: 10, right: 16, left: 0, bottom: 10 }}>
          <defs>
            <linearGradient id="retentionFill" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#A3E635" stopOpacity={0.3} />
              <stop offset="100%" stopColor="#A3E635" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid stroke="#27272A" vertical={false} />
          <XAxis
            dataKey="second"
            stroke="#a1a1aa"
            tick={{ fill: '#a1a1aa', fontSize: 11 }}
            label={{ value: 'Tempo (s)', position: 'insideBottom', offset: -5, fill: '#a1a1aa', fontSize: 11 }}
          />
          <YAxis
            domain={[0, 100]}
            stroke="#a1a1aa"
            tick={{ fill: '#a1a1aa', fontSize: 11 }}
            label={{ value: 'Retenção %', angle: -90, position: 'insideLeft', fill: '#a1a1aa', fontSize: 11 }}
          />
          <Tooltip content={<CustomTooltip />} />
          <Area
            type="monotone"
            dataKey="retention"
            stroke="#A3E635"
            strokeWidth={2}
            fill="url(#retentionFill)"
          />
          {dropIndex !== null && (
            <ReferenceLine
              x={data[dropIndex].second}
              stroke="#F59E0B"
              strokeDasharray="4 4"
              label={{ value: '⚠ Queda', fill: '#F59E0B', fontSize: 11, position: 'top' }}
            />
          )}
          {peak && (
            <ReferenceLine
              x={peak.second}
              stroke="#22C55E"
              strokeDasharray="4 4"
              label={{ value: '📈 Pico', fill: '#22C55E', fontSize: 11, position: 'top' }}
            />
          )}
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
