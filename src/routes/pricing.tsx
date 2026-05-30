/* eslint-disable @typescript-eslint/no-explicit-any */
import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Zap, Check, Sparkles, Loader2, Info } from "lucide-react";
import { useAuth } from "@/components/layout/AuthProvider";
import { createCheckoutSession } from "@/lib/stripe.server";
import { toast } from "sonner";
import { Toaster } from "@/components/ui/sonner";

export const Route = createFileRoute("/pricing")({
  head: () => ({
    meta: [
      { title: "Planos e Preços — ViralMind AI" },
      {
        name: "description",
        content: "Escolha o melhor plano para explodir suas visualizações e engajamento.",
      },
    ],
  }),
  component: PricingPage,
});

function PricingPage() {
  const navigate = useNavigate();
  const { user } = useAuth();

  const [billingPeriod, setBillingPeriod] = useState<"mensal" | "anual">("anual");
  const [loadingPlan, setLoadingPlan] = useState<string | null>(null);

  // Check URL parameters for cancellation alerts
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get("checkout_canceled") === "true") {
      toast.error("O pagamento foi cancelado. Se tiver dúvidas, fale com o suporte!");
      // Clean up URL
      window.history.replaceState({}, document.title, window.location.pathname);
    }
  }, []);

  const handleSubscribe = async (priceId: string, planName: string) => {
    if (!user) {
      toast.info("Por favor, crie uma conta para assinar o plano.");
      setTimeout(() => {
        navigate({ to: "/signup" });
      }, 1000);
      return;
    }

    setLoadingPlan(priceId);
    try {
      // Trigger the server function to create a checkout session
      const result = await createCheckoutSession({
        data: {
          priceId,
          userId: user.id,
          email: user.email || "",
        },
      });

      if (result && result.url) {
        // Redirect to Stripe checkout
        window.location.href = result.url;
      } else {
        toast.error("Erro ao iniciar faturamento. Tente novamente.");
        setLoadingPlan(null);
      }
    } catch (err: any) {
      console.error(err);
      toast.error(err.message || "Ocorreu um erro no servidor.");
      setLoadingPlan(null);
    }
  };

  const proPriceId = import.meta.env.VITE_STRIPE_MENSAL_PRICE_ID || "price_mensal_1090";
  const elitePriceId = import.meta.env.VITE_STRIPE_ANUAL_PRICE_ID || "price_anual_8990";

  return (
    <div className="min-h-screen bg-zinc-950 text-foreground overflow-x-hidden relative py-16 px-4">
      <Toaster />

      {/* Ambient glowing blobs */}
      <div className="absolute top-1/4 left-1/4 h-80 w-80 rounded-full bg-violet-600/10 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 h-96 w-96 rounded-full bg-primary/5 blur-[150px] pointer-events-none" />

      {/* Header */}
      <header className="max-w-3xl mx-auto text-center space-y-4 mb-12">
        <Link
          to="/"
          className="inline-flex items-center gap-2 mb-4 hover:scale-105 transition-transform duration-200"
        >
          <Zap className="h-6 w-6 text-primary" fill="currentColor" />
          <span className="text-xl font-bold tracking-tight text-white">ViralMind</span>
        </Link>
        <h1 className="text-4xl md:text-5xl font-black tracking-tight text-white">
          Planos simples para <span className="text-gradient-viral">crescer seu canal</span>
        </h1>
        <p className="text-zinc-400 max-w-lg mx-auto text-sm leading-relaxed">
          Analise a estrutura dos maiores virais da internet e multiplique seu tráfego com roteiros
          reescritos por IA.
        </p>

        {/* Switcher toggle */}
        <div className="inline-flex items-center gap-3 bg-zinc-900 border border-zinc-800 p-1 rounded-xl mt-6">
          <button
            onClick={() => setBillingPeriod("mensal")}
            className={`px-4 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer ${
              billingPeriod === "mensal"
                ? "bg-zinc-850 text-white border border-zinc-800 shadow"
                : "text-zinc-500 hover:text-zinc-300"
            }`}
          >
            Faturamento Mensal
          </button>
          <button
            onClick={() => setBillingPeriod("anual")}
            className={`px-4 py-1.5 rounded-lg text-xs font-semibold transition flex items-center gap-1.5 cursor-pointer ${
              billingPeriod === "anual"
                ? "bg-violet-650 text-white shadow"
                : "text-zinc-500 hover:text-zinc-300"
            }`}
          >
            Anual{" "}
            <span className="bg-green-950 text-green-300 text-[9px] font-bold px-1.5 py-0.5 rounded-full uppercase tracking-wider">
              Economize 30%
            </span>
          </button>
        </div>
      </header>

      {/* Cards Grid */}
      <main className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
        {/* Card 1: Free */}
        <motion.div
          whileHover={{ y: -4 }}
          className="rounded-2xl border border-zinc-850 bg-zinc-900/40 p-8 flex flex-col justify-between backdrop-blur shadow-xl relative"
        >
          <div>
            <span className="text-[10px] font-bold tracking-widest text-zinc-500 uppercase">
              Plano Gratuito
            </span>
            <div className="mt-3 flex items-baseline gap-1 text-white">
              <span className="text-4xl font-extrabold font-mono">R$ 0</span>
            </div>
            <p className="text-zinc-400 text-xs mt-2">
              Para experimentar e iniciar sua jornada de criador.
            </p>

            <div className="border-t border-zinc-850 mt-6 pt-6 space-y-3.5">
              <div className="flex gap-2.5 text-xs text-zinc-300 font-medium">
                <Check className="h-4 w-4 shrink-0 text-violet-400" />
                <span>5 créditos iniciais</span>
              </div>
              <div className="flex gap-2.5 text-xs text-zinc-300 font-medium">
                <Check className="h-4 w-4 shrink-0 text-violet-400" />
                <span>Análise viral de até 3 min</span>
              </div>
              <div className="flex gap-2.5 text-xs text-zinc-300 font-medium">
                <Check className="h-4 w-4 shrink-0 text-violet-400" />
                <span>Suporte básico por e-mail</span>
              </div>
            </div>
          </div>

          <div className="mt-8">
            <button
              onClick={() => navigate({ to: user ? "/dashboard" : "/signup" })}
              className="w-full h-11 border border-zinc-850 text-zinc-300 hover:bg-zinc-850/60 rounded-xl text-sm font-semibold transition cursor-pointer flex items-center justify-center"
            >
              {user ? "Acessar Painel →" : "Começar Agora"}
            </button>
          </div>
        </motion.div>

        {/* Card 2: Premium (Mensal/Anual) */}
        <motion.div
          whileHover={{ y: -4 }}
          className="rounded-2xl border border-violet-800 bg-gradient-to-b from-zinc-900/80 to-violet-950/20 p-8 flex flex-col justify-between backdrop-blur-xl shadow-2xl relative overflow-hidden"
        >
          {/* Accent border highlight */}
          <div className="absolute top-0 right-0 bg-violet-600 text-white text-[9px] font-bold uppercase tracking-wider px-4 py-1 rounded-bl-xl flex items-center gap-1">
            <Sparkles size={10} /> RECOMENDADO
          </div>

          <div>
            <span className="text-[10px] font-bold tracking-widest text-violet-300 uppercase">
              Acesso Ilimitado
            </span>
            <div className="mt-3 flex items-baseline gap-1 text-white">
              <span className="text-4xl font-extrabold font-mono">
                {billingPeriod === "mensal" ? "R$ 10,90" : "R$ 89,90"}
              </span>
              <span className="text-xs text-zinc-400">
                {billingPeriod === "mensal" ? "/mês" : "/ano"}
              </span>
            </div>
            <p className="text-zinc-400 text-xs mt-2">
              {billingPeriod === "mensal"
                ? "Cobrado mensalmente. Ideal para testes de curto prazo."
                : "Cobrado anualmente. Equivalente a apenas R$7,49/mês (Economia incrível!)"}
            </p>

            <div className="border-t border-violet-900/60 mt-6 pt-6 space-y-3.5">
              <div className="flex gap-2.5 text-xs text-zinc-200 font-semibold">
                <Check className="h-4 w-4 shrink-0 text-violet-400" />
                <span>50 créditos mensais recurrentes</span>
              </div>
              <div className="flex gap-2.5 text-xs text-zinc-300 font-medium">
                <Check className="h-4 w-4 shrink-0 text-violet-400" />
                <span>Roteiros Remodelados de IA ilimitados</span>
              </div>
              <div className="flex gap-2.5 text-xs text-zinc-300 font-medium">
                <Check className="h-4 w-4 shrink-0 text-violet-400" />
                <span>Análises de longa duração (até 60 min)</span>
              </div>
              <div className="flex gap-2.5 text-xs text-zinc-300 font-medium">
                <Check className="h-4 w-4 shrink-0 text-violet-400" />
                <span>Prioridade Suprema na Fila de Processamento</span>
              </div>
              <div className="flex gap-2.5 text-xs text-zinc-300 font-medium">
                <Check className="h-4 w-4 shrink-0 text-violet-400" />
                <span>Acesso exclusivo ao histórico de remodelagens</span>
              </div>
            </div>
          </div>

          <div className="mt-8">
            <button
              onClick={() =>
                handleSubscribe(
                  billingPeriod === "mensal" ? proPriceId : elitePriceId,
                  billingPeriod === "mensal" ? "Mensal" : "Anual",
                )
              }
              disabled={loadingPlan !== null}
              className="w-full h-11 bg-primary hover:bg-primary/90 text-primary-foreground rounded-xl text-sm font-semibold transition cursor-pointer flex items-center justify-center gap-2 shadow-lg shadow-primary/20"
            >
              {loadingPlan === (billingPeriod === "mensal" ? proPriceId : elitePriceId) ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <>
                  Assinar Plano Premium <Sparkles className="h-4 w-4" />
                </>
              )}
            </button>
          </div>
        </motion.div>
      </main>

      {/* Comparison table */}
      <section className="max-w-3xl mx-auto mt-24 border border-zinc-900 bg-zinc-950/40 rounded-2xl p-6 md:p-8 backdrop-blur">
        <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
          <Info size={18} className="text-violet-400" /> Comparativo Detalhado de Recursos
        </h2>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs md:text-sm">
            <thead>
              <tr className="border-b border-zinc-900 text-zinc-500 uppercase tracking-widest text-[10px] font-bold">
                <th className="py-3 px-2">Recurso</th>
                <th className="py-3 px-2">Free</th>
                <th className="py-3 px-2 text-violet-400">Premium</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-900 text-zinc-300 font-medium">
              <tr>
                <td className="py-3.5 px-2 text-white">Créditos de Análise</td>
                <td className="py-3.5 px-2">5 iniciais</td>
                <td className="py-3.5 px-2 text-violet-300 font-bold font-mono">50 / mês</td>
              </tr>
              <tr>
                <td className="py-3.5 px-2 text-white">Script Remodelado de IA</td>
                <td className="py-3.5 px-2 text-zinc-500">Apenas visualização</td>
                <td className="py-3.5 px-2 text-green-400">✓ Ilimitado</td>
              </tr>
              <tr>
                <td className="py-3.5 px-2 text-white">Duração do vídeo</td>
                <td className="py-3.5 px-2 font-mono">Até 3 min</td>
                <td className="py-3.5 px-2 font-mono text-white">Até 60 min</td>
              </tr>
              <tr>
                <td className="py-3.5 px-2 text-white">Fila de Processamento</td>
                <td className="py-3.5 px-2">Padrão</td>
                <td className="py-3.5 px-2 text-violet-300 font-bold">Ultra Prioritária</td>
              </tr>
              <tr>
                <td className="py-3.5 px-2 text-white">Roteiros Históricos</td>
                <td className="py-3.5 px-2 text-zinc-500">Não</td>
                <td className="py-3.5 px-2 text-green-400">✓ Sim</td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
