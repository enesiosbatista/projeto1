import { motion } from 'framer-motion';

interface Props {
  score: number;
  size?: 'sm' | 'md' | 'lg';
}

const sizeMap = {
  sm: { px: 48, stroke: 4, font: 'text-sm' },
  md: { px: 96, stroke: 6, font: 'text-2xl' },
  lg: { px: 160, stroke: 8, font: 'text-5xl' },
};

function scoreColor(score: number) {
  if (score < 40) return '#EF4444';
  if (score < 70) return '#F59E0B';
  if (score < 85) return '#22C55E';
  return '#A3E635';
}

export function ViralScore({ score, size = 'md' }: Props) {
  const { px, stroke, font } = sizeMap[size];
  const radius = (px - stroke) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (score / 100) * circumference;
  const color = scoreColor(score);

  return (
    <div className="flex flex-col items-center gap-2">
      <div className="relative" style={{ width: px, height: px }}>
        <svg width={px} height={px} className="-rotate-90">
          <circle
            cx={px / 2}
            cy={px / 2}
            r={radius}
            fill="none"
            stroke="#27272A"
            strokeWidth={stroke}
          />
          <motion.circle
            cx={px / 2}
            cy={px / 2}
            r={radius}
            fill="none"
            stroke={color}
            strokeWidth={stroke}
            strokeLinecap="round"
            strokeDasharray={circumference}
            initial={{ strokeDashoffset: circumference }}
            animate={{ strokeDashoffset: offset }}
            transition={{ duration: 1.2, ease: 'easeOut' }}
          />
        </svg>
        <div
          className={`absolute inset-0 flex items-center justify-center font-mono font-bold ${font}`}
          style={{ color }}
        >
          {score}
        </div>
      </div>
      {size === 'lg' && (
        <span className="text-xs uppercase tracking-widest text-muted-foreground">
          Score de Viralização
        </span>
      )}
    </div>
  );
}
