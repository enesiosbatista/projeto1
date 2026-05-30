import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import {
  CheckCircle,
  XCircle,
  Clapperboard,
  Loader2,
  Sparkles,
  Zap,
  TrendingUp,
  Share2,
  Volume2,
  MousePointerClick,
  Type,
  Play,
} from "lucide-react";
import { AppLayout } from "@/components/layout/AppLayout";
import { PlatformBadge } from "@/components/ui/PlatformBadge";
import { ViralScore } from "@/components/ui/ViralScore";
import { MetricCard } from "@/components/ui/MetricCard";
import { RetentionChart } from "@/components/features/RetentionChart";
import { mockAnalysis } from "@/lib/mockData";
import type { Analysis } from "@/types/database";
import { toast } from "sonner";
import { Toaster } from "@/components/ui/sonner";

export const Route = createFileRoute("/result/$id")({
  head: () => ({
    meta: [{ title: "Resultado da análise — ViralMind AI" }],
  }),
  component: ResultPage,
});

function formatDuration(s: number) {
  const m = Math.floor(s / 60);
  const sec = s % 60;
  return `${m}:${String(sec).padStart(2, "0")}`;
}

type Tab = "analysis" | "recreate" | "transcript";

const styleRewrites: Record<string, string> = {
  "Mais Viral":
    "Se você quer explodir seus números ainda este mês, pare de cometer estes erros básicos. A maioria dos criadores falha por não usar ganchos de padrão estético. Aplique esta fórmula e veja a retenção disparar instantaneamente.",
  "Mais Emocional":
    "Eu lembro da frustração de passar noites em claro gravando conteúdo que ninguém assistia. Parecia que meu esforço era invisível. Mas quando finalmente compreendi como falar ao coração das pessoas, tudo se transformou. Você também é capaz de alcançar essa conexão profunda.",
  "Mais Engraçado":
    "Olha, se o seu vídeo continuar com essa introdução chata, até a sua mãe vai pular a reprodução no segundo zero. Vamos combinar que você precisa de um chacoalhão criativo. Faça a piada certa e salve o seu engajamento hoje mesmo.",
  "Mais Profissional":
    "A análise estatística de retenção de público demonstra que ganchos estruturais aumentam a taxa de conclusão do vídeo em até 37%. Sugere-se a reestruturação da introdução para focar em métricas claras e tangíveis nos primeiros 5 segundos.",
  "Mais Curto":
    "Pare de trabalhar 12 horas. Trocar tempo por dinheiro em 2026 é loucura. Use nossa estratégia de 3 passos simples. Mude isso hoje mesmo.",
  "Mais Impactante":
    "Atenção: 99% das pessoas estão jogando o próprio tempo no lixo. Se você não mudar sua abordagem agora, será deixado para trás. A escolha é sua: continuar na mediocridade ou dominar a atenção do seu público.",
};

function ResultPage() {
  const analysis: Analysis = mockAnalysis;
  const [activeTab, setActiveTab] = useState<Tab>("analysis");
  const [imgError, setImgError] = useState(false);
  const [score, setScore] = useState(0);

  // Accordion states
  const [openStrongIdx, setOpenStrongIdx] = useState<number | null>(null);
  const [openWeakIdx, setOpenWeakIdx] = useState<number | null>(null);

  // Script Recreation states
  const [scriptState, setScriptState] = useState<"idle" | "loading" | "ready">("idle");
  const [loadingMsgIdx, setLoadingMsgIdx] = useState(0);

  // Remodel states
  const [selectedStyle, setSelectedStyle] = useState<string | null>(null);
  const [rewriteState, setRewriteState] = useState<"idle" | "loading" | "ready">("idle");

  const viralized = analysis.viral_score >= 70;

  // Animate viral score on mount (1.5s ease-out)
  useEffect(() => {
    const start = 0;
    const end = analysis.viral_score;
    const duration = 1500;
    const startTime = performance.now();

    let animationFrameId: number;

    const animate = (currentTime: number) => {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);

      // Ease out cubic
      const easeOutCubic = 1 - Math.pow(1 - progress, 3);
      const currentScore = Math.round(start + (end - start) * easeOutCubic);

      setScore(currentScore);

      if (progress < 1) {
        animationFrameId = requestAnimationFrame(animate);
      }
    };

    animationFrameId = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animationFrameId);
  }, [analysis.viral_score]);

  // Handle messages delay for script recreation
  useEffect(() => {
    if (scriptState !== "loading") return;
    setLoadingMsgIdx(0);
    const t1 = setTimeout(() => setLoadingMsgIdx(1), 1000);
    const t2 = setTimeout(() => setLoadingMsgIdx(2), 2000);
    const t3 = setTimeout(() => {
      setScriptState("ready");
    }, 3000);
    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
    };
  }, [scriptState]);

  const triggerRewrite = () => {
    if (!selectedStyle) return;
    setRewriteState("loading");
    setTimeout(() => {
      setRewriteState("ready");
    }, 2000);
  };

  return (
    <AppLayout>
      <Toaster />
      <div className="lg:flex gap-6 p-6 max-w-7xl mx-auto w-full">
        {/* Coluna Esquerda — Info Card */}
        <aside className="w-full lg:w-[320px] shrink-0 lg:sticky lg:top-[72px] lg:h-fit">
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-4">
            {/* Thumbnail */}
            <div className="w-full aspect-video rounded-xl overflow-hidden bg-zinc-800 relative flex items-center justify-center">
              {imgError ? (
                <Play className="w-8 h-8 text-zinc-500" />
              ) : (
                <img
                  src={analysis.thumbnail_url}
                  alt={analysis.title}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    e.currentTarget.style.display = "none";
                    setImgError(true);
                  }}
                />
              )}
            </div>

            {/* Título */}
            <h2 className="text-sm font-semibold mt-3 line-clamp-2 text-white">{analysis.title}</h2>

            {/* Linha de badges */}
            <div className="flex items-center gap-2 mt-2">
              <PlatformBadge platform={analysis.platform} />
              <span className="bg-zinc-800 text-zinc-400 text-xs px-2 py-0.5 rounded font-mono">
                {formatDuration(analysis.duration_seconds)}
              </span>
            </div>

            {/* Separador */}
            <div className="border-t border-zinc-800 my-4" />

            {/* ViralScore */}
            <div className="flex justify-center mx-auto">
              <ViralScore score={score} size="lg" />
            </div>

            {/* Veredicto */}
            <div className="text-center mt-2 font-bold">
              {viralized ? (
                <span className="text-green-400">✅ Viralizou!</span>
              ) : (
                <span className="text-amber-400">⚠️ Não viralizou</span>
              )}
            </div>

            {/* Botões */}
            <div className="flex flex-col gap-2 mt-4">
              <button
                onClick={() => {
                  navigator.clipboard.writeText(window.location.href);
                  toast.success("Link da análise copiado para a área de transferência!");
                }}
                className="bg-zinc-800 hover:bg-zinc-700 w-full rounded-xl h-9 text-sm text-zinc-300 transition-colors cursor-pointer font-medium"
              >
                📋 Compartilhar Análise
              </button>
              <button
                onClick={() => window.print()}
                className="bg-violet-600 hover:bg-violet-500 w-full rounded-xl h-9 text-sm text-white transition-colors cursor-pointer font-medium"
              >
                📥 Exportar PDF
              </button>
            </div>
          </div>
        </aside>

        {/* Coluna Direita — Sistema de Abas */}
        <main className="flex-1 min-w-0 mt-6 lg:mt-0">
          {/* TabBar */}
          <div className="flex border-b border-zinc-800 mb-6 gap-1 overflow-x-auto whitespace-nowrap">
            <button
              onClick={() => setActiveTab("analysis")}
              className={`${
                activeTab === "analysis"
                  ? "border-b-2 border-violet-500 text-white pb-3 px-4 text-sm font-medium -mb-px cursor-pointer"
                  : "text-zinc-400 hover:text-zinc-200 pb-3 px-4 text-sm transition-colors -mb-px cursor-pointer"
              }`}
            >
              Análise Completa
            </button>
            <button
              onClick={() => setActiveTab("recreate")}
              className={`${
                activeTab === "recreate"
                  ? "border-b-2 border-violet-500 text-white pb-3 px-4 text-sm font-medium -mb-px cursor-pointer"
                  : "text-zinc-400 hover:text-zinc-200 pb-3 px-4 text-sm transition-colors -mb-px cursor-pointer"
              }`}
            >
              Recriar Vídeo
            </button>
            <button
              onClick={() => setActiveTab("transcript")}
              className={`${
                activeTab === "transcript"
                  ? "border-b-2 border-violet-500 text-white pb-3 px-4 text-sm font-medium -mb-px cursor-pointer"
                  : "text-zinc-400 hover:text-zinc-200 pb-3 px-4 text-sm transition-colors -mb-px cursor-pointer"
              }`}
            >
              Transcrição
            </button>
          </div>

          {/* Abas */}
          <div className="mt-4">
            {/* ABA 1 — analysis */}
            {activeTab === "analysis" && (
              <div className="space-y-6">
                {/* Card Veredicto */}
                <div
                  className={`border-l-4 rounded-xl p-5 ${
                    viralized
                      ? "border-green-500 bg-green-950/30"
                      : "border-amber-500 bg-amber-950/30"
                  }`}
                >
                  <h2
                    className={`font-bold text-sm ${
                      viralized ? "text-green-400" : "text-amber-400"
                    }`}
                  >
                    {viralized
                      ? "✅ Este vídeo viralizou — entenda o porquê"
                      : "⚠️ Este vídeo não viralizou — veja o que melhorar"}
                  </h2>
                  <div className="text-sm text-zinc-300 mt-3 leading-relaxed space-y-2">
                    {analysis.result.overall_analysis.split("\n\n").map((para, i) => (
                      <p key={i}>{para}</p>
                    ))}
                  </div>
                </div>

                {/* Scores Detalhados */}
                <div>
                  <h3 className="text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-3">
                    SCORES DETALHADOS
                  </h3>
                  <div className="grid grid-cols-2 lg:grid-cols-3 gap-3 mb-6">
                    <MetricCard
                      label="Hook Score"
                      value={analysis.result.metrics.hook_score}
                      icon={Zap}
                    />
                    <MetricCard
                      label="Retenção Est."
                      value={analysis.result.metrics.retention_estimated}
                      icon={TrendingUp}
                    />
                    <MetricCard
                      label="Compartilhamento"
                      value={analysis.result.metrics.share_potential}
                      icon={Share2}
                    />
                    <MetricCard
                      label="Qualidade Áudio"
                      value={analysis.result.metrics.audio_quality}
                      icon={Volume2}
                    />
                    <MetricCard
                      label="Força do CTA"
                      value={analysis.result.metrics.cta_strength}
                      icon={MousePointerClick}
                    />
                    <MetricCard
                      label="Título Otimizado"
                      value={analysis.result.metrics.title_optimization}
                      icon={Type}
                    />
                  </div>
                </div>

                {/* Curva de Retenção */}
                <div>
                  <div className="flex items-center gap-2 mb-3">
                    <h3 className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">
                      CURVA DE RETENÇÃO
                    </h3>
                    <span className="bg-zinc-800 text-zinc-400 text-xs px-2 py-0.5 rounded font-medium">
                      Estimada pela IA
                    </span>
                  </div>
                  <RetentionChart data={analysis.result.retention_data} />
                </div>

                {/* Pontos Fortes e Fracos */}
                <div>
                  <h3 className="text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-3">
                    ANÁLISE DETALHADA
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                    {/* Fortes */}
                    <div>
                      <h4 className="text-green-400 text-xs font-semibold uppercase mb-2">
                        ✅ Pontos Fortes
                      </h4>
                      {analysis.result.strong_points.map((pt, idx) => {
                        const isOpen = openStrongIdx === idx;
                        return (
                          <div
                            key={idx}
                            className="bg-green-950/20 border border-green-900 rounded-xl p-3 mb-2 cursor-pointer transition-all hover:bg-green-950/30"
                            onClick={() => setOpenStrongIdx(isOpen ? null : idx)}
                          >
                            <div className="flex items-center gap-2">
                              <CheckCircle className="w-3 h-3 text-green-500 shrink-0" />
                              <span className="text-sm font-medium text-white">{pt.title}</span>
                            </div>
                            {isOpen && (
                              <p className="text-xs text-zinc-400 mt-2 leading-relaxed">
                                {pt.description}
                              </p>
                            )}
                          </div>
                        );
                      })}
                    </div>

                    {/* Fracos */}
                    <div>
                      <h4 className="text-red-400 text-xs font-semibold uppercase mb-2">
                        ⚠️ Pontos de Melhoria
                      </h4>
                      {analysis.result.weak_points.map((pt, idx) => {
                        const isOpen = openWeakIdx === idx;
                        return (
                          <div
                            key={idx}
                            className="bg-red-950/20 border border-red-900 rounded-xl p-3 mb-2 cursor-pointer transition-all hover:bg-red-950/30"
                            onClick={() => setOpenWeakIdx(isOpen ? null : idx)}
                          >
                            <div className="flex items-center gap-2">
                              <XCircle className="w-3 h-3 text-red-400 shrink-0 animate-pulse" />
                              <span className="text-sm font-medium text-white">{pt.title}</span>
                            </div>
                            {isOpen && (
                              <div className="mt-2">
                                <p className="text-xs text-zinc-400 leading-relaxed">
                                  {pt.description}
                                </p>
                                <p className="text-amber-300 text-xs mt-1 font-medium">
                                  💡 Sugestão: {pt.suggestion}
                                </p>
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>

                {/* Gatilhos Mentais (Somente se viralizou) */}
                {viralized && (
                  <div>
                    <h3 className="text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-3">
                      GATILHOS DETECTADOS
                    </h3>
                    <div className="grid grid-cols-2 gap-3 mb-6">
                      {analysis.result.mental_triggers.map((tg, idx) => (
                        <div
                          key={idx}
                          className="bg-violet-950/30 border border-violet-800 rounded-xl p-4 flex flex-col justify-between"
                        >
                          <div>
                            <h4 className="font-bold text-violet-300 text-sm">{tg.name}</h4>
                            <p className="text-xs text-zinc-400 mt-1 leading-relaxed">
                              {tg.description}
                            </p>
                          </div>
                          <span className="bg-zinc-800 text-zinc-400 text-[10px] px-2 py-0.5 rounded mt-2 inline-block font-mono self-start">
                            {tg.timestamp}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Plano de Melhoria (Somente se nao viralizou) */}
                {!viralized && (
                  <div>
                    <h3 className="text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-3">
                      PLANO DE MELHORIA
                    </h3>

                    {/* Hooks sugeridos */}
                    {analysis.result.hook_suggestions && (
                      <div className="mb-4">
                        <span className="text-zinc-500 text-xs font-bold uppercase tracking-wider mb-2 block">
                          Hooks sugeridos
                        </span>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                          {analysis.result.hook_suggestions.map((hk, idx) => (
                            <div
                              key={idx}
                              className="bg-amber-950/20 border border-amber-800 rounded-xl p-4 flex flex-col justify-between"
                            >
                              <p className="text-sm text-zinc-200 leading-relaxed">{hk}</p>
                              <button
                                onClick={() => {
                                  navigator.clipboard.writeText(hk);
                                  toast.success("Hook copiado com sucesso!");
                                }}
                                className="bg-amber-900/50 text-amber-300 text-xs px-3 py-1 rounded-lg hover:bg-amber-800/50 transition-colors self-start mt-3 cursor-pointer"
                              >
                                Copiar
                              </button>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Título sugerido */}
                    {analysis.result.new_title_suggestion && (
                      <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4 mb-3 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                        <div className="flex-1">
                          <span className="text-zinc-500 text-xs font-semibold uppercase">
                            Título Atual
                          </span>
                          <p className="text-sm text-zinc-500 line-through mt-0.5">
                            {analysis.title}
                          </p>
                          <span className="text-zinc-300 text-xs font-semibold uppercase mt-3 block">
                            Título Sugerido
                          </span>
                          <p className="font-bold text-white text-base mt-0.5">
                            {analysis.result.new_title_suggestion}
                          </p>
                        </div>
                        <span className="bg-violet-900/40 text-violet-300 text-xs px-2 py-1 rounded border border-violet-800 font-semibold shrink-0">
                          Score estimado: 96
                        </span>
                      </div>
                    )}

                    {/* Horários */}
                    {analysis.result.best_posting_times && (
                      <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4 mb-3">
                        <span className="text-zinc-400 text-xs font-semibold uppercase tracking-wider block mb-2">
                          Melhores Horários
                        </span>
                        <table className="w-full text-sm mt-3 mb-3">
                          <thead>
                            <tr className="text-left text-zinc-500 text-xs border-b border-zinc-800">
                              <th className="pb-2 font-medium">Plataforma</th>
                              <th className="pb-2 font-medium">Horário Sugerido</th>
                            </tr>
                          </thead>
                          <tbody>
                            {Object.entries(analysis.result.best_posting_times).map(
                              ([platform, time]) => (
                                <tr
                                  key={platform}
                                  className="border-b border-zinc-800/50 last:border-b-0"
                                >
                                  <td className="py-2.5 text-zinc-400 capitalize">{platform}</td>
                                  <td className="py-2.5 text-zinc-200 font-semibold">{time}</td>
                                </tr>
                              ),
                            )}
                          </tbody>
                        </table>
                      </div>
                    )}

                    {/* CTA sugerido */}
                    {analysis.result.script_recreation && (
                      <div className="bg-cyan-950/20 border border-cyan-800 rounded-xl p-4">
                        <span className="text-cyan-400 text-xs font-semibold uppercase tracking-wider block">
                          CTA Sugerido
                        </span>
                        <p className="text-sm text-zinc-200 leading-relaxed mt-2">
                          {analysis.result.script_recreation.cta}
                        </p>
                        <button
                          onClick={() => {
                            navigator.clipboard.writeText(analysis.result.script_recreation.cta);
                            toast.success("CTA copiado com sucesso!");
                          }}
                          className="bg-cyan-900/50 text-cyan-300 text-xs px-3 py-1 rounded-lg hover:bg-cyan-800/50 transition-colors mt-3 cursor-pointer"
                        >
                          Copiar
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* ABA 2 — recreate */}
            {activeTab === "recreate" && (
              <div>
                {scriptState === "idle" && (
                  <div className="text-center py-16 bg-zinc-900 border border-zinc-800 rounded-2xl p-8">
                    <motion.div
                      className="inline-block cursor-pointer"
                      whileHover={{ rotate: 360 }}
                      transition={{ duration: 0.5 }}
                    >
                      <Clapperboard className="w-12 h-12 text-zinc-600 mx-auto" />
                    </motion.div>
                    <h3 className="text-xl font-bold mt-5 text-white">
                      Gerar roteiro original inspirado neste vídeo
                    </h3>
                    <p className="text-sm text-zinc-400 mt-2 max-w-sm mx-auto">
                      A IA cria um novo roteiro com a mesma essência, sem risco de plágio
                    </p>
                    <button
                      onClick={() => setScriptState("loading")}
                      className="bg-violet-600 hover:bg-violet-500 px-8 h-12 rounded-xl mt-6 text-sm font-semibold text-white transition-colors cursor-pointer"
                    >
                      🎬 Gerar Roteiro Agora
                    </button>
                  </div>
                )}

                {scriptState === "loading" && (
                  <div className="text-center py-16 bg-zinc-900 border border-zinc-800 rounded-2xl p-8">
                    <Loader2 className="w-8 h-8 text-violet-400 animate-spin mx-auto" />
                    <p className="text-sm text-zinc-400 mt-4 font-medium transition-all">
                      {loadingMsgIdx === 0 && "Analisando conceito original..."}
                      {loadingMsgIdx === 1 && "Criando estrutura única..."}
                      {loadingMsgIdx === 2 && "Calculando risco de plágio..."}
                    </p>
                  </div>
                )}

                {scriptState === "ready" && (
                  <div className="space-y-4">
                    <div className="flex gap-3 mb-5">
                      <span className="bg-green-900/50 text-green-300 border border-green-800 text-sm px-3 py-1 rounded-full font-semibold">
                        Risco de Plágio: 4%
                      </span>
                      <span className="bg-violet-900/50 text-violet-300 border border-violet-800 text-sm px-3 py-1 rounded-full font-semibold">
                        Potencial: 89%
                      </span>
                    </div>

                    {/* Hook */}
                    <div className="border-l-4 border-amber-500 bg-amber-950/20 rounded-xl p-4 mb-3">
                      <h4 className="text-amber-400 text-xs font-semibold uppercase mb-2">
                        🪝 Hook de Abertura
                      </h4>
                      <p className="text-sm text-zinc-200 leading-relaxed font-medium">
                        {analysis.result.script_recreation.hook}
                      </p>
                    </div>

                    {/* Desenvolvimento */}
                    <div className="border-l-4 border-violet-500 bg-violet-950/20 rounded-xl p-4 mb-3">
                      <h4 className="text-violet-400 text-xs font-semibold uppercase mb-2">
                        📝 Desenvolvimento
                      </h4>
                      <div className="text-sm text-zinc-200 leading-relaxed space-y-2">
                        {analysis.result.script_recreation.body.split("\n").map((para, i) => (
                          <p key={i}>{para}</p>
                        ))}
                      </div>
                    </div>

                    {/* CTA Final */}
                    <div className="border-l-4 border-cyan-500 bg-cyan-950/20 rounded-xl p-4 mb-3">
                      <h4 className="text-cyan-400 text-xs font-semibold uppercase mb-2">
                        🎯 CTA Final
                      </h4>
                      <p className="text-sm text-zinc-200 leading-relaxed font-medium">
                        {analysis.result.script_recreation.cta}
                      </p>
                    </div>

                    {/* Barra de botões */}
                    <div className="flex gap-3 mt-5 flex-wrap">
                      <button
                        onClick={() => {
                          navigator.clipboard.writeText(
                            `${analysis.result.script_recreation.hook}\n\n${analysis.result.script_recreation.body}\n\n${analysis.result.script_recreation.cta}`,
                          );
                          toast.success("Roteiro copiado para a área de transferência!");
                        }}
                        className="bg-zinc-800 hover:bg-zinc-700 px-4 h-9 rounded-xl text-sm text-zinc-300 transition-colors cursor-pointer font-medium"
                      >
                        📋 Copiar Roteiro
                      </button>
                      <button
                        onClick={() => {
                          const fullText = `🪝 Hook de Abertura:\n${analysis.result.script_recreation.hook}\n\n📝 Desenvolvimento:\n${analysis.result.script_recreation.body}\n\n🎯 CTA Final:\n${analysis.result.script_recreation.cta}`;
                          const blob = new Blob([fullText], { type: "text/plain;charset=utf-8" });
                          const url = URL.createObjectURL(blob);
                          const link = document.createElement("a");
                          link.href = url;
                          link.download = "roteiro.txt";
                          link.click();
                          URL.revokeObjectURL(url);
                          toast.success("Download do roteiro iniciado!");
                        }}
                        className="bg-zinc-800 hover:bg-zinc-700 px-4 h-9 rounded-xl text-sm text-zinc-300 transition-colors cursor-pointer font-medium"
                      >
                        📥 Exportar .TXT
                      </button>
                      <button
                        onClick={() => setScriptState("idle")}
                        className="bg-violet-600 hover:bg-violet-500 px-4 h-9 rounded-xl text-sm text-white transition-colors cursor-pointer font-medium animate-pulse"
                      >
                        🔄 Regenerar
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* ABA 3 — transcript */}
            {activeTab === "transcript" && (
              <div>
                <h3 className="text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-3">
                  TRANSCRIÇÃO DO VÍDEO
                </h3>

                {/* Lista */}
                <div className="space-y-1">
                  {analysis.result.transcript.map((line, i) => {
                    const lineClasses: Record<string, string> = {
                      hook: "bg-amber-950/40 border-l-2 border-amber-500",
                      cta: "bg-cyan-950/40 border-l-2 border-cyan-500",
                      highlight: "bg-violet-950/40 border-l-2 border-violet-500",
                      normal: "",
                    };
                    const cls = lineClasses[line.type] || "";
                    return (
                      <div
                        key={i}
                        className={`flex items-start gap-3 px-3 py-2 rounded-r-lg ${cls} transition-all`}
                      >
                        <span className="font-mono text-[10px] bg-zinc-800 text-zinc-400 px-1.5 py-0.5 rounded shrink-0 mt-0.5">
                          {line.timestamp}
                        </span>
                        <p className="text-sm text-zinc-200 leading-relaxed">{line.text}</p>
                      </div>
                    );
                  })}
                </div>

                {/* Legenda */}
                <div className="flex gap-4 mt-4 text-xs text-zinc-500 font-semibold">
                  <span>🟡 Hook</span>
                  <span>🔵 CTA</span>
                  <span>🟣 Destaque</span>
                  <span>⬜ Normal</span>
                </div>

                {/* Separador */}
                <div className="relative border-t border-zinc-800 my-7 flex items-center justify-center">
                  <button className="absolute bg-zinc-950 px-3 cursor-pointer">
                    <span className="bg-violet-600 hover:bg-violet-500 text-white text-sm px-5 h-9 rounded-xl flex items-center gap-1.5 transition-colors font-medium">
                      ✨ Remodelar com IA
                    </span>
                  </button>
                </div>

                {/* Seletor de estilo */}
                <div className="mt-8">
                  <span className="text-zinc-400 text-xs font-semibold uppercase tracking-wider block mb-3">
                    Estilo de Remodelagem
                  </span>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                    {[
                      "Mais Viral",
                      "Mais Emocional",
                      "Mais Engraçado",
                      "Mais Profissional",
                      "Mais Curto",
                      "Mais Impactante",
                    ].map((style) => {
                      const isSelected = selectedStyle === style;
                      return (
                        <button
                          key={style}
                          onClick={() => setSelectedStyle(style)}
                          className={
                            isSelected
                              ? "border border-violet-500 bg-violet-950/40 text-violet-300 rounded-lg px-3 py-2.5 text-sm transition-colors text-center font-semibold cursor-pointer"
                              : "border border-zinc-700 rounded-lg px-3 py-2.5 text-sm text-zinc-400 hover:border-zinc-500 transition-colors text-center cursor-pointer font-medium"
                          }
                        >
                          {style}
                        </button>
                      );
                    })}
                  </div>

                  {/* Botão remodelar */}
                  <button
                    disabled={selectedStyle === null}
                    onClick={triggerRewrite}
                    className={`mt-4 w-full h-10 rounded-xl text-sm font-medium transition-colors ${
                      selectedStyle !== null
                        ? "bg-violet-600 hover:bg-violet-500 text-white cursor-pointer"
                        : "bg-zinc-800 text-zinc-600 cursor-not-allowed"
                    }`}
                  >
                    Remodelar com IA
                  </button>
                </div>

                {/* Rewrite loading state */}
                {rewriteState === "loading" && (
                  <div className="flex flex-col items-center justify-center p-6 mt-4">
                    <Loader2 className="w-8 h-8 text-violet-400 animate-spin" />
                    <p className="text-sm text-zinc-400 mt-2 text-center font-medium">
                      IA reescrevendo roteiro...
                    </p>
                  </div>
                )}

                {/* Rewrite ready state */}
                {rewriteState === "ready" && selectedStyle && (
                  <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-5 mt-4">
                    <span className="bg-violet-800 text-violet-200 text-xs px-2 py-0.5 rounded mb-3 inline-block font-semibold">
                      Estilo: {selectedStyle}
                    </span>
                    <p className="text-sm leading-relaxed text-zinc-200">
                      {styleRewrites[selectedStyle]}
                    </p>
                    <div className="flex gap-2 mt-4">
                      <button
                        onClick={() => {
                          navigator.clipboard.writeText(styleRewrites[selectedStyle] || "");
                          toast.success("Roteiro reescrito copiado!");
                        }}
                        className="bg-zinc-800 text-sm px-4 h-8 rounded-lg text-zinc-300 hover:bg-zinc-700 transition-colors cursor-pointer font-medium"
                      >
                        Copiar
                      </button>
                      <button
                        onClick={() => {
                          const blob = new Blob([styleRewrites[selectedStyle] || ""], {
                            type: "text/plain;charset=utf-8",
                          });
                          const url = URL.createObjectURL(blob);
                          const link = document.createElement("a");
                          link.href = url;
                          link.download = `roteiro_reescrito_${selectedStyle
                            .toLowerCase()
                            .replace(" ", "_")}.txt`;
                          link.click();
                          URL.revokeObjectURL(url);
                          toast.success("Download do roteiro remodelado iniciado!");
                        }}
                        className="bg-zinc-800 text-sm px-4 h-8 rounded-lg text-zinc-300 hover:bg-zinc-700 transition-colors cursor-pointer font-medium"
                      >
                        Exportar TXT
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </main>
      </div>
    </AppLayout>
  );
}
