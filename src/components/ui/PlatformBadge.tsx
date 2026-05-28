import type { Platform } from '@/types/database';

const styles: Record<Platform, { label: string; cls: string }> = {
  youtube: { label: 'YouTube', cls: 'bg-red-900/40 text-red-400 border-red-800' },
  shorts: { label: 'Shorts', cls: 'bg-red-900/40 text-red-400 border-red-800' },
  tiktok: { label: 'TikTok', cls: 'bg-zinc-800 text-zinc-200 border-zinc-600' },
  reels: { label: 'Reels', cls: 'bg-pink-900/40 text-pink-400 border-pink-800' },
};

export function PlatformBadge({ platform }: { platform: Platform }) {
  const { label, cls } = styles[platform];
  return (
    <span
      className={`inline-flex items-center rounded-md border px-2 py-0.5 text-xs font-medium ${cls}`}
    >
      {label}
    </span>
  );
}
