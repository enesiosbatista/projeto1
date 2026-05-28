import { createFileRoute } from '@tanstack/react-router';
import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import {
  CheckCircle,
  ChevronDown,
  Clapperboard,
  Copy,
  Download,
  MousePointerClick,
  Play,
  RefreshCw,
  Share2,
  Sparkles,
  TrendingUp,
  Type,
  Volume2,
  XCircle,
  Zap,
} from 'lucide-react';
import { AppLayout } from '@/components/layout/AppLayout';
import { PlatformBadge } from '@/components/ui/PlatformBadge';
import { ViralScore } from '@/components/ui/ViralScore';
import { MetricCard } from '@/components/features/MetricCard';
import { RetentionChart } from '@/components/features/RetentionChart';
import { TranscriptLine } from '@/components/features/TranscriptLine';
import { ScriptSection } from '@/components/features/ScriptSection';
import { MentalTriggerCard } from '@/components/features/MentalTriggerCard';
import { mockAnalysis } from '@/lib/mockData';
import type { Analysis } from '@/types/database';

export const Route = createFileRoute('/result/$id')({
  head: () => ({
    meta: [{ title: 'Resultado da análise — ViralMind AI' }],
  }),
  component: ResultPage,
});

function formatDuration(s: number) {
  const m = Math.floor(s / 60);
  const sec = s % 60;
  return `${m}:${String(sec).padStart(2, '0')}`;
}

type Tab = 'analysis' | 'recreate' | 'transcript';

function ResultPage() {
  const analysis: Analysis = mockAnalysis;
  const [tab, setTab] = useState<Tab>('analysis');
  const viralized = analysis.viral_score >= 70;

  return (
    <AppLayout>
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-6 px-4 py-6 md:flex-row md:px-6 md:py-8">
        <Sidebar analysis={analysis} viralized={viralized} />
        <div className="flex-1 min-w-0">
          <TabsBar tab={tab} setTab={setTab} />
          <div className="mt-6">
            {tab === 'analysis' && <AnalysisTab analysis={analysis} viralized={viralized} />}
            {tab === 'recreate' && <RecreateTab analysis={analysis} />}
            {tab === 'transcript' && <TranscriptTab analysis={analysis} />}
          </div>
        </div>
      </div>
    </AppLayout>
  );
}

/* ─────────────── Sidebar ─────────────── */

function Sidebar({ analysis, viralized }: { analysis: Analysis; viralized: boolean }) {
  const [imgError, setImgError] = useState(false);
  const [displayScore, setDisplayScore] = useState(0);

  useEffect(() => {
    const start = performance.now();
    const target = analysis.viral_score;
    const duration = 1500;
    let raf = 0;
    const tick = (now: number) => {
      const t = Math.min(1, (now - start) / duration);
      const eased = 1 - Math.pow(1 - t, 3);
      setDisplayScore(Math.round(eased * target));
      if (t < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [analysis.viral_score]);

  return (
    <aside className="w-full shrink-0 md:sticky md:top-0 md:max-h-screen md:w-[340px] md:overflow-y-auto md:pr-2 md:py-2">
      <div className="space-y-4 rounded-2xl border border-zinc-800 bg-zinc-900 p-4">
        <div className="aspect-video w-full overflow-hidden rounded-xl bg-zinc-800">
          {imgError ? (
            <div className="flex h-full w-full items-center justify-center">
              <Play size={48} className="text-zinc-600" />
            </div>
          ) : (
            <img
              src={analysis.thumbnail_url}
              alt={analysis.title}
              className="h-full w-full object-cover"
              onError={() => setImgError(true)}
            />
          )}
        </div>

        <h2 className="line-clamp-2 text-sm font-semibold text-white">{analysis.title}</h2>

        <div className="flex flex-wrap items-center gap-2">
          <PlatformBadge platform={analysis.platform} />
          <span className="rounded-md bg-zinc-800 px-2 py-1 font-mono text-xs text-zinc-300">
            {formatDuration(analysis.duration_seconds)}
          </span>
        </div>

        <div className="border-t border-zinc-800" />

        <div className="flex flex-col items-center gap-2">
          <ViralScore score={displayScore} size="lg" />
          <p className={`text-center text-sm ${viralized ? 'text-green-400' : 'text-amber-400'}`}>
            {viralized ? '✅ Viralizou!' : '⚠️ Não viralizou'}
          </p>
        </div>

        <div className="flex flex-col gap-2">
          <button
            onClick={() => {
              navigator.clipboard?.writeText(window.location.href);
            }}
            className="flex w-full items-center justify-center gap-2 rounded-lg bg-zinc-800 px-4 py-2 text-sm font-medium text-white transition hover:bg-zinc-700"
          >
            <Share2 size={16} /> Compartilhar Análise
          </button>
          <button
            onClick={() => window.print()}
            className="flex w-full items-center justify-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition hover:bg-primary/90"
          >
            <Download size={16} /> Exportar PDF
          </button>
        </div>
      </div>
    </aside>
  );
}

/* ─────────────── Tabs ─────────────── */

function TabsBar({ tab, setTab }: { tab: Tab; setTab: (t: Tab) => void }) {
  const tabs: { id: Tab; label: string }[] = [
    { id: 'analysis', label: 'Análise Completa' },
    { id: 'recreate', label: 'Recriar Vídeo' },
    { id: 'transcript', label: 'Transcrição' },
  ];
  return (
    <div className="flex gap-1 overflow-x-auto border-b border-zinc-800">
      {tabs.map((t) => {
        const active = t.id === tab;
        return (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={`relative whitespace-nowrap px-4 py-3 text-sm font-medium transition ${
              active ? 'text-white' : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            {t.label}
            {active && (
              <span className="absolute inset-x-0 -bottom-px h-0.5 bg-primary" />
            )}
          </button>
        );
      })}
    </div>
  );
}

/* ─────────────── Tab 1: Analysis ─────────────── */

const metricMeta = [
  { key: 'hook_score', label: 'Hook Score', icon: Zap },
  { key: 'retention_estimated', label: 'Retenção Estimada', icon: TrendingUp },
  { key: 'share_potential', label: 'Potencial de Compartilhamento', icon: Share2 },
  { key: 'audio_quality', label: 'Qualidade do Áudio', icon: Volume2 },
  { key: 'cta_strength', label: 'Força do CTA', icon: MousePointerClick },
  { key: 'title_optimization', label: 'Otimização do Título', icon: Type },
] as const;

function AnalysisTab({ analysis, viralized }: { analysis: Analysis; viralized: boolean }) {
  const r = analysis.result;
  return (
    <div className="space-y-8">
      {/* Verdict card */}
      <div
        className={`rounded-xl border-l-4 p-5 ${
          viralized
            ? 'border-green-500 bg-green-950/30'
            : 'border-amber-500 bg-amber-950/30'
        }`}
      >
        <h2 className="text-lg font-bold text-white">
          {viralized
            ? '✅ Este vídeo viralizou — entenda o porquê'
            : '⚠️ Este vídeo não viralizou — veja o que melhorar'}
        </h2>
        <div className="mt-3 space-y-3 text-sm leading-relaxed text-zinc-300">
          {r.overall_analysis.split('\n\n').map((p, i) => (
            <p key={i}>{p}</p>
          ))}
        </div>
      </div>

      {/* Metrics grid */}
      <section>
        <h3 className="mb-3 text-base font-semibold text-white">Scores Detalhados</h3>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {metricMeta.map((m) => (
            <MetricCard
              key={m.key}
              label={m.label}
              value={r.metrics[m.key]}
              icon={m.icon}
            />
          ))}
        </div>
      </section>

      {/* Retention chart */}
      <section>
        <h3 className="mb-3 text-base font-semibold text-white">Curva de Retenção</h3>
        <RetentionChart data={r.retention_data} />
      </section>

      {/* Strong / Weak */}
      <section className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <div>
          <h3 className="mb-3 flex items-center gap-2 text-base font-semibold text-white">
            <CheckCircle className="text-green-500" size={18} /> Pontos Fortes
          </h3>
          <div className="space-y-2">
            {r.strong_points.map((p, i) => (
              <AccordionItem
                key={i}
                tone="green"
                icon={<CheckCircle className="text-green-500" size={16} />}
                title={p.title}
              >
                <p className="text-sm text-zinc-300">{p.description}</p>
              </AccordionItem>
            ))}
          </div>
        </div>
        <div>
          <h3 className="mb-3 flex items-center gap-2 text-base font-semibold text-white">
            <XCircle className="text-red-400" size={18} /> Pontos Fracos
          </h3>
          <div className="space-y-2">
            {r.weak_points.map((p, i) => (
              <AccordionItem
                key={i}
                tone="red"
                icon={<XCircle className="text-red-400" size={16} />}
                title={p.title}
              >
                <p className="text-sm text-zinc-300">{p.description}</p>
                <p className="mt-2 text-sm text-amber-300">💡 Sugestão: {p.suggestion}</p>
              </AccordionItem>
            ))}
          </div>
        </div>
      </section>

      {/* Mental triggers OR improvement plan */}
      {viralized ? (
        <section>
          <h3 className="mb-3 text-base font-semibold text-white">Gatilhos Detectados</h3>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            {r.mental_triggers.map((t, i) => (
              <MentalTriggerCard key={i} trigger={t} />
            ))}
          </div>
        </section>
      ) : (
        <ImprovementPlan analysis={analysis} />
      )}
    </div>
  );
}

function AccordionItem({
  tone,
  icon,
  title,
  children,
}: {
  tone: 'green' | 'red';
  icon: React.ReactNode;
  title: string;
  children: React.ReactNode;
}) {
  const [open, setOpen] = useState(false);
  const styles =
    tone === 'green'
      ? 'border-green-900 bg-green-950/20'
      : 'border-red-900 bg-red-950/20';
  return (
    <div className={`rounded-xl border ${styles}`}>
      <button
        onClick={() => setOpen((o) => !o)}
        className="flex w-full items-center gap-3 px-4 py-3 text-left"
      >
        {icon}
        <span className="flex-1 text-sm font-semibold text-white">{title}</span>
        <ChevronDown
          size={16}
          className={`text-zinc-400 transition ${open ? 'rotate-180' : ''}`}
        />
      </button>
      {open && <div className="border-t border-zinc-800/60 px-4 py-3">{children}</div>}
    </div>
  );
}

function ImprovementPlan({ analysis }: { analysis: Analysis }) {
  const r = analysis.result;
  return (
    <section className="space-y-6">
      <h3 className="text-base font-semibold text-white">Plano de Melhoria</h3>

      {r.hook_suggestions && (
        <div>
          <h4 className="mb-2 text-sm font-semibold text-zinc-300">Sugestões de Hook</h4>
          <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
            {r.hook_suggestions.map((h, i) => (
              <div
                key={i}
                className="rounded-xl border border-amber-900 bg-amber-950/20 p-4"
              >
                <p className="text-sm text-zinc-200">{h}</p>
                <button
                  onClick={() => navigator.clipboard?.writeText(h)}
                  className="mt-3 inline-flex items-center gap-1 text-xs text-amber-300 hover:text-amber-200"
                >
                  <Copy size={12} /> Copiar
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {r.new_title_suggestion && (
        <div className="rounded-xl border border-zinc-800 bg-zinc-900 p-4">
          <h4 className="mb-2 text-sm font-semibold text-zinc-300">Título Sugerido</h4>
          <p className="text-sm text-zinc-400 line-through">{analysis.title}</p>
          <p className="mt-1 text-base font-semibold text-primary">
            {r.new_title_suggestion}
          </p>
        </div>
      )}

      {r.best_posting_times && (
        <div className="rounded-xl border border-zinc-800 bg-zinc-900 p-4">
          <h4 className="mb-3 text-sm font-semibold text-zinc-300">Melhores Horários</h4>
          <table className="w-full text-sm">
            <tbody>
              {Object.entries(r.best_posting_times).map(([plat, time]) => (
                <tr key={plat} className="border-t border-zinc-800 first:border-0">
                  <td className="py-2 capitalize text-zinc-400">{plat}</td>
                  <td className="py-2 text-zinc-200">{time}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}

/* ─────────────── Tab 2: Recreate ─────────────── */

const loadingMessages = [
  'Analisando conceito original...',
  'Criando estrutura única...',
  'Calculando risco de plágio...',
];

function RecreateTab({ analysis }: { analysis: Analysis }) {
  const [stage, setStage] = useState<'idle' | 'loading' | 'done'>('idle');
  const [msgIndex, setMsgIndex] = useState(0);

  const start = () => {
    setStage('loading');
    setMsgIndex(0);
    let i = 0;
    const interval = setInterval(() => {
      i += 1;
      if (i < loadingMessages.length) setMsgIndex(i);
    }, 1000);
    setTimeout(() => {
      clearInterval(interval);
      setStage('done');
    }, 3000);
  };

  const script = analysis.result.script_recreation;

  if (stage === 'idle') {
    return (
      <div className="flex flex-col items-center justify-center rounded-2xl border border-zinc-800 bg-zinc-900 p-10 text-center">
        <Clapperboard size={64} className="text-zinc-600" />
        <h3 className="mt-4 text-lg font-bold text-white">
          Gerar roteiro original inspirado neste vídeo
        </h3>
        <p className="mt-2 max-w-md text-sm text-zinc-400">
          A IA cria um novo roteiro com a mesma essência, sem risco de plágio.
        </p>
        <button
          onClick={start}
          className="mt-6 rounded-lg bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground transition hover:bg-primary/90"
        >
          🎬 Gerar Roteiro Agora
        </button>
      </div>
    );
  }

  if (stage === 'loading') {
    return (
      <div className="flex flex-col items-center justify-center rounded-2xl border border-zinc-800 bg-zinc-900 p-10 text-center">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1.5, repeat: Infinity, ease: 'linear' }}
        >
          <Sparkles size={48} className="text-primary" />
        </motion.div>
        <p className="mt-4 text-sm text-zinc-300">{loadingMessages[msgIndex]}</p>
      </div>
    );
  }

  const fullText = `HOOK:\n${script.hook}\n\nDESENVOLVIMENTO:\n${script.body}\n\nCTA:\n${script.cta}`;
  const exportTxt = () => {
    const blob = new Blob([fullText], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'roteiro-viralmind.txt';
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-2">
        <span className="rounded-full bg-green-900 px-3 py-1 text-xs font-medium text-green-300">
          Risco de Plágio: {script.plagiarism_risk}%
        </span>
        <span className="rounded-full bg-primary/20 px-3 py-1 text-xs font-medium text-primary">
          Potencial: {script.viral_potential}%
        </span>
      </div>

      <ScriptSection emoji="🪝" title="Hook de Abertura (0–5s)" text={script.hook} color="amber" />
      <ScriptSection emoji="📝" title="Desenvolvimento" text={script.body} color="violet" />
      <ScriptSection emoji="🎯" title="CTA Final" text={script.cta} color="cyan" />

      <div className="flex flex-wrap gap-2 pt-2">
        <button
          onClick={() => navigator.clipboard?.writeText(fullText)}
          className="flex items-center gap-2 rounded-lg bg-zinc-800 px-4 py-2 text-sm font-medium text-white transition hover:bg-zinc-700"
        >
          <Copy size={14} /> Copiar Roteiro
        </button>
        <button
          onClick={exportTxt}
          className="flex items-center gap-2 rounded-lg bg-zinc-800 px-4 py-2 text-sm font-medium text-white transition hover:bg-zinc-700"
        >
          <Download size={14} /> Exportar .TXT
        </button>
        <button
          onClick={() => setStage('idle')}
          className="flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition hover:bg-primary/90"
        >
          <RefreshCw size={14} /> Regenerar
        </button>
      </div>
    </div>
  );
}

/* ─────────────── Tab 3: Transcript ─────────────── */

const remodelStyles = [
  'Mais Viral',
  'Mais Emocional',
  'Mais Engraçado',
  'Mais Profissional',
  'Mais Curto',
  'Mais Impactante',
];

function TranscriptTab({ analysis }: { analysis: Analysis }) {
  const [selected, setSelected] = useState<string | null>(null);
  const [stage, setStage] = useState<'idle' | 'loading' | 'done'>('idle');

  const remodel = () => {
    if (!selected) return;
    setStage('loading');
    setTimeout(() => setStage('done'), 2000);
  };

  const remodeled = `Esta é uma versão remodelada no estilo "${selected}". A IA reescreveu o roteiro mantendo a essência principal mas adaptando o tom, ritmo e estrutura para maximizar o impacto desejado. Cada frase foi reescrita para soar mais ${selected?.toLowerCase().replace('mais ', '')} e gerar maior conexão com o público-alvo.`;

  const copy = () => navigator.clipboard?.writeText(remodeled);
  const exportTxt = () => {
    const blob = new Blob([remodeled], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'transcricao-remodelada.txt';
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-8">
      <section>
        <h3 className="mb-3 text-base font-semibold text-white">Transcrição do Vídeo</h3>
        <div className="space-y-1.5">
          {analysis.result.transcript.map((line, i) => (
            <TranscriptLine key={i} line={line} />
          ))}
        </div>
        <div className="mt-4 flex flex-wrap gap-3 text-xs text-zinc-400">
          <span>🟡 Hook</span>
          <span>🔵 CTA</span>
          <span>🟣 Destaque</span>
          <span>⬜ Normal</span>
        </div>
      </section>

      <div className="relative flex items-center">
        <div className="flex-1 border-t border-zinc-800" />
        <button
          onClick={remodel}
          disabled={!selected || stage === 'loading'}
          className="mx-4 flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-50"
        >
          <Sparkles size={14} /> Remodelar com IA
        </button>
        <div className="flex-1 border-t border-zinc-800" />
      </div>

      <section>
        <h4 className="mb-3 text-sm font-semibold text-zinc-300">Estilo de Remodelagem</h4>
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
          {remodelStyles.map((s) => {
            const active = s === selected;
            return (
              <button
                key={s}
                onClick={() => setSelected(s)}
                className={`rounded-lg border px-4 py-2 text-sm font-medium transition ${
                  active
                    ? 'border-primary bg-primary/20 text-white'
                    : 'border-zinc-700 text-zinc-300 hover:border-zinc-600'
                }`}
              >
                {s}
              </button>
            );
          })}
        </div>
      </section>

      {stage === 'loading' && (
        <div className="flex items-center justify-center gap-3 rounded-xl border border-zinc-800 bg-zinc-900 p-6">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 1.2, repeat: Infinity, ease: 'linear' }}
          >
            <Sparkles size={20} className="text-primary" />
          </motion.div>
          <span className="text-sm text-zinc-300">IA reescrevendo roteiro...</span>
        </div>
      )}

      {stage === 'done' && (
        <div className="space-y-3 rounded-xl border border-zinc-700 bg-zinc-900 p-5">
          <div>
            <span className="inline-block rounded-full bg-primary/20 px-3 py-1 text-xs font-medium text-primary">
              Estilo: {selected}
            </span>
          </div>
          <p className="text-sm leading-relaxed text-zinc-200">{remodeled}</p>
          <div className="flex flex-wrap gap-2 pt-2">
            <button
              onClick={copy}
              className="flex items-center gap-2 rounded-lg bg-zinc-800 px-4 py-2 text-sm font-medium text-white transition hover:bg-zinc-700"
            >
              <Copy size={14} /> Copiar
            </button>
            <button
              onClick={exportTxt}
              className="flex items-center gap-2 rounded-lg bg-zinc-800 px-4 py-2 text-sm font-medium text-white transition hover:bg-zinc-700"
            >
              <Download size={14} /> Exportar TXT
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
