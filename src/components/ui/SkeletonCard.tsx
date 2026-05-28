interface Props {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

const sizes = { sm: 'h-20', md: 'h-32', lg: 'h-[200px]' };

export function SkeletonCard({ size = 'md', className = '' }: Props) {
  return (
    <div
      className={`animate-pulse rounded-xl bg-zinc-800 ${sizes[size]} ${className}`}
    />
  );
}
