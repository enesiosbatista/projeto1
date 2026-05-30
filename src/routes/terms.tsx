import { createFileRoute, Link } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { ArrowLeft, FileText, Zap } from "lucide-react";

export const Route = createFileRoute("/terms")({
  head: () => ({
    meta: [
      { title: "Termos de Uso — ViralMind AI" },
      { name: "description", content: "Termos de Uso da ViralMind AI." },
    ],
  }),
  component: TermsPage,
});

function TermsPage() {
  return (
    <div className="min-h-screen bg-zinc-950 text-foreground overflow-x-hidden relative py-16 px-4">
      {/* Glow effect */}
      <div className="absolute bottom-1/4 right-1/3 h-80 w-80 rounded-full bg-violet-600/5 blur-[120px] pointer-events-none" />

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
              <FileText size={26} />
            </div>
            <div>
              <h1 className="text-3xl font-black text-white tracking-tight">Termos de Uso</h1>
              <p className="text-zinc-500 text-xs mt-1 font-mono">
                Última atualização: 30 de Maio de 2026
              </p>
            </div>
          </div>

          <div className="prose prose-invert max-w-none text-zinc-350 text-sm md:text-base leading-relaxed space-y-6">
            <p>
              Ao criar uma conta e utilizar os serviços da <strong>ViralMind AI</strong>, você
              concorda expressamente em cumprir e estar sujeito aos seguintes Termos de Uso.
              Recomendamos a leitura atenta de todo o documento.
            </p>

            <hr className="border-zinc-850 my-8" />

            <h2 className="text-xl font-bold text-white mt-6">1. Aceitação e Elegibilidade</h2>
            <p>
              Nossos serviços destinam-se a criadores de conteúdo e profissionais de marketing
              digital maiores de 18 anos. Ao se cadastrar, você garante que as informações prestadas
              (incluindo seu e-mail) são verídicas e corretas.
            </p>

            <h2 className="text-xl font-bold text-white mt-6">
              2. Sistema de Créditos e Faturamento
            </h2>
            <p>A ViralMind AI opera sob um modelo híbrido de faturamento baseado em créditos:</p>
            <ul className="list-disc pl-5 space-y-2">
              <li>
                <strong>Débito de Crédito:</strong> Cada vídeo analisado na plataforma consome
                exatamente
                <strong className="text-violet-400"> 1 crédito</strong> da sua conta.
              </li>
              <li>
                <strong>Faturamento Stripe:</strong> O upgrade para o plano Premium Mensal (R$
                10,90) ou Premium Anual (R$ 89,90) garante a carga imediata e renovações mensais de
                50 créditos. Em caso de cancelamento da cobrança recorrente pelo Portal da Stripe,
                seus privilégios Premium expirarão no final da competência ativa e sua conta voltará
                ao plano Free.
              </li>
              <li>
                <strong>Reembolso:</strong> Por consumir recursos diretos e custos de chamadas de
                APIs de Inteligência Artificial, reembolsos de assinaturas seguem estritamente as
                regras de arrependimento de 7 dias úteis estabelecidas pelo Código de Defesa do
                Consumidor, desde que o criador não tenha consumido mais de 5 créditos premium
                adquiridos.
              </li>
            </ul>

            <h2 className="text-xl font-bold text-white mt-6">
              3. Uso Aceitável e Propriedade Intelectual
            </h2>
            <p>Você concorda em usar os roteiros e insights remodelados pela IA de forma ética.</p>
            <ul className="list-disc pl-5 space-y-2">
              <li>
                <strong>Proteção de Direitos:</strong> Nossos recursos de recriação de IA buscam
                reduzir o plágio estrutural (risco estimado inferior a 10%), mas a responsabilidade
                editorial final pelo conteúdo produzido e postado em suas redes sociais é
                exclusivamente sua.
              </li>
              <li>
                <strong>Proibição de Abuso:</strong> Você concorda em não burlar nossos limitadores
                de taxa (Rate Limiting de 5 análises/min) e não tentar extrair dados de terceiros
                ilegalmente.
              </li>
            </ul>

            <h2 className="text-xl font-bold text-white mt-6">4. Limitação de Responsabilidade</h2>
            <p>
              A ViralMind AI não garante lucros, visualizações ou o alcance viral de seus vídeos. O
              algoritmo do YouTube, TikTok, Instagram e Shorts é dinâmico e proprietário, sendo
              influenciado por diversos fatores externos à ferramenta.
            </p>

            <h2 className="text-xl font-bold text-white mt-6">5. Modificações dos Termos</h2>
            <p>
              Podemos atualizar estes termos ocasionalmente para refletir melhorias do produto ou
              alterações legislativas. A continuação do uso do painel após atualizações implica na
              concordância com os novos termos estabelecidos.
            </p>
          </div>
        </motion.article>

        {/* Footer */}
        <footer className="mt-12 text-center text-xs text-zinc-500 font-medium">
          <p>© 2026 ViralMind AI. Todos os direitos reservados.</p>
        </footer>
      </div>
    </div>
  );
}
