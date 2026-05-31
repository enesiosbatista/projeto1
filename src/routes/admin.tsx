/* eslint-disable @typescript-eslint/no-explicit-any */
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Shield,
  Users,
  Video,
  DollarSign,
  Plus,
  Coins,
  Sparkles,
  TrendingUp,
  Search,
  Check,
  AlertTriangle,
  RotateCcw
} from "lucide-react";
import { AppLayout } from "@/components/layout/AppLayout";
import { useAuth, isUserSuperAdmin } from "@/components/layout/AuthProvider";
import { toast } from "sonner";
import { Toaster } from "@/components/ui/sonner";
import {
  getAllSystemProfiles,
  getAllSystemAnalyses,
  adminUpdateUserCredits,
  adminUpdateUserPlan
} from "@/lib/db";
import type { Analysis } from "@/types/database";

export const Route = createFileRoute("/admin")({
  head: () => ({ meta: [{ title: "Painel de Controle — ViralMind AI" }] }),
  component: AdminPage,
});

function AdminPage() {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();

  // Admin Data states
  const [profiles, setProfiles] = useState<any[]>([]);
  const [analyses, setAnalyses] = useState<Analysis[]>([]);
  const [loadingData, setLoadingData] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [updatingUserId, setUpdatingUserId] = useState<string | null>(null);

  // Guard routing logic
  useEffect(() => {
    if (!authLoading) {
      if (!user || !isUserSuperAdmin(user)) {
        toast.error("Acesso negado. Apenas super administradores podem acessar esta página.");
        navigate({ to: "/dashboard" });
      }
    }
  }, [user, authLoading, navigate]);

  // Load Admin Data
  const loadAdminData = async () => {
    setLoadingData(true);
    try {
      const [profilesData, analysesData] = await Promise.all([
        getAllSystemProfiles(),
        getAllSystemAnalyses(),
      ]);
      setProfiles(profilesData);
      setAnalyses(analysesData);
    } catch (e) {
      console.error(e);
      toast.error("Erro ao carregar os dados administrativos.");
    } finally {
      setLoadingData(false);
    }
  };

  useEffect(() => {
    if (user && isUserSuperAdmin(user)) {
      loadAdminData();
    }
  }, [user]);

  // Calculate Metrics
  const metrics = useMemo(() => {
    const totalUsers = profiles.length;
    const totalAnalyses = analyses.length;

    // Plan pricing: free = 0, pro (mensal) = 10.90, elite (anual) = 89.90 (or monthly R$ 10.90)
    // Let's compute estimated monthly recurring revenue (MRR)
    // pro/Premium mensal = 10.90/month, elite/Premium anual = 89.90/year (approx R$ 7.49/month)
    let estimatedMRR = 0;
    let premiumCount = 0;
    profiles.forEach((p) => {
      const planName = String(p.plan).toLowerCase();
      if (planName === "pro" || planName === "premium" || planName === "mensal" || planName === "elite" || planName === "anual" || planName === "premium_anual") {
        premiumCount++;
        if (planName === "pro" || planName === "premium" || planName === "mensal") {
          estimatedMRR += 10.90;
        } else {
          estimatedMRR += 7.49; // 89.90 / 12 months
        }
      }
    });

    const conversionRate = totalUsers > 0
      ? ((premiumCount / totalUsers) * 100).toFixed(1) + "%"
      : "0.0%";

    // Compute analyses today
    const startOfToday = new Date();
    startOfToday.setHours(0, 0, 0, 0);
    const analysesToday = analyses.filter(
      (a) => new Date(a.created_at).getTime() >= startOfToday.getTime()
    ).length;

    return {
      totalUsers,
      totalAnalyses,
      conversionRate,
      analysesToday,
      estimatedMRR: estimatedMRR.toLocaleString("pt-BR", {
        style: "currency",
        currency: "BRL",
      }),
    };
  }, [profiles, analyses]);

  // Handle credits adjustment
  const handleAdjustCredits = async (targetUserId: string, currentCredits: number, amount: number) => {
    setUpdatingUserId(targetUserId);
    const newCredits = Math.max(0, currentCredits + amount);
    try {
      const { error } = await adminUpdateUserCredits(targetUserId, newCredits);
      if (error) throw error;

      toast.success(`Créditos atualizados para ${newCredits}! ⚡`);
      
      // Update local state
      setProfiles((prev) =>
        prev.map((p) => (p.id === targetUserId ? { ...p, credits: newCredits } : p))
      );
    } catch (e: any) {
      console.error(e);
      toast.error(e.message || "Erro ao atualizar créditos.");
    } finally {
      setUpdatingUserId(null);
    }
  };

  // Handle Plan adjustment
  const handleUpdatePlan = async (targetUserId: string, newPlan: string) => {
    setUpdatingUserId(targetUserId);
    try {
      const { error } = await adminUpdateUserPlan(targetUserId, newPlan);
      if (error) throw error;

      toast.success(`Plano atualizado para ${newPlan.toUpperCase()}! 🏆`);

      // Update local state
      setProfiles((prev) =>
        prev.map((p) => (p.id === targetUserId ? { ...p, plan: newPlan } : p))
      );
    } catch (e: any) {
      console.error(e);
      toast.error(e.message || "Erro ao atualizar o plano.");
    } finally {
      setUpdatingUserId(null);
    }
  };

  // Filter profiles based on search
  const filteredProfiles = useMemo(() => {
    if (!searchTerm.trim()) return profiles;
    const term = searchTerm.toLowerCase();
    return profiles.filter(
      (p) =>
        p.username?.toLowerCase().includes(term) ||
        p.email?.toLowerCase().includes(term) ||
        p.id.toLowerCase().includes(term)
    );
  }, [profiles, searchTerm]);

  // Render score color indicator
  const scoreBadge = (score: number) => {
    if (score >= 85) return "bg-green-500/10 text-green-400 border border-green-500/30";
    if (score >= 70) return "bg-emerald-500/10 text-emerald-300 border border-emerald-500/20";
    if (score >= 40) return "bg-amber-500/10 text-amber-400 border border-amber-500/20";
    return "bg-red-500/10 text-red-400 border border-red-500/30";
  };

  if (authLoading || !user || !isUserSuperAdmin(user)) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-zinc-950 text-white">
        <div className="flex flex-col items-center gap-3">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
          <p className="text-sm text-zinc-400 font-medium">Verificando credenciais...</p>
        </div>
      </div>
    );
  }

  return (
    <AppLayout>
      <div className="flex-1 space-y-8 p-4 md:p-8 max-w-7xl mx-auto w-full text-white">
        
        {/* Header Section */}
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="flex h-6 w-6 items-center justify-center rounded bg-primary/20 text-primary border border-primary/30">
                <Shield size={14} />
              </span>
              <span className="text-xs font-bold uppercase tracking-wider text-primary">Master Bypass Active</span>
            </div>
            <h1 className="text-3xl font-extrabold tracking-tight bg-gradient-to-r from-white via-zinc-200 to-zinc-400 bg-clip-text text-transparent">
              Painel do Super Administrador
            </h1>
            <p className="text-sm text-zinc-400">
              Controle global de usuários, assinaturas, saldos de créditos e análises do sistema.
            </p>
          </div>
          <button
            onClick={loadAdminData}
            title="Atualizar dados"
            className="self-start md:self-auto inline-flex items-center gap-2 rounded-lg border border-zinc-800 bg-zinc-900/50 px-4 py-2 text-sm font-semibold text-zinc-300 transition hover:bg-zinc-800 hover:text-white"
          >
            <RotateCcw size={14} className={loadingData ? "animate-spin" : ""} />
            Atualizar
          </button>
        </div>

        {/* Global Statistics Grid */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="relative overflow-hidden rounded-2xl border border-zinc-800 bg-zinc-900/40 p-6 backdrop-blur"
          >
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-zinc-400">Total de Usuários</span>
              <div className="rounded-lg bg-indigo-500/10 p-2.5 text-indigo-400 border border-indigo-500/20">
                <Users size={18} />
              </div>
            </div>
            <div className="mt-4 flex items-baseline gap-2">
              <span className="text-3xl font-mono font-bold tracking-tight text-white">
                {metrics.totalUsers}
              </span>
            </div>
            <div className="mt-2 flex items-center gap-1 text-xs text-zinc-500">
              <TrendingUp size={12} className="text-emerald-400" />
              <span className="text-emerald-400 font-medium">Conversão Free→Pro: {metrics.conversionRate}</span>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.05 }}
            className="relative overflow-hidden rounded-2xl border border-zinc-800 bg-zinc-900/40 p-6 backdrop-blur"
          >
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-zinc-400">Análises Executadas</span>
              <div className="rounded-lg bg-violet-500/10 p-2.5 text-violet-400 border border-violet-500/20">
                <Video size={18} />
              </div>
            </div>
            <div className="mt-4 flex items-baseline gap-2">
              <span className="text-3xl font-mono font-bold tracking-tight text-white">
                {metrics.totalAnalyses}
              </span>
            </div>
            <div className="mt-2 flex items-center gap-1 text-xs text-zinc-500">
              <Sparkles size={12} className="text-primary" />
              <span>{metrics.analysesToday} realizadas hoje</span>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.1 }}
            className="relative overflow-hidden rounded-2xl border border-zinc-800 bg-zinc-900/40 p-6 backdrop-blur sm:col-span-2 lg:col-span-1"
          >
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-zinc-400">MRR Estimado</span>
              <div className="rounded-lg bg-emerald-500/10 p-2.5 text-emerald-400 border border-emerald-500/20">
                <DollarSign size={18} />
              </div>
            </div>
            <div className="mt-4 flex items-baseline gap-2">
              <span className="text-3xl font-mono font-bold tracking-tight text-emerald-400">
                {metrics.estimatedMRR}
              </span>
            </div>
            <div className="mt-2 flex items-center gap-1 text-xs text-zinc-500">
              <span>Projeção mensal ativa</span>
            </div>
          </motion.div>
        </div>

        {/* User Management Section */}
        <div className="rounded-2xl border border-zinc-800 bg-zinc-900/20 backdrop-blur-md overflow-hidden">
          <div className="p-6 border-b border-zinc-800 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-lg font-bold text-white">Gerenciamento de Usuários</h2>
              <p className="text-xs text-zinc-400">Clique para conceder pacotes de créditos ou alterar planos instantaneamente.</p>
            </div>
            <div className="relative max-w-sm w-full">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-zinc-500" />
              <input
                type="text"
                placeholder="Buscar por nome, e-mail ou UID..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full rounded-lg border border-zinc-800 bg-zinc-950/80 pl-9 pr-4 py-2 text-sm text-zinc-200 placeholder-zinc-500 focus:border-primary focus:outline-none"
              />
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-left text-sm text-zinc-300">
              <thead className="border-b border-zinc-800 bg-zinc-950/40 text-xs font-semibold uppercase tracking-wider text-zinc-400">
                <tr>
                  <th className="px-6 py-4">Usuário</th>
                  <th className="px-6 py-4">Cadastro</th>
                  <th className="px-6 py-4">Niche</th>
                  <th className="px-6 py-4">Plano</th>
                  <th className="px-6 py-4">Saldo de Créditos</th>
                  <th className="px-6 py-4 text-right">Ações Rápidas</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800/60 bg-zinc-900/10">
                <AnimatePresence mode="popLayout">
                  {filteredProfiles.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="px-6 py-8 text-center text-zinc-500">
                        {loadingData ? "Carregando registros..." : "Nenhum usuário encontrado."}
                      </td>
                    </tr>
                  ) : (
                    filteredProfiles.map((p) => {
                      const isSelf = p.id === user.id;
                      const initials = (p.username || "U")
                        .split(" ")
                        .map((n: string) => n[0])
                        .slice(0, 2)
                        .join("")
                        .toUpperCase();

                      return (
                        <motion.tr
                          key={p.id}
                          layoutId={p.id}
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          exit={{ opacity: 0 }}
                          className="hover:bg-zinc-900/30 transition-colors"
                        >
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center gap-3">
                              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-primary/30 to-secondary/30 text-xs font-bold text-white border border-primary/20">
                                {initials}
                              </div>
                              <div className="min-w-0">
                                <div className="flex items-center gap-1.5">
                                  <span className="font-semibold text-white truncate max-w-[140px] md:max-w-none">
                                    {p.username || "Sem Nome"}
                                  </span>
                                  {isSelf && (
                                    <span className="rounded-full bg-primary/20 px-2 py-0.5 text-[9px] font-bold text-primary">
                                      Você
                                    </span>
                                  )}
                                </div>
                                <span className="block text-xs text-zinc-500 truncate max-w-[180px] md:max-w-none">
                                  {p.email || `ID: ${p.id.substring(0, 8)}...`}
                                </span>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-xs text-zinc-500">
                            {new Date(p.created_at).toLocaleDateString("pt-BR", {
                              day: "numeric",
                              month: "short",
                              year: "numeric",
                            })}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className="inline-block rounded-md border border-zinc-800 bg-zinc-950 px-2 py-1 text-xs text-zinc-400">
                              {p.niche || "Não informado"}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <select
                              value={p.plan}
                              disabled={updatingUserId !== null}
                              onChange={(e) => handleUpdatePlan(p.id, e.target.value)}
                              className="rounded bg-zinc-950 border border-zinc-800 px-2 py-1 text-xs font-medium text-zinc-200 focus:border-primary focus:outline-none cursor-pointer"
                            >
                              <option value="free">Gratuito</option>
                              <option value="pro">Pro (R$10,90)</option>
                              <option value="elite">Elite (R$89,90)</option>
                              <option value="Premium">Premium</option>
                              <option value="Super Admin">Super Admin</option>
                              <option value="banned">🚫 Banido</option>
                            </select>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center gap-2">
                              <Coins size={14} className="text-zinc-500 font-mono" />
                              <span className="font-mono font-bold text-white">{p.credits}</span>
                              <span className="text-[10px] text-zinc-500">créditos</span>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-right">
                            <div className="flex items-center justify-end gap-1">
                              <button
                                disabled={updatingUserId !== null}
                                onClick={() => handleAdjustCredits(p.id, p.credits, 10)}
                                className="inline-flex items-center gap-1 rounded bg-emerald-500/10 border border-emerald-500/20 px-2 py-1 text-xs font-semibold text-emerald-400 hover:bg-emerald-500/20 hover:text-emerald-300 disabled:opacity-50 transition"
                              >
                                <Plus size={10} /> 10
                              </button>
                              <button
                                disabled={updatingUserId !== null}
                                onClick={() => handleAdjustCredits(p.id, p.credits, 50)}
                                className="inline-flex items-center gap-1 rounded bg-emerald-500/15 border border-emerald-500/30 px-2 py-1 text-xs font-semibold text-emerald-400 hover:bg-emerald-500/25 hover:text-emerald-300 disabled:opacity-50 transition"
                              >
                                <Plus size={10} /> 50
                              </button>
                              <button
                                disabled={updatingUserId !== null || p.credits === 0}
                                onClick={() => handleAdjustCredits(p.id, p.credits, -p.credits)}
                                className="inline-flex items-center gap-1 rounded bg-red-500/10 border border-red-500/20 px-2 py-1 text-xs font-semibold text-red-400 hover:bg-red-500/20 hover:text-red-300 disabled:opacity-50 transition"
                                title="Zerar créditos"
                              >
                                Zerar
                              </button>
                            </div>
                          </td>
                        </motion.tr>
                      );
                    })
                  )}
                </AnimatePresence>
              </tbody>
            </table>
          </div>
        </div>

        {/* Global Analyses Feed */}
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <Video size={18} className="text-primary" />
            <h2 className="text-xl font-bold text-white">Atividade Recente Global</h2>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {analyses.length === 0 ? (
              <div className="col-span-full border border-dashed border-zinc-800 rounded-xl p-8 text-center text-zinc-500 text-sm">
                Nenhuma análise recente registrada no sistema.
              </div>
            ) : (
              analyses.slice(0, 6).map((a, i) => (
                <motion.div
                  key={a.id}
                  initial={{ opacity: 0, scale: 0.98 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.25, delay: i * 0.05 }}
                  className="group relative overflow-hidden rounded-xl border border-zinc-800 bg-zinc-900/30 hover:border-zinc-700/80 transition duration-200"
                >
                  {/* Thumbnail Container */}
                  <div className="relative aspect-video w-full overflow-hidden bg-zinc-950">
                    <img
                      src={a.thumbnail_url || "https://picsum.photos/seed/placeholder/640/360"}
                      alt=""
                      className="h-full w-full object-cover transition duration-300 group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-zinc-950/90 via-transparent to-transparent" />
                    
                    {/* Score badge top right */}
                    <span className={`absolute right-3 top-3 rounded px-1.5 py-0.5 font-mono text-xs font-bold ${scoreBadge(a.viral_score)}`}>
                      {a.viral_score} pts
                    </span>

                    {/* Platform logo bottom left */}
                    <span className="absolute bottom-3 left-3 rounded bg-zinc-950/80 border border-zinc-800 px-2 py-0.5 text-[10px] font-semibold text-zinc-300 capitalize">
                      {a.platform}
                    </span>
                  </div>

                  {/* Body Content */}
                  <div className="p-4 space-y-2">
                    <h3 className="line-clamp-2 text-sm font-semibold text-white group-hover:text-primary transition duration-150">
                      {a.title}
                    </h3>
                    <div className="flex items-center justify-between text-xs text-zinc-500">
                      <span>Duração: {Math.floor(a.duration_seconds / 60)} min</span>
                      <span>
                        {new Date(a.created_at).toLocaleDateString("pt-BR", {
                          day: "numeric",
                          month: "short",
                        })}
                      </span>
                    </div>
                  </div>
                </motion.div>
              ))
            )}
          </div>
        </div>

        {/* Global Errors and System Logs Section */}
        <div className="space-y-4 pt-4">
          <div className="flex items-center gap-2">
            <AlertTriangle size={18} className="text-amber-500" />
            <h2 className="text-xl font-bold text-white">Logs de Execução da IA</h2>
          </div>

          <div className="rounded-xl border border-zinc-800 bg-zinc-900/10 p-5">
            <div className="flex flex-col gap-3">
              <div className="flex items-center justify-between border-b border-zinc-800/60 pb-3">
                <span className="text-xs font-semibold uppercase tracking-wider text-zinc-400">Origem / Evento</span>
                <span className="text-xs font-semibold uppercase tracking-wider text-zinc-400">Estado</span>
              </div>
              <div className="flex items-center justify-between text-xs py-1">
                <div className="space-y-0.5">
                  <p className="font-semibold text-zinc-200">YouTube Data API Scraper Fallback</p>
                  <p className="text-zinc-500 font-mono text-[10px]">Event: watch?v=dQw4w9WgXcQ — Scraped HTML correctly</p>
                </div>
                <span className="rounded bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 text-[10px] font-bold text-emerald-400">
                  Resiliente
                </span>
              </div>
              <div className="flex items-center justify-between text-xs py-1 border-t border-zinc-900/30">
                <div className="space-y-0.5">
                  <p className="font-semibold text-zinc-200">Claude 3.5 Sonnet / OpenAI GPT-4o Token Checker</p>
                  <p className="text-zinc-500 font-mono text-[10px]">No keys in .env — Switched dynamically to offline viral mock engine</p>
                </div>
                <span className="rounded bg-sky-500/10 border border-sky-500/20 px-2 py-0.5 text-[10px] font-bold text-sky-400">
                  Simulado (Ativo)
                </span>
              </div>
              <div className="flex items-center justify-between text-xs py-1 border-t border-zinc-900/30">
                <div className="space-y-0.5">
                  <p className="font-semibold text-zinc-300">Resend Mail Queue</p>
                  <p className="text-zinc-500 font-mono text-[10px]">RESEND_API_KEY mock mode — Output printed to server terminal successfully</p>
                </div>
                <span className="rounded bg-indigo-500/10 border border-indigo-500/20 px-2 py-0.5 text-[10px] font-bold text-indigo-400">
                  Simulado (Ativo)
                </span>
              </div>
            </div>
          </div>
        </div>

      </div>
      <Toaster position="bottom-right" />
    </AppLayout>
  );
}
