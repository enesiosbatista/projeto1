import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { Youtube, Music, Instagram, Facebook, Link2 } from "lucide-react";
import { AppLayout } from "@/components/layout/AppLayout";
import { ConnectAccountCard } from "@/components/ui/ConnectAccountCard";
import type { Platform } from "@/types/database";
import { toast } from "sonner";
import { Toaster } from "@/components/ui/sonner";

export const Route = createFileRoute("/connect")({
  head: () => ({
    meta: [
      { title: "Conectar Contas — ViralMind AI" },
      {
        name: "description",
        content: "Conecte suas redes sociais para importar vídeos automaticamente.",
      },
    ],
  }),
  component: ConnectPage,
});

function ConnectPage() {
  const navigate = useNavigate();

  // Connection states
  const [connections, setConnections] = useState({
    youtube: { isConnected: true, username: "joaosilvavideos", followers: "124.5K" },
    tiktok: { isConnected: false, username: "", followers: "" },
    reels: { isConnected: true, username: "joaosilva.criador", followers: "45.2K" },
    facebook: { isConnected: false, username: "", followers: "" },
  });

  const [modalOpen, setModalOpen] = useState(false);
  const [pendingConnectPlatform, setPendingConnectPlatform] = useState<string | null>(null);

  // Manual import state
  const [manualUrl, setManualUrl] = useState("");
  const [manualPlatform, setManualPlatform] = useState<Platform>("youtube");

  const handleConnectClick = (platformKey: string) => {
    setPendingConnectPlatform(platformKey);
    setModalOpen(true);
  };

  const handleDisconnectClick = (platformKey: keyof typeof connections) => {
    setConnections((prev) => ({
      ...prev,
      [platformKey]: { isConnected: false, username: "", followers: "" },
    }));
    toast.success(`Conta do ${platformKey} desconectada com sucesso!`);
  };

  const handleModalClose = () => {
    setModalOpen(false);
    setPendingConnectPlatform(null);
  };

  const handleManualImport = (e: React.FormEvent) => {
    e.preventDefault();
    if (!manualUrl.trim()) {
      toast.error("Por favor, insira um link válido.");
      return;
    }

    // Save to localStorage to let /analyze process it
    localStorage.setItem(
      "viralmind:pending",
      JSON.stringify({ url: manualUrl, platform: manualPlatform }),
    );
    toast.success("Link importado! Redirecionando para análise...");

    // Redirect to /analyze
    setTimeout(() => {
      navigate({ to: "/analyze" });
    }, 800);
  };

  return (
    <AppLayout>
      <Toaster />
      <div className="mx-auto w-full max-w-4xl px-4 py-6 md:px-6 md:py-8">
        {/* Header */}
        <header className="mb-8">
          <h1 className="text-3xl font-bold text-white">Conectar Canais</h1>
          <p className="mt-1 text-sm text-zinc-400">
            Conecte suas contas para importar automaticamente suas métricas de engajamento e
            histórico de publicações.
          </p>
        </header>

        {/* Grid de Contas */}
        <section className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <ConnectAccountCard
            platformName="YouTube"
            isConnected={connections.youtube.isConnected}
            icon={Youtube}
            username={connections.youtube.username}
            followers={connections.youtube.followers}
            onConnect={() => handleConnectClick("youtube")}
            onDisconnect={() => handleDisconnectClick("youtube")}
          />
          <ConnectAccountCard
            platformName="TikTok"
            isConnected={connections.tiktok.isConnected}
            icon={Music}
            username={connections.tiktok.username}
            followers={connections.tiktok.followers}
            onConnect={() => handleConnectClick("tiktok")}
            onDisconnect={() => handleDisconnectClick("tiktok")}
          />
          <ConnectAccountCard
            platformName="Instagram Reels"
            isConnected={connections.reels.isConnected}
            icon={Instagram}
            username={connections.reels.username}
            followers={connections.reels.followers}
            onConnect={() => handleConnectClick("reels")}
            onDisconnect={() => handleDisconnectClick("reels")}
          />
          <ConnectAccountCard
            platformName="Facebook"
            isConnected={connections.facebook.isConnected}
            icon={Facebook}
            username={connections.facebook.username}
            followers={connections.facebook.followers}
            onConnect={() => handleConnectClick("facebook")}
            onDisconnect={() => handleDisconnectClick("facebook")}
          />
        </section>

        {/* Importação Manual */}
        <section className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 mt-8">
          <h2 className="text-lg font-bold text-white mb-2">Importação Manual</h2>
          <p className="text-sm text-zinc-400 mb-4">
            Prefere não integrar suas contas? Sem problemas. Você pode analisar vídeos individuais
            colando o link diretamente abaixo.
          </p>

          <form onSubmit={handleManualImport} className="flex flex-col gap-3 sm:flex-row">
            <input
              type="url"
              value={manualUrl}
              onChange={(e) => setManualUrl(e.target.value)}
              placeholder="Cole o link do YouTube, TikTok, Reels ou Shorts..."
              className="flex-1 h-11 bg-zinc-950 border border-zinc-700 rounded-xl px-4 text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-violet-500"
            />
            <div className="flex gap-2 shrink-0">
              <select
                value={manualPlatform}
                onChange={(e) => setManualPlatform(e.target.value as Platform)}
                className="h-11 bg-zinc-950 border border-zinc-700 rounded-xl px-3 text-sm text-zinc-200 focus:outline-none focus:border-violet-500 cursor-pointer"
              >
                <option value="youtube">🎬 YouTube</option>
                <option value="shorts">📱 Shorts</option>
                <option value="reels">📸 Reels</option>
                <option value="tiktok">🎵 TikTok</option>
              </select>

              <button
                type="submit"
                className="h-11 bg-violet-600 hover:bg-violet-500 text-white font-semibold px-5 rounded-xl text-sm transition cursor-pointer shrink-0"
              >
                Analisar →
              </button>
            </div>
          </form>
        </section>
      </div>

      {/* Modal: Integração em desenvolvimento */}
      {modalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 max-w-sm w-full text-center shadow-xl relative"
          >
            <div className="w-12 h-12 rounded-full bg-violet-950/50 border border-violet-800 flex items-center justify-center mx-auto mb-4">
              <Link2 className="w-6 h-6 text-violet-400" />
            </div>
            <h3 className="text-lg font-bold text-white mb-2">Integração em desenvolvimento</h3>
            <p className="text-sm text-zinc-400 mb-6">
              A integração direta com APIs de redes sociais está sendo implementada pela equipe.
              Esta funcionalidade estará disponível para todos os usuários em breve!
            </p>
            <button
              onClick={handleModalClose}
              className="w-full h-10 rounded-xl bg-violet-600 hover:bg-violet-500 text-white font-semibold text-sm transition cursor-pointer"
            >
              Entendido
            </button>
          </motion.div>
        </div>
      )}
    </AppLayout>
  );
}
