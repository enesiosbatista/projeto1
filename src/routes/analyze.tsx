/* eslint-disable @typescript-eslint/no-explicit-any */
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState, useRef } from "react";
import { motion } from "framer-motion";
import { Brain } from "lucide-react";
import { AppLayout } from "@/components/layout/AppLayout";
import { LoadingSteps } from "@/components/ui/LoadingSteps";
import { useAuth } from "@/components/layout/AuthProvider";
import { toast } from "sonner";
import { analyzeVideoOnServer } from "@/lib/videoAnalysis.server";
import { triggerZeroCreditsEmail } from "@/lib/resend.server";

export const Route = createFileRoute("/analyze")({
  head: () => ({
    meta: [
      { title: "Analisando vídeo — ViralMind AI" },
      { name: "description", content: "A IA está analisando seu vídeo." },
    ],
  }),
  component: AnalyzePage,
});

const STEPS = [
  { delay: 0, label: "🔍 Identificando plataforma e vídeo..." },
  { delay: 2500, label: "📥 Extraindo metadados do vídeo..." },
  { delay: 6000, label: "🧠 IA analisando estrutura e emoções..." },
  { delay: 12000, label: "📊 Calculando Score de Viralização..." },
  { delay: 20000, label: "✍️ Gerando relatório personalizado..." },
  { delay: 27000, label: "✅ Análise concluída! Redirecionando..." },
];

const TOTAL_MS = 30000;

function AnalyzePage() {
  const navigate = useNavigate();
  const { user, updateCredits } = useAuth();
  const [currentStep, setCurrentStep] = useState(0);
  const [progress, setProgress] = useState(0);
  const generationTriggered = useRef(false);

  useEffect(() => {
    // 1. Credit Protection Guard
    if (user) {
      const credits = user.user_metadata?.credits ?? 0;
      if (credits <= 0) {
        toast.error("Você não possui créditos suficientes! Faça upgrade para o plano Premium.");
        navigate({ to: "/dashboard" });
        return;
      }
    } else {
      // If not logged in, redirect to login
      toast.info("Por favor, faça login para analisar vídeos.");
      navigate({ to: "/login" });
      return;
    }

    // 2. Slow progress simulation (caps at 95% until server function resolves)
    const timeouts = STEPS.slice(0, 5).map((s, i) => setTimeout(() => setCurrentStep(i), s.delay));
    const start = Date.now();
    const interval = setInterval(() => {
      const elapsed = Date.now() - start;
      setProgress((prev) => {
        const next = Math.min(95, (elapsed / TOTAL_MS) * 95);
        return next > prev ? next : prev;
      });
    }, 80);

    // 3. Trigger Asynchronous Server-side Analysis Pipeline
    if (user && !generationTriggered.current) {
      generationTriggered.current = true;

      // Extract pending URL and platform from localStorage
      let pendingUrl = "https://youtube.com/watch?v=custom";
      let pendingPlatform = "youtube";
      const pendingStr = localStorage.getItem("viralmind:pending");
      if (pendingStr) {
        try {
          const parsed = JSON.parse(pendingStr);
          pendingUrl = parsed.url;
          pendingPlatform = parsed.platform;
          localStorage.removeItem("viralmind:pending");
        } catch (e) {
          console.error(e);
        }
      }

      console.log(
        `[Analyze Client] Launching real server analysis pipeline for URL: ${pendingUrl}`,
      );

      analyzeVideoOnServer({
        data: {
          url: pendingUrl,
          platform: pendingPlatform as any,
          userId: user.id,
          email: user.email || "",
        },
      })
        .then(async (newAnalysis) => {
          // Synchronize credits and local state for Local Dummy / Production Supabase modes
          const isDummySupabase =
            !import.meta.env.VITE_SUPABASE_URL ||
            import.meta.env.VITE_SUPABASE_URL.includes("your-supabase-project");

          if (isDummySupabase) {
            const credits = user.user_metadata?.credits ?? 5;
            const nextCredits = Math.max(0, credits - 1);
            await updateCredits(nextCredits);

            // Trigger transactional out-of-credits email if user hits 0 in mock mode
            if (nextCredits === 0 && user.email) {
              const username = user.user_metadata?.name || user.email.split("@")[0];
              triggerZeroCreditsEmail({
                data: {
                  email: user.email,
                  name: username,
                },
              }).catch((e) =>
                console.error("[Zero Credits Email Error] Failed to send email alert:", e),
              );
            }

            // In simulated mode, manually persist analysis in simulated localstorage database
            const key = `viralmind_analyses_${user.id}`;
            const stored = localStorage.getItem(key);
            let list = [];
            if (stored) {
              try {
                list = JSON.parse(stored);
              } catch (e) {
                console.warn("Failed to parse stored local analyses", e);
              }
            }
            list.unshift(newAnalysis);
            localStorage.setItem(key, JSON.stringify(list));
          } else {
            // Update local context credits based on server-side deduction
            const credits = user.user_metadata?.credits ?? 5;
            updateCredits(Math.max(0, credits - 1));
          }

          // Complete transitions instantly
          clearInterval(interval);
          timeouts.forEach(clearTimeout);
          setProgress(100);
          setCurrentStep(5); // Redirecting step

          toast.success("Vídeo analisado com sucesso!");

          setTimeout(() => {
            navigate({ to: "/result/$id", params: { id: newAnalysis.id } });
          }, 800);
        })
        .catch((err) => {
          console.error("[Analyze Client Error]", err);
          clearInterval(interval);
          timeouts.forEach(clearTimeout);
          toast.error(err.message || "Erro de conexão ao analisar o vídeo.");
          navigate({ to: "/dashboard" });
        });
    }

    return () => {
      timeouts.forEach(clearTimeout);
      clearInterval(interval);
    };
  }, [navigate, user, updateCredits]);

  return (
    <AppLayout>
      <div className="mx-auto flex min-h-[calc(100vh-3.5rem)] max-w-xl flex-col items-center justify-center px-6 py-10">
        <motion.div
          animate={{ scale: [1, 1.08, 1] }}
          transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
          className="flex h-20 w-20 items-center justify-center rounded-2xl bg-primary/15 text-primary"
        >
          <Brain className="h-10 w-10" />
        </motion.div>

        <h1 className="mt-6 text-center text-2xl font-bold text-white">Analisando seu vídeo</h1>
        <p className="mt-2 text-center text-sm text-zinc-400">
          Isso leva cerca de 30 segundos. Não feche esta janela.
        </p>

        <div className="mt-8 w-full">
          <LoadingSteps steps={STEPS.map((s) => s.label)} currentStep={currentStep} />
        </div>

        <div className="mt-10 w-full">
          <div className="h-2 w-full overflow-hidden rounded-full bg-zinc-800">
            <motion.div
              className="h-full bg-primary"
              animate={{ width: `${progress}%` }}
              transition={{ ease: "linear", duration: 0.08 }}
            />
          </div>
          <div className="mt-2 text-right font-mono text-xs text-zinc-500">
            {Math.floor(progress)}%
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
