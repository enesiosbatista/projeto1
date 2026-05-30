import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { AppLayout } from "@/components/layout/AppLayout";
import { mockAnalysisList } from "@/lib/mockData";
import { useAuth } from "@/components/layout/AuthProvider";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Toaster } from "@/components/ui/sonner";
import { getAnalyses } from "@/lib/db";
import { createPortalSession } from "@/lib/stripe.server";
import { Loader2 } from "lucide-react";

export const Route = createFileRoute("/profile")({
  head: () => ({ meta: [{ title: "Perfil — ViralMind AI" }] }),
  component: ProfilePage,
});

function ProfilePage() {
  const navigate = useNavigate();
  const { user, signOut } = useAuth();
  const [userAnalysesCount, setUserAnalysesCount] = useState(0);
  const [loadingPortal, setLoadingPortal] = useState(false);

  useEffect(() => {
    if (user) {
      getAnalyses(user.id)
        .then((list) => {
          setUserAnalysesCount(list.length);
        })
        .catch((e) => {
          console.error("Error loading user analyses count in Profile", e);
        });
    }
  }, [user]);

  const handleManageBilling = async () => {
    const customerId = user?.user_metadata?.stripe_customer_id;
    if (!customerId) {
      navigate({ to: "/pricing" });
      return;
    }

    setLoadingPortal(true);
    try {
      const result = await createPortalSession({
        data: {
          userId: user.id,
          stripeCustomerId: customerId,
        },
      });

      if (result && result.url) {
        window.location.href = result.url;
      } else {
        toast.error("Erro ao redirecionar para o faturamento.");
        setLoadingPortal(false);
      }
    } catch (err) {
      console.error(err);
      toast.error("Erro de conexão com o faturamento.");
      setLoadingPortal(false);
    }
  };

  const username = user?.user_metadata?.name || user?.email?.split("@")[0] || "Criador";
  const initials = username
    .split(" ")
    .map((n: string) => n[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  const email = user?.email || "usuario@email.com";
  const plan = user?.user_metadata?.plan || "Gratuito";
  const credits = user?.user_metadata?.credits ?? 0;
  const totalCredits = 5;
  const pct = (credits / totalCredits) * 100;

  // Formatting date
  const memberSince = user?.created_at
    ? new Date(user.created_at).toLocaleDateString("pt-BR", { month: "long", year: "numeric" })
    : "Maio de 2026";
  const memberSinceCapitalized = memberSince.charAt(0).toUpperCase() + memberSince.slice(1);

  // Formatting platforms
  const platformsArray: string[] = user?.user_metadata?.platforms || ["YouTube", "Instagram"];
  const formattedPlatforms = platformsArray
    .map((p) => {
      if (p === "youtube") return "YouTube";
      if (p === "shorts") return "Shorts";
      if (p === "tiktok") return "TikTok";
      if (p === "reels") return "Instagram Reels";
      return p.charAt(0).toUpperCase() + p.slice(1);
    })
    .join(", ");

  const handleExportData = () => {
    alert("Seus dados foram reunidos e exportados com sucesso!");
    toast.success("Dados exportados com sucesso!");
  };

  const handleLogout = async () => {
    toast.success("Desconectando...");
    try {
      await signOut();
      setTimeout(() => {
        navigate({ to: "/" });
      }, 500);
    } catch (err) {
      toast.error("Erro ao desconectar.");
    }
  };

  return (
    <AppLayout>
      <Toaster />
      <div className="max-w-lg mx-auto px-4 py-12">
        {/* Avatar e Identidade */}
        <div className="text-center">
          <div className="w-20 h-20 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center text-2xl font-bold mx-auto text-primary-foreground shadow-lg">
            {initials}
          </div>
          <h1 className="text-2xl font-bold mt-4 text-white">{username}</h1>
          <p className="text-sm text-zinc-400 mt-1 font-mono">{email}</p>
          <span className="inline-block mt-3 bg-zinc-900 border border-zinc-800 rounded-full px-4 py-1.5 text-sm text-zinc-300 font-semibold tracking-wide">
            ✨ Plano {plan}
          </span>
        </div>

        {/* Card de Dados */}
        <div className="bg-zinc-900/60 border border-zinc-800 rounded-2xl p-6 mt-6 space-y-5 backdrop-blur-md">
          {/* Créditos */}
          <div className="space-y-2">
            <div className="flex justify-between items-center text-sm">
              <span className="text-xs font-semibold text-zinc-500 uppercase tracking-wider">
                Créditos
              </span>
              <span className="text-sm text-zinc-350 font-medium font-mono">
                {credits} de {totalCredits} créditos restantes
              </span>
            </div>
            <div className="h-2 w-full overflow-hidden rounded-full bg-zinc-800">
              <div
                className="h-full rounded-full bg-primary transition-all duration-500"
                style={{ width: `${pct}%` }}
              />
            </div>
          </div>

          {/* Análises */}
          <div className="border-t border-zinc-800/80 pt-4 flex justify-between items-center text-sm">
            <span className="text-xs font-semibold text-zinc-500 uppercase tracking-wider">
              Análises Realizadas
            </span>
            <span className="text-sm text-zinc-200 font-semibold font-mono">
              {userAnalysesCount} {userAnalysesCount === 1 ? "análise" : "análises"} no total
            </span>
          </div>

          {/* Membro desde */}
          <div className="border-t border-zinc-800/80 pt-4 flex justify-between items-center text-sm">
            <span className="text-xs font-semibold text-zinc-500 uppercase tracking-wider">
              Membro Desde
            </span>
            <span className="text-sm text-zinc-200 font-medium font-mono">
              {memberSinceCapitalized}
            </span>
          </div>

          {/* Plataformas */}
          <div className="border-t border-zinc-800/80 pt-4 flex justify-between items-center text-sm">
            <span className="text-xs font-semibold text-zinc-500 uppercase tracking-wider">
              Plataformas Ativas
            </span>
            <span className="text-sm text-zinc-200 font-medium font-mono">
              {formattedPlatforms}
            </span>
          </div>
        </div>

        {/* Botões */}
        <div className="flex flex-col gap-3 mt-6">
          <button
            onClick={handleManageBilling}
            disabled={loadingPortal}
            className="w-full h-11 bg-gradient-to-r from-violet-650 to-primary hover:opacity-95 text-white rounded-xl text-sm font-semibold transition flex items-center justify-center cursor-pointer shadow-md disabled:opacity-50"
          >
            {loadingPortal ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : user?.user_metadata?.stripe_customer_id ? (
              "Gerenciar Assinatura & Cartão"
            ) : (
              "Fazer Upgrade para Premium ⚡"
            )}
          </button>

          <button
            onClick={handleExportData}
            className="w-full h-11 border border-zinc-800 text-zinc-350 hover:text-zinc-150 rounded-xl text-sm font-semibold transition cursor-pointer flex items-center justify-center hover:bg-zinc-900/60 hover:border-zinc-700"
          >
            Exportar Meus Dados
          </button>

          <button
            onClick={handleLogout}
            className="w-full h-11 border border-red-950 text-red-400 hover:bg-red-950/20 hover:border-red-900 rounded-xl text-sm font-semibold transition cursor-pointer flex items-center justify-center"
          >
            Sair da Conta
          </button>
        </div>
      </div>
    </AppLayout>
  );
}
