import { createFileRoute, Link } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { ArrowLeft, ShieldCheck, Zap } from "lucide-react";

export const Route = createFileRoute("/privacy")({
  head: () => ({
    meta: [
      { title: "Política de Privacidade — ViralMind AI" },
      { name: "description", content: "Política de Privacidade da ViralMind AI." },
    ],
  }),
  component: PrivacyPage,
});

function PrivacyPage() {
  return (
    <div className="min-h-screen bg-zinc-950 text-foreground overflow-x-hidden relative py-16 px-4">
      {/* Glow effect */}
      <div className="absolute top-1/4 left-1/3 h-80 w-80 rounded-full bg-violet-600/5 blur-[120px] pointer-events-none" />

      <div className="max-w-3xl mx-auto">
        {/* Header back link */}
        <div className="flex justify-between items-center mb-12">
          <Link
            to="/"
            className="inline-flex items-center gap-2 text-zinc-400 hover:text-white transition-colors text-sm font-semibold"
          >
            <ArrowLeft size={16} /> Voltar para Home
          </Link>
          <div className="flex items-center gap-1.5">
            <Zap className="h-5 w-5 text-primary" fill="currentColor" />
            <span className="text-sm font-bold text-white tracking-tight">ViralMind</span>
          </div>
        </div>

        {/* Article Box */}
        <motion.article
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="bg-zinc-900/40 border border-zinc-850 rounded-2xl p-8 md:p-12 backdrop-blur shadow-2xl relative"
        >
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2.5 bg-violet-950/60 border border-violet-800/40 text-violet-400 rounded-xl">
              <ShieldCheck size={26} />
            </div>
            <div>
              <h1 className="text-3xl font-black text-white tracking-tight">
                Política de Privacidade
              </h1>
              <p className="text-zinc-500 text-xs mt-1 font-mono">
                Última atualização: 30 de Maio de 2026
              </p>
            </div>
          </div>

          <div className="prose prose-invert max-w-none text-zinc-350 text-sm md:text-base leading-relaxed space-y-6">
            <p>
              A sua privacidade é de extrema importância para nós. Esta Política de Privacidade
              explica como a<strong> ViralMind AI</strong> coleta, utiliza, compartilha e protege as
              informações dos usuários ao utilizar a nossa plataforma e serviços de engenharia
              reversa e otimização de roteiros com Inteligência Artificial.
            </p>

            <hr className="border-zinc-850 my-8" />

            <h2 className="text-xl font-bold text-white mt-6">1. Coleta de Informações</h2>
            <p>
              Coletamos informações essenciais para prestar e otimizar nossos serviços, divididas
              em:
            </p>
            <ul className="list-disc pl-5 space-y-2">
              <li>
                <strong>Dados Cadastrais:</strong> E-mail e senha inseridos para criação da conta e
                personalização do seu Perfil de Criador (como metas de crescimento de canal e
                nichos).
              </li>
              <li>
                <strong>Metadados de Vídeos:</strong> Links fornecidos por você para análises
                técnicas. Não salvamos cookies intrusivos do seu histórico do navegador.
              </li>
              <li>
                <strong>Dados de Pagamento:</strong> Todas as cobranças via cartão de crédito são
                processadas diretamente e de forma 100% segura pela **Stripe**. Nós não armazenamos
                dados brutos de cartão de crédito em nossos servidores.
              </li>
            </ul>

            <h2 className="text-xl font-bold text-white mt-6">2. Uso dos Dados</h2>
            <p>Utilizamos seus dados cadastrados única e exclusivamente para:</p>
            <ul className="list-disc pl-5 space-y-2">
              <li>Processar e salvar seu histórico real de análises técnicas no Supabase.</li>
              <li>
                Gerenciar o faturamento e renovação dos créditos premium associados à sua conta.
              </li>
              <li>
                Enviar notificações transacionais cruciais via Resend (como boas-vindas, aviso de
                créditos esgotados ou confirmação de pagamento).
              </li>
            </ul>

            <h2 className="text-xl font-bold text-white mt-6">3. Compartilhamento com Terceiros</h2>
            <p>
              Compartilhamos dados de forma segura com nossos provedores de infraestrutura
              essenciais para que o produto funcione:
            </p>
            <ul className="list-disc pl-5 space-y-2">
              <li>
                <strong>OpenAI e Anthropic:</strong> Transmissão de títulos e transcrições de vídeo
                para geração de análise (sem expor seus dados pessoais).
              </li>
              <li>
                <strong>Stripe:</strong> Faturamento e processamento de checkout recorrente.
              </li>
              <li>
                <strong>Resend:</strong> Disparo e gerenciamento de e-mails transacionais.
              </li>
            </ul>

            <h2 className="text-xl font-bold text-white mt-6">4. Segurança dos Seus Dados</h2>
            <p>
              Nossa aplicação implementa proteção **Row Level Security (RLS)** rigorosa no banco de
              dados Supabase, garantindo que você seja o único criador capaz de ler, favoritar ou
              deletar suas próprias análises.
            </p>

            <h2 className="text-xl font-bold text-white mt-6">5. Contato e Esclarecimentos</h2>
            <p>
              Caso tenha dúvidas ou queira solicitar a exclusão definitiva imediata de todos os seus
              dados dos nossos servidores, basta entrar em contato com o suporte em{" "}
              <span className="text-violet-400 font-mono">suporte@viralmind.ai</span>.
            </p>
          </div>
        </motion.article>

        {/* Footer */}
        <footer className="mt-12 text-center text-xs text-zinc-500 font-medium">
          <p>© 2026 ViralMind AI. De acordo com a LGPD e regulamentações vigentes.</p>
        </footer>
      </div>
    </div>
  );
}
