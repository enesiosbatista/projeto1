import { createFileRoute, useNavigate } from '@tanstack/react-router';
import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Link2,
  TrendingUp,
  Zap,
  RefreshCw,
  Mic,
  Anchor,
  BarChart2,
  ArrowRight,
} from 'lucide-react';
import type { Platform } from '@/types/database';

export const Route = createFileRoute('/')({
  head: () => ({
    meta: [
      { title: 'ViralMind AI — Descubra por que vídeos viralizam' },
      {
        name: 'description',
        content:
          'Cole o link de qualquer vídeo e a IA analisa em segundos por que viralizou — ou o que falta para viralizar.',
      },
      { property: 'og:title', content: 'ViralMind AI' },
      {
        property: 'og:description',
        content: 'Análise viral de vídeos com IA em segundos.',
      },
    ],
  }),
  component: LandingPage,
});

const platformOptions: { value: Platform; emoji: string; label: string }[] = [
  { value: 'youtube', emoji: '🎬', label: 'YouTube' },
  { value: 'shorts', emoji: '📱', label: 'Shorts' },
  { value: 'tiktok', emoji: '🎵', label: 'TikTok' },
  { value: 'reels', emoji: '📸', label: 'Reels' },
];

const features = [
  { icon: TrendingUp, color: 'text-primary', title: 'Score de Viralização', desc: 'Nota de 0 a 100 baseada em hook, retenção, CTA e potencial de compartilhamento.' },
  { icon: Zap, color: 'text-amber-400', title: 'Por que viralizou', desc: 'Análise contextual dos gatilhos mentais e padrões narrativos que prenderam a audiência.' },
  { icon: RefreshCw, color: 'text-secondary', title: 'Recriar sem Copiar', desc: 'Gera um roteiro original com a mesma estrutura viral, com risco de plágio abaixo de 10%.' },
  { icon: Mic, color: 'text-primary', title: 'Transcrição IA', desc: 'Transcrição automática com marcação de hooks, CTAs e momentos de alta retenção.' },
  { icon: Anchor, color: 'text-amber-400', title: 'Sugestão de Hook', desc: 'Três aberturas alternativas otimizadas para os primeiros 3 segundos do vídeo.' },
  { icon: BarChart2, color: 'text-secondary', title: 'Análise de Retenção', desc: 'Curva estimada de retenção segundo a segundo, com pontos críticos destacados.' },
];

function LandingPage() {
  const navigate = useNavigate();
  const [url, setUrl] = useState('');
  const [platform, setPlatform] = useState<Platform>('youtube');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!url.trim()) return;
    try {
      localStorage.setItem(
        'viralmind:pending',
        JSON.stringify({ url, platform }),
      );
    } catch {}
    navigate({ to: '/analyze' });
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Top brand bar */}
      <header className="flex items-center justify-between px-6 py-5">
        <div className="flex items-center gap-2">
          <Zap className="h-5 w-5 text-primary" fill="currentColor" />
          <span className="text-base font-bold text-primary">ViralMind</span>
        </div>
        <a
          href="/analyze"
          className="text-sm font-medium text-zinc-400 hover:text-zinc-200"
        >
          Entrar
        </a>
      </header>

      {/* Hero */}
      <section className="mx-auto max-w-3xl px-6 pt-10 pb-20 text-center md:pt-20">
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="inline-flex items-center rounded-full border border-zinc-700 bg-zinc-900 px-3 py-1 text-sm text-primary"
        >
          🔥 +12.847 vídeos analisados esta semana
        </motion.div>

        <h1 className="mt-6 text-5xl font-black tracking-tight md:text-7xl">
          Descubra por que{' '}
          <span className="text-gradient-viral">vídeos viralizam</span>
        </h1>

        <p className="mx-auto mt-5 max-w-xl text-lg text-zinc-400">
          Cole o link de qualquer vídeo e a IA analisa em segundos por que
          viralizou — ou o que falta para viralizar.
        </p>

        <form
          onSubmit={handleSubmit}
          className="mx-auto mt-10 flex w-full max-w-2xl flex-col gap-3"
        >
          <div className="flex h-14 items-center gap-2 rounded-xl border border-zinc-700 bg-zinc-900 px-3 focus-within:border-primary">
            <Link2 className="h-5 w-5 shrink-0 text-zinc-500" />
            <input
              type="url"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="Cole o link do YouTube, TikTok, Reels ou Shorts..."
              className="h-full flex-1 bg-transparent text-sm text-foreground placeholder:text-zinc-500 focus:outline-none"
            />
            <select
              value={platform}
              onChange={(e) => setPlatform(e.target.value as Platform)}
              className="h-9 shrink-0 rounded-md border border-zinc-700 bg-zinc-950 px-2 text-xs text-zinc-200 focus:outline-none"
            >
              {platformOptions.map((o) => (
                <option key={o.value} value={o.value}>
                  {o.emoji} {o.label}
                </option>
              ))}
            </select>
          </div>

          <button
            type="submit"
            className="inline-flex h-14 w-full items-center justify-center gap-2 rounded-xl bg-primary px-6 text-base font-semibold text-primary-foreground transition-colors hover:bg-primary/90 md:w-auto md:self-center md:px-8"
          >
            Analisar Agora <ArrowRight className="h-4 w-4" />
          </button>

          <p className="text-sm text-zinc-500">
            ✓ Grátis para começar &nbsp; ✓ Sem cadastro &nbsp; ✓ 30 segundos
          </p>
        </form>

        {/* Social proof */}
        <div className="mt-12 flex items-center justify-center gap-3 text-sm text-zinc-400">
          <div className="flex -space-x-2">
            {['MR', 'JL', 'CS'].map((i, idx) => (
              <div
                key={i}
                className="flex h-8 w-8 items-center justify-center rounded-full border-2 border-background text-[10px] font-bold text-white"
                style={{
                  background: ['#A3E635', '#4ADE80', '#BEF264'][idx],
                }}
              >
                {i}
              </div>
            ))}
          </div>
          <span>★★★★★ &nbsp; Usado por mais de 3.200 criadores</span>
        </div>
      </section>

      {/* Features */}
      <section className="mx-auto max-w-6xl px-6 pb-24">
        <h2 className="mb-10 text-center text-3xl font-bold md:text-4xl">
          Tudo que você precisa
        </h2>
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {features.map(({ icon: Icon, color, title, desc }) => (
            <div
              key={title}
              className="group rounded-xl border border-zinc-800 bg-zinc-900 p-6 transition-all duration-200 ease-out hover:border-primary/40"
            >
              <Icon className={`mb-4 h-6 w-6 ${color}`} />
              <h3 className="mb-2 text-lg font-semibold">{title}</h3>
              <p className="text-sm text-zinc-400">{desc}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
