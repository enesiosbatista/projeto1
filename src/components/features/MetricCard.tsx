import type { LucideIcon } from 'lucide-react';

interface Props {
  label: string;
  value: number;
  icon: LucideIcon;
}

function barColor(v: number) {
  if (v < 40) return 'bg-red-500';
  if (v < 70) return 'bg-amber-500';
  return 'bg-green-500';
}

export function MetricCard({ label, value, icon: Icon }: Props) {
  return (
    <div className="rounded-xl border border-zinc-800 bg-zinc-900 p-4">
      <div className="flex items-center gap-2 text-zinc-400">
        <Icon size={14} />
        <span className="text-xs uppercase tracking-wider">{label}</span>
      </div>
      <div className="mt-2 font-mono text-3xl font-bold text-white">{value}</div>
      <div className="mt-3 h-1.5 w-full overflow-hidden rounded-full bg-zinc-800">
        <div
          className={`h-full rounded-full transition-all ${barColor(value)}`}
          style={{ width: `${value}%` }}
        />
      </div>
    </div>
  );
}
