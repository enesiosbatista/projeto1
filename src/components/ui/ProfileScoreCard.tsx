import { LucideIcon } from "lucide-react";
import { motion } from "framer-motion";

interface Props {
  label: string;
  value: number;
  icon: LucideIcon;
  description: string;
}

export function ProfileScoreCard({ label, value, icon: Icon, description }: Props) {
  const barColor = value >= 70 ? "bg-green-500" : value >= 40 ? "bg-amber-500" : "bg-red-500";

  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4 flex flex-col justify-between">
      <div>
        <div className="flex items-center gap-1.5 text-zinc-400 mb-1.5">
          <Icon className="w-4 h-4 text-zinc-400 shrink-0" />
          <span className="text-xs font-semibold">{label}</span>
        </div>
        <div className="font-mono text-2xl font-bold text-white mb-1">{value}</div>
      </div>
      <div>
        <p className="text-xs text-zinc-500 mb-2 leading-tight">{description}</p>
        <div className="h-1 bg-zinc-800 rounded-full overflow-hidden">
          <motion.div
            className={`h-full rounded-full ${barColor}`}
            initial={{ width: 0 }}
            animate={{ width: `${value}%` }}
            transition={{ duration: 1, ease: "easeOut" }}
          />
        </div>
      </div>
    </div>
  );
}
