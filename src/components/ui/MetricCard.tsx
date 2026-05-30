import { motion } from "framer-motion";
import * as React from "react";

interface Props {
  label: string;
  value: number;
  icon: React.ElementType;
}

function getScoreColor(val: number) {
  if (val < 40) return "text-red-500";
  if (val < 70) return "text-amber-500";
  return "text-green-500";
}

function getBarColor(val: number) {
  if (val < 40) return "bg-red-500";
  if (val < 70) return "bg-amber-500";
  return "bg-green-500";
}

export function MetricCard({ label, value, icon: Icon }: Props) {
  const barColor = getBarColor(value);

  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4">
      <div className="flex items-center gap-1.5 mb-2">
        <Icon className="w-4 h-4 text-zinc-400" />
        <span className="text-xs text-zinc-400">{label}</span>
      </div>

      <div className={`font-mono text-2xl font-bold ${getScoreColor(value)}`}>{value}</div>

      <div className="mt-2 h-1.5 bg-zinc-800 rounded-full overflow-hidden">
        <motion.div
          className={barColor}
          style={{
            height: "100%",
            borderRadius: "9999px",
          }}
          initial={{ width: 0 }}
          animate={{ width: `${value}%` }}
          transition={{ duration: 1, ease: "easeOut" }}
        />
      </div>
    </div>
  );
}
