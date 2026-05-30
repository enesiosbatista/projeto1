import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ChevronDown,
  ChevronUp,
  SearchX,
  Sparkles,
  Award,
  Flame,
  TrendingUp,
  Calendar,
  Heart,
} from "lucide-react";
import { AppLayout } from "@/components/layout/AppLayout";
import { AnalysisCard } from "@/components/features/AnalysisCard";
import { ProfileScoreCard } from "@/components/ui/ProfileScoreCard";
import { AlertBanner } from "@/components/ui/AlertBanner";
import { mockAnalysisList } from "@/lib/mockData";
import type { Analysis } from "@/types/database";
import { useAuth } from "@/components/layout/AuthProvider";
import { toast } from "sonner";
import { Toaster } from "@/components/ui/sonner";

import { getAnalyses, toggleFavoriteAnalysis, deleteAnalysis, saveAnalysis } from "@/lib/db";

export const Route = createFileRoute("/dashboard")({
  head: () => ({ meta: [{ title: "Dashboard — ViralMind AI" }] }),
  component: DashboardPage,
});

const getFormattedDate = () => {
  const dateStr = new Intl.DateTimeFormat("pt-BR", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(new Date());
  // Capitalize the first letter
  return dateStr.charAt(0).toUpperCase() + dateStr.slice(1);
};

type Filter = "all" | "viralized" | "not_viralized";
type Sort = "recent" | "highest" | "lowest";

function DashboardPage() {
  const navigate = useNavigate();
  const { user } = useAuth();

  // Handle Stripe Checkout success redirection
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get("checkout_success") === "true") {
      toast.success("Parabéns! Sua assinatura Premium foi ativada com sucesso. ⚡");

      // In local dummy mode, force-upgrade the mock session immediately
      const userStr = localStorage.getItem("viralmind_user");
      if (userStr) {
        try {
          const u = JSON.parse(userStr);
          u.user_metadata = {
            ...u.user_metadata,
            plan: "Premium",
            credits: 50,
            stripe_customer_id: "cus_mock_billing_123",
          };
          localStorage.setItem("viralmind_user", JSON.stringify(u));

          const sessionStr = localStorage.getItem("viralmind_session");
          if (sessionStr) {
            const s = JSON.parse(sessionStr);
            localStorage.setItem("viralmind_session", JSON.stringify({ ...s, user: u }));
          }

          // Smoothly refresh after showing the success toast
          setTimeout(() => {
            window.location.href = "/dashboard";
          }, 1800);
        } catch (e) {
          console.error(e);
        }
      }
    }
  }, []);

  // Alerts state
  const [alerts, setAlerts] = useState([
    {
      id: 1,
      message: "📈 Seu melhor formato está crescendo — explore mais Shorts",
      type: "info" as const,
    },
    {
      id: 2,
      message: "⚠️ Seu engajamento caiu 12% esta semana",
      type: "warning" as const,
    },
  ]);

  const handleDismissAlert = (id: number) => {
    setAlerts((prev) => prev.filter((a) => a.id !== id));
  };

  // Profile scores static values (mock metrics)
  const profileMetrics = [
    {
      label: "Geral",
      value: 84,
      icon: Award,
      description: "Score médio do seu perfil geral.",
    },
    {
      label: "Viralização",
      value: 78,
      icon: Flame,
      description: "Potencial de viralização estimado.",
    },
    {
      label: "Retenção",
      value: 82,
      icon: TrendingUp,
      description: "Retenção média do público.",
    },
    {
      label: "Consistência",
      value: 95,
      icon: Calendar,
      description: "Frequência e consistência de postagens.",
    },
    {
      label: "Engajamento",
      value: 71,
      icon: Heart,
      description: "Taxa de interação e engajamento.",
    },
  ];

  // Analysis list state
  const [analysisList, setAnalysisList] = useState<(Analysis & { isFavorited?: boolean })[]>([]);

  useEffect(() => {
    if (user) {
      getAnalyses(user.id)
        .then((list) => {
          if (list.length > 0) {
            setAnalysisList(list);
          } else {
            // Initialize mock ones in user DB scope if completely empty on first load
            const initial = mockAnalysisList.map((item, idx) => ({
              ...item,
              user_id: user.id,
              isFavorited: idx === 0 || idx === 2,
            }));
            Promise.all(initial.map((item) => saveAnalysis(item))).then(() => {
              setAnalysisList(initial);
            });
          }
        })
        .catch((e) => {
          console.error("Error fetching user analyses in Dashboard", e);
        });
    }
  }, [user]);

  const [filter, setFilter] = useState<Filter>("all");
  const [sort, setSort] = useState<Sort>("recent");
  const [favOpen, setFavOpen] = useState(false);

  // Favorite toggle handler
  const handleFavorite = async (id: string) => {
    if (!user) return;
    const target = analysisList.find((a) => a.id === id);
    if (!target) return;

    const nextFavorited = !target.isFavorited;

    // Optimistic UI update
    setAnalysisList((prev) =>
      prev.map((a) => (a.id === id ? { ...a, isFavorited: nextFavorited } : a)),
    );

    try {
      await toggleFavoriteAnalysis(user.id, id, nextFavorited);
    } catch (e) {
      console.error("Error toggling favorite", e);
    }
  };

  // Delete handler
  const handleDelete = async (id: string) => {
    if (!user) return;

    // Optimistic UI update
    setAnalysisList((prev) => prev.filter((a) => a.id !== id));

    try {
      await deleteAnalysis(user.id, id);
    } catch (e) {
      console.error("Error deleting analysis", e);
    }
  };

  // Filter and Sort memoized list
  const filteredAndSortedList = useMemo(() => {
    let arr = analysisList;
    if (filter === "viralized") {
      arr = arr.filter((a) => a.viral_score >= 70);
    } else if (filter === "not_viralized") {
      arr = arr.filter((a) => a.viral_score < 70);
    }

    if (sort === "highest") {
      arr = [...arr].sort((a, b) => b.viral_score - a.viral_score);
    } else if (sort === "lowest") {
      arr = [...arr].sort((a, b) => a.viral_score - b.viral_score);
    } else {
      // 'recent'
      arr = [...arr].sort(
        (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime(),
      );
    }
    return arr;
  }, [analysisList, filter, sort]);

  // Favorites list memoized
  const favoritesList = useMemo(() => {
    return analysisList.filter((a) => a.isFavorited);
  }, [analysisList]);

  // Motion variants for stagger
  const listVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.05,
      },
    },
  };

  const username = user?.user_metadata?.name || user?.email?.split("@")[0] || "Criador";
  const userPlan = user?.user_metadata?.plan || "Gratuito";
  const credits = user?.user_metadata?.credits ?? 0;
  const maxCredits = 5;
  const creditPct = (credits / maxCredits) * 100;

  return (
    <AppLayout>
      <Toaster />
      <div className="mx-auto w-full max-w-7xl px-4 py-6 md:px-6 md:py-8">
        {/* Header */}
        <header className="mb-6">
          <h1 className="text-3xl font-bold text-white">Olá, {username} 👋</h1>
          <p className="mt-1 text-sm text-zinc-500">{getFormattedDate()}</p>
        </header>

        {/* Alert Banners */}
        <AnimatePresence>
          {alerts.map((alert) => (
            <motion.div
              key={alert.id}
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.25 }}
              className="overflow-hidden"
            >
              <AlertBanner
                message={alert.message}
                type={alert.type}
                onDismiss={() => handleDismissAlert(alert.id)}
              />
            </motion.div>
          ))}
        </AnimatePresence>

        {/* Bloco de Créditos */}
        <section className="mb-6 grid grid-cols-1 gap-6 rounded-2xl border border-violet-800 bg-gradient-to-r from-zinc-900 to-violet-950/50 p-5 md:grid-cols-2">
          <div className="flex flex-col justify-center">
            <span className="inline-flex self-start rounded-md bg-violet-900/40 border border-violet-700 px-2 py-0.5 text-xs font-semibold text-violet-300">
              Plano {userPlan}
            </span>
            <p className="mt-3 font-mono text-2xl font-bold text-white">
              {credits} {credits === 1 ? "crédito restante" : "créditos restantes"}
            </p>
            <p className="mt-1 text-xs text-zinc-400">Cada análise consome 1 crédito.</p>
            {/* Progress Bar */}
            <div className="mt-4 h-2 w-full overflow-hidden rounded-full bg-zinc-800">
              <div
                className="h-full rounded-full bg-violet-600 transition-all duration-550"
                style={{ width: `${creditPct}%` }}
              />
            </div>
          </div>
          <div className="flex flex-col justify-between rounded-xl border border-violet-800/30 bg-zinc-900/60 p-4">
            <div>
              <p className="text-sm font-bold text-violet-300">
                Premium — R$10,90/mês ou R$89,90/ano
              </p>
              <p className="mt-1 text-xs text-zinc-400">
                50 análises/mês + prioridade suprema + remodelagens de roteiro ilimitadas
              </p>
            </div>
            <button
              onClick={() => navigate({ to: "/pricing" })}
              className="mt-4 inline-flex items-center justify-center gap-1.5 rounded-xl bg-violet-600 hover:bg-violet-500 text-white font-semibold text-sm h-10 px-4 transition cursor-pointer"
            >
              <Sparkles size={14} /> Fazer Upgrade Premium →
            </button>
          </div>
        </section>

        {/* ProfileScoreCards */}
        <section className="mb-8">
          <h2 className="mb-3 text-xs font-semibold text-zinc-400 uppercase tracking-wider">
            DESEMPENHO DO PERFIL
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
            {profileMetrics.map((pm, idx) => (
              <ProfileScoreCard
                key={idx}
                label={pm.label}
                value={pm.value}
                icon={pm.icon}
                description={pm.description}
              />
            ))}
          </div>
        </section>

        {/* Filtros e Ordenação */}
        <section className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-t border-zinc-800 pt-6">
          {/* Pills Filter */}
          <div className="flex flex-wrap items-center gap-2">
            {[
              { id: "all", label: "Todos" },
              { id: "viralized", label: "Viralizou ✅" },
              { id: "not_viralized", label: "Não viralizou ⚠️" },
            ].map((f) => {
              const active = filter === f.id;
              return (
                <button
                  key={f.id}
                  onClick={() => setFilter(f.id as Filter)}
                  className={`rounded-full px-4 py-1.5 text-xs font-semibold transition cursor-pointer ${
                    active
                      ? "bg-violet-600 text-white"
                      : "bg-zinc-800 text-zinc-400 hover:bg-zinc-700 hover:text-zinc-200"
                  }`}
                >
                  {f.label}
                </button>
              );
            })}
          </div>

          {/* Sort Select */}
          <div>
            <select
              value={sort}
              onChange={(e) => setSort(e.target.value as Sort)}
              className="bg-zinc-900 border border-zinc-700 rounded-lg text-sm text-zinc-200 px-3 py-2 focus:outline-none focus:border-violet-500 cursor-pointer"
            >
              <option value="recent">Mais recentes</option>
              <option value="highest">Maior score</option>
              <option value="lowest">Menor score</option>
            </select>
          </div>
        </section>

        {/* Analyses Grid */}
        <section className="mt-6">
          {filteredAndSortedList.length === 0 ? (
            <div className="flex flex-col items-center justify-center rounded-2xl border border-zinc-800 bg-zinc-900/40 p-16 text-center">
              <SearchX size={48} className="text-zinc-600" />
              <h3 className="mt-4 text-base font-bold text-white">Nenhuma análise encontrada</h3>
              <p className="mt-1 text-xs text-zinc-500 max-w-xs">
                Tente alterar seus filtros ou crie uma nova análise agora mesmo.
              </p>
              <Link
                to="/analyze"
                className="mt-5 inline-flex items-center justify-center rounded-xl bg-violet-600 hover:bg-violet-500 text-white text-sm font-semibold h-10 px-5 transition cursor-pointer"
              >
                Nova Análise
              </Link>
            </div>
          ) : (
            <motion.div
              variants={listVariants}
              initial="hidden"
              animate="show"
              className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3"
            >
              {filteredAndSortedList.map((a, i) => (
                <div key={a.id}>
                  <AnalysisCard
                    analysis={a}
                    index={i}
                    isFavorite={a.isFavorited || false}
                    onToggleFavorite={handleFavorite}
                    onDelete={handleDelete}
                    // Explicitly pass the link destination for safety
                    linkTo={`/result/${a.id}`}
                  />
                </div>
              ))}
            </motion.div>
          )}
        </section>

        {/* Accordion Favoritos */}
        <section className="mt-8 rounded-2xl border border-zinc-800 bg-zinc-900/30 overflow-hidden">
          <button
            onClick={() => setFavOpen((o) => !o)}
            className="flex w-full items-center justify-between gap-3 px-5 py-4 text-left hover:bg-zinc-800/30 transition cursor-pointer"
          >
            <span className="flex items-center gap-2 text-base font-bold text-white">
              ⭐ Favoritos
              <span className="rounded-full bg-amber-900/40 border border-amber-800/60 px-2 py-0.5 text-xs font-semibold text-amber-300">
                {favoritesList.length}
              </span>
            </span>
            {favOpen ? (
              <ChevronUp size={18} className="text-zinc-400" />
            ) : (
              <ChevronDown size={18} className="text-zinc-400" />
            )}
          </button>

          {favOpen && (
            <div className="border-t border-zinc-800 p-5 bg-zinc-950/20">
              {favoritesList.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-sm text-zinc-500">Nenhum favorito selecionado ainda.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  {favoritesList.map((a, i) => (
                    <div key={a.id}>
                      <AnalysisCard
                        analysis={a}
                        index={i}
                        isFavorite={true}
                        onToggleFavorite={handleFavorite}
                        onDelete={handleDelete}
                        linkTo={`/result/${a.id}`}
                      />
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </section>
      </div>
    </AppLayout>
  );
}
