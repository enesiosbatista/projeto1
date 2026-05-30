import { motion } from 'framer-motion';

interface Props {
  score: number;
  size?: 'sm' | 'md' | 'lg';
}

const sizeMap = {
  sm: 48,
  md: 96,
  lg: 160,
};

function getStrokeColor(score: number) {
  if (score < 40) return '#EF4444';
  if (score < 70) return '#F59E0B';
  if (score < 85) return '#22C55E';
  return '#7C3AED';
}

function getScoreColorClass(score: number) {
  if (score < 40) return 'text-red-500';
  if (score < 70) return 'text-amber-500';
  if (score < 85) return 'text-green-500';
  return 'text-violet-500';
}

export function ViralScore({ score, size = 'md' }: Props) {
  const sizePx = sizeMap[size];
  const strokeColor = getStrokeColor(score);
  const scoreColorClass = getScoreColorClass(score);

  const content = (
    <div style={{ width: sizePx, height: sizePx }} className="relative flex items-center justify-center">
      <svg width={sizePx} height={sizePx} viewBox="0 0 100 100" style={{ transform: 'rotate(-90deg)' }}>
        {/* trilho de fundo */}
        <circle cx="50" cy="50" r="42" fill="none" stroke="#27272A" strokeWidth="8" />

        {/* arco animado */}
        <motion.circle
          cx="50"
          cy="50"
          r="42"
          fill="none"
          stroke={strokeColor}
          strokeWidth="8"
          strokeLinecap="round"
          strokeDasharray={`${2 * Math.PI * 42}`}
          initial={{ strokeDashoffset: 2 * Math.PI * 42 }}
          animate={{ strokeDashoffset: 2 * Math.PI * 42 * (1 - score / 100) }}
          transition={{ duration: 1.5, ease: 'easeOut' }}
        />
      </svg>

      {/* número centralizado */}
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span
          className={`font-mono font-bold ${
            size === 'lg'
              ? 'text-4xl'
              : size === 'md'
              ? 'text-xl'
              : 'text-xs'
          } ${scoreColorClass}`}
        >
          {score}
        </span>

        {size === 'lg' && (
          <span className="text-xs text-zinc-400 mt-0.5">
            Score
          </span>
        )}
      </div>
    </div>
  );

  if (score >= 85) {
    return (
      <motion.div
        animate={{ opacity: [0.7, 1, 0.7] }}
        transition={{ repeat: Infinity, duration: 2 }}
      >
        {content}
      </motion.div>
    );
  }

  return content;
}
