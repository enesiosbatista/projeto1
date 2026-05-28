import { useState } from 'react';
import { Link } from '@tanstack/react-router';
import { motion } from 'framer-motion';
import { Eye, Star, Trash2 } from 'lucide-react';
import type { Analysis } from '@/types/database';
import { PlatformBadge } from '@/components/ui/PlatformBadge';
import { ViralScore } from '@/components/ui/ViralScore';

interface Props {
  analysis: Analysis;
  isFavorite: boolean;
  onToggleFavorite: (id: string) => void;
  onDelete: (id: string) => void;
  index?: number;
}

function formatDuration(s: number) {
  const m = Math.floor(s / 60);
  return `${m}:${String(s % 60).padStart(2, '0')}`;
}

function relativeTime(iso: string) {
  const diff = Date.now() - new Date(iso).getTime();
  const h = Math.floor(diff / 3600000);
  if (h < 1) return 'agora mesmo';
  if (h < 24) return `há ${h}h`;
  const d = Math.floor(h / 24);
  return `há ${d}d`;
}

export function AnalysisCard({
  analysis,
  isFavorite,
  onToggleFavorite,
  onDelete,
  index = 0,
}: Props) {
  const [imgError, setImgError] = useState(false);

  return (
    <motion.article
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: index * 0.04 }}
      whileHover={{ y: -2 }}
      className="group overflow-hidden rounded-xl border border-zinc-800 bg-zinc-900 transition-colors hover:border-primary/50"
    >
      <div className="relative aspect-video w-full overflow-hidden bg-zinc-800">
        {!imgError ? (
          <img
            src={analysis.thumbnail_url}
            alt={analysis.title}
            loading="lazy"
            onError={() => setImgError(true)}
            className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-zinc-600">▶</div>
        )}
        <div className="absolute right-2 top-2">
          <PlatformBadge platform={analysis.platform} />
        </div>
        <div className="absolute left-2 top-2 rounded-full bg-black/60 p-1 backdrop-blur">
          <ViralScore score={analysis.viral_score} size="sm" />
        </div>
      </div>

      <div className="p-3">
        <h3 className="line-clamp-2 text-sm font-semibold text-white">{analysis.title}</h3>
        <div className="mt-1 flex items-center gap-2 text-xs text-zinc-500">
          <span>{formatDuration(analysis.duration_seconds)}</span>
          <span>•</span>
          <span>{relativeTime(analysis.created_at)}</span>
        </div>

        <div className="mt-3 flex items-center justify-end gap-1 border-t border-zinc-800 pt-2">
          <Link
            to="/result/$id"
            params={{ id: analysis.id }}
            title="Ver análise"
            className="rounded-md p-2 text-zinc-400 transition hover:bg-zinc-800 hover:text-primary"
          >
            <Eye size={16} />
          </Link>
          <button
            onClick={() => onToggleFavorite(analysis.id)}
            title="Favoritar"
            className={`rounded-md p-2 transition hover:bg-zinc-800 ${
              isFavorite ? 'text-amber-400' : 'text-zinc-400 hover:text-amber-300'
            }`}
          >
            <Star size={16} fill={isFavorite ? 'currentColor' : 'none'} />
          </button>
          <button
            onClick={() => {
              if (confirm(`Excluir "${analysis.title}"?`)) onDelete(analysis.id);
            }}
            title="Excluir"
            className="rounded-md p-2 text-zinc-400 transition hover:bg-zinc-800 hover:text-red-400"
          >
            <Trash2 size={16} />
          </button>
        </div>
      </div>
    </motion.article>
  );
}
