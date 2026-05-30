import type { Platform } from "@/types/database";

export type ExtendedPlatform = Platform | "instagram" | "facebook";

const platformConfig: Record<ExtendedPlatform, { label: string; cls: string }> = {
  youtube: {
    label: "YouTube",
    cls: "bg-red-900/40 text-red-400 border-red-800",
  },
  shorts: {
    label: "Shorts",
    cls: "bg-red-900/40 text-red-400 border-red-800",
  },
  tiktok: {
    label: "TikTok",
    cls: "bg-zinc-800 text-zinc-200 border-zinc-600",
  },
  reels: {
    label: "Reels",
    cls: "bg-pink-900/40 text-pink-400 border-pink-800",
  },
  instagram: {
    label: "Instagram",
    cls: "bg-pink-900/40 text-pink-400 border-pink-800",
  },
  facebook: {
    label: "Facebook",
    cls: "bg-blue-900/40 text-blue-400 border-blue-800",
  },
};

export function PlatformBadge({ platform }: { platform: ExtendedPlatform }) {
  const config = platformConfig[platform] || {
    label: platform,
    cls: "bg-zinc-800 text-zinc-200 border-zinc-600",
  };

  return (
    <span
      className={`border rounded-md text-xs px-2 py-0.5 font-medium inline-flex items-center gap-1 ${config.cls}`}
    >
      {config.label}
    </span>
  );
}
