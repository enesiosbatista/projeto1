import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { ChevronDown, SearchX, Sparkles } from "lucide-react";
import { AppLayout } from "@/components/layout/AppLayout";
import { AnalysisCard } from "@/components/features/AnalysisCard";
import { mockAnalysisList, mockUser } from "@/lib/mockData";

export const Route = createFileRoute("/dashboard")({
  head: () => ({ meta: [{ title: "Dashboard — ViralMind AI" }] }),
  component: DashboardPage,
});

type Filter = "all" | "viral" | "flop";
type Sort = "recent" | "high" | "low";

const formatDate = () => {
  return new Date().toLocaleDateString("pt-BR", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });
};

function DashboardPage() {
  const [filter, setFilter] = useState<Filter>("all");
  const [sort, setSort] = useState<Sort>("recent");
  const [favorites, setFavorites] = useState<Set<string>>(
    () => new Set([mockAnalysisList[0].id, mockAnalysisList[2].id]),
  );
  const [deleted, setDeleted] = useState<Set<string>>(new Set());
  const [favOpen, setFavOpen] = useState(false);

  const list = useMemo(() => {
    let arr = mockAnalysisList.filter((a) => !deleted.has(a.id));
    if (filter === "viral") arr = arr.filter((a) => a.viral_score >= 70);
    if (filter === "flop") arr = arr.filter((a) => a.viral_score < 70);
    if (sort === "high") arr = [...arr].sort((a, b) => b.viral_score - a.viral_score);
    if (sort === "low") arr = [...arr].sort((a, b) => a.viral_score - b.viral_score);
    return arr;
  }, [filter, sort, deleted]);

  const favList = useMemo(
    () => mockAnalysisList.filter((a) => favorites.has(a.id) && !deleted.has(a.id)),
    [favorites, deleted],
  );

  const toggleFav = (id: string) =>
    setFavorites((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });

  const remove = (id: string) => setDeleted((prev) => new Set(prev).add(id));

  const creditsTotal = 5;
  const creditPct = (mockUser.credits / creditsTotal) * 100;

  return (
    <AppLayout>
      <div className="mx-auto w-full max-w-7xl px-4 py-6 md:px-6 md:py-8">
        {/* Header */}
        <header>
          <h1 className="text-2xl font-bold text-white md:text-3xl">Olá, {mockUser.username} 👋</h1>
          <p className="mt-1 text-sm capitalize text-zinc-400">{formatDate()}</p>
        </header>

        {/* Credits */}
        <section className="mt-6 grid grid-cols-1 gap-4 rounded-2xl border border-primary/30 bg-gradient-to-br from-zinc-950 to-primary/10 p-5 md:grid-cols-2 md:p-6">
          <div>
            <span className="inline-block rounded-md bg-zinc-700 px-2 py-0.5 text-xs font-medium text-zinc-200">
              Plano Gratuito
            </span>
            <p className="mt-3 text-2xl font-bold text-white">
              {mockUser.credits} créditos restantes
            </p>
            <p className="mt-1 text-sm text-zinc-400">Cada análise usa 1 crédito</p>
            <div className="mt-3 h-2 w-full overflow-hidden rounded-full bg-zinc-800">
              <div
                className="h-full rounded-full bg-primary transition-all"
                style={{ width: `${creditPct}%` }}
              />
            </div>
          </div>
          <div className="flex flex-col justify-between rounded-xl border border-primary/20 bg-zinc-900/60 p-4">
            <div>
              <p className="text-sm font-semibold text-primary">Pro — R$47/mês</p>
              <p className="mt-1 text-xs text-zinc-400">50 análises/mês + prioridade na fila</p>
            </div>
            <button className="mt-3 inline-flex items-center justify-center gap-1 rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground transition hover:bg-primary/90">
              <Sparkles size={14} /> Fazer Upgrade →
            </button>
          </div>
        </section>

        {/* Filters */}
        <section className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-wrap items-center gap-2">
            {(
              [
                { id: "all", label: "Todos" },
                { id: "viral", label: "Viralizou ✅" },
                { id: "flop", label: "Não viralizou ⚠️" },
              ] as { id: Filter; label: string }[]
            ).map((f) => (
              <button
                key={f.id}
                onClick={() => setFilter(f.id)}
                className={`rounded-full border px-3 py-1.5 text-xs font-medium transition ${
                  filter === f.id
                    ? "border-primary bg-primary/20 text-white"
                    : "border-zinc-700 text-zinc-400 hover:border-zinc-600 hover:text-zinc-200"
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>
          <select
            value={sort}
            onChange={(e) => setSort(e.target.value as Sort)}
            className="rounded-lg border border-zinc-700 bg-zinc-900 px-3 py-2 text-sm text-zinc-200 focus:border-primary focus:outline-none"
          >
            <option value="recent">Mais recentes</option>
            <option value="high">Maior score</option>
            <option value="low">Menor score</option>
          </select>
        </section>

        {/* Analyses grid */}
        <section className="mt-6">
          <h2 className="mb-4 text-lg font-semibold text-white">Suas Análises</h2>
          {list.length === 0 ? (
            <div className="flex flex-col items-center justify-center rounded-2xl border border-zinc-800 bg-zinc-900 p-12 text-center">
              <SearchX size={48} className="text-zinc-600" />
              <p className="mt-3 text-zinc-400">Nenhuma análise encontrada</p>
              <Link
                to="/analyze"
                className="mt-4 rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground transition hover:bg-primary/90"
              >
                Nova Análise
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {list.map((a, i) => (
                <AnalysisCard
                  key={a.id}
                  analysis={a}
                  index={i}
                  isFavorite={favorites.has(a.id)}
                  onToggleFavorite={toggleFav}
                  onDelete={remove}
                />
              ))}
            </div>
          )}
        </section>

        {/* Favorites accordion */}
        <section className="mt-8 rounded-2xl border border-zinc-800 bg-zinc-900/50">
          <button
            onClick={() => setFavOpen((o) => !o)}
            className="flex w-full items-center justify-between gap-3 px-5 py-4 text-left"
          >
            <span className="flex items-center gap-2 text-base font-semibold text-white">
              ⭐ Favoritos
              <span className="rounded-full bg-amber-900/50 px-2 py-0.5 text-xs text-amber-300">
                {favList.length}
              </span>
            </span>
            <ChevronDown
              size={18}
              className={`text-zinc-400 transition ${favOpen ? "rotate-180" : ""}`}
            />
          </button>
          {favOpen && (
            <div className="border-t border-zinc-800 p-5">
              {favList.length === 0 ? (
                <p className="text-center text-sm text-zinc-500">Nenhum favorito ainda</p>
              ) : (
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  {favList.map((a, i) => (
                    <AnalysisCard
                      key={a.id}
                      analysis={a}
                      index={i}
                      isFavorite
                      onToggleFavorite={toggleFav}
                      onDelete={remove}
                    />
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
