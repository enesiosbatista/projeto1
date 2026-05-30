import { motion } from 'framer-motion';

interface Props {
  className?: string;
}

export function SkeletonCard({ className = '' }: Props) {
  return (
    <motion.div
      className={`bg-zinc-800 rounded-xl ${className}`}
      animate={{ opacity: [0.5, 1, 0.5] }}
      transition={{
        repeat: Infinity,
        duration: 1.5,
        ease: 'easeInOut',
      }}
    />
  );
}
