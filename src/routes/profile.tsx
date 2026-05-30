import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { AppLayout } from "@/components/layout/AppLayout";
import { mockAnalysisList, mockUser } from "@/lib/mockData";
import { toast } from "sonner";
import { Toaster } from "@/components/ui/sonner";

export const Route = createFileRoute("/profile")({
  head: () => ({ meta: [{ title: "Perfil — ViralMind AI" }] }),
  component: ProfilePage,
});

function ProfilePage() {
  const navigate = useNavigate();
  const initials = "JS";
  const total = 5;
  const pct = (mockUser.credits / total) * 100;

  const handleExportData = () => {
    alert("Seus dados foram reunidos e exportados com sucesso!");
    toast.success("Dados exportados!");
  };

  const handleLogout = () => {
    toast.success("Desconectando...");
    setTimeout(() => {
      navigate({ to: "/" });
    }, 500);
  };

  return (
    <AppLayout>
      <Toaster />
      <div className="max-w-lg mx-auto px-4 py-12">
        {/* Avatar e Identidade */}
        <div className="text-center">
          <div className="w-20 h-20 rounded-full bg-violet-700 flex items-center justify-center text-2xl font-bold mx-auto text-white">
            {initials}
          </div>
          <h1 className="text-2xl font-bold mt-4 text-white">João Silva</h1>
          <p className="text-sm text-zinc-400 mt-1">joao@email.com</p>
          <span className="inline-block mt-3 bg-zinc-800 border border-zinc-700 rounded-full px-4 py-1.5 text-sm text-zinc-300 font-medium">
            ✨ Plano Gratuito
          </span>
        </div>

        {/* Card de Dados */}
        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 mt-6 space-y-5">
          {/* Créditos */}
          <div className="space-y-2">
            <div className="flex justify-between items-center text-sm">
              <span className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">
                Créditos
              </span>
              <span className="text-sm text-zinc-300 font-medium font-mono">
                3 de 5 créditos restantes
              </span>
            </div>
            <div className="h-2 w-full overflow-hidden rounded-full bg-zinc-800">
              <div
                className="h-full rounded-full bg-violet-500 transition-all"
                style={{ width: `${pct}%` }}
              />
            </div>
          </div>

          {/* Análises */}
          <div className="border-t border-zinc-800 pt-4 flex justify-between items-center text-sm">
            <span className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">
              Análises Realizadas
            </span>
            <span className="text-sm text-zinc-200 font-medium font-mono">
              {mockAnalysisList.length} análises no total
            </span>
          </div>

          {/* Membro desde */}
          <div className="border-t border-zinc-800 pt-4 flex justify-between items-center text-sm">
            <span className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">
              Membro Desde
            </span>
            <span className="text-sm text-zinc-200 font-medium font-mono">Maio de 2026</span>
          </div>

          {/* Plataformas */}
          <div className="border-t border-zinc-800 pt-4 flex justify-between items-center text-sm">
            <span className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">
              Plataformas Ativas
            </span>
            <span className="text-sm text-zinc-200 font-medium font-mono">YouTube, Instagram</span>
          </div>
        </div>

        {/* Botões */}
        <div className="flex flex-col gap-3 mt-6">
          <button
            disabled
            title="Em breve"
            className="w-full h-11 border border-zinc-700 text-zinc-500 rounded-xl text-sm font-semibold transition cursor-not-allowed disabled opacity-65 flex items-center justify-center"
          >
            Gerenciar Plano (em breve)
          </button>

          <button
            onClick={handleExportData}
            className="w-full h-11 border border-zinc-700 text-zinc-400 hover:text-zinc-200 rounded-xl text-sm font-semibold transition cursor-pointer flex items-center justify-center hover:bg-zinc-800/30"
          >
            Exportar Meus Dados
          </button>

          <button
            onClick={handleLogout}
            className="w-full h-11 border border-red-900 text-red-400 hover:bg-red-950/30 rounded-xl text-sm font-semibold transition cursor-pointer flex items-center justify-center"
          >
            Sair
          </button>
        </div>
      </div>
    </AppLayout>
  );
}
