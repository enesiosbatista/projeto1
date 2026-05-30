import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Brain, Send, Zap, TrendingUp, XCircle, CheckCircle, Rocket, Clock } from "lucide-react";
import { AppLayout } from "@/components/layout/AppLayout";
import { PlatformBadge } from "@/components/ui/PlatformBadge";
import { ViralScore } from "@/components/ui/ViralScore";

export const Route = createFileRoute("/insights")({
  head: () => ({
    meta: [
      { title: "Insights & Crescimento — ViralMind AI" },
      {
        name: "description",
        content:
          "Análise de tendências, diagnósticos estratégicos e consultoria de crescimento com IA.",
      },
    ],
  }),
  component: InsightsPage,
});

interface Message {
  sender: "ai" | "user";
  text: string;
}

const mockInsights = {
  stop_doing: [
    "Introduções corporativas longas de 5s+",
    "Áudio com eco ou ruído sem tratamento",
    "Chamar curtidas e inscrições no final do vídeo",
  ],
  keep_doing: [
    "Inserir prints de prova social aos 3min",
    "Manter ganchos curtos de 3 segundos",
    "Inserir quebras de padrão a cada 4s",
  ],
  scale_now: [
    "Roteiros focados em quebra de mitos",
    "Vlogs dinâmicos em formato Shorts",
    "Postar diariamente no horário nobre (20h)",
  ],
};

const mockTopContents = [
  {
    rank: "#1",
    title: "Como ganhar R$10.000 por mês trabalhando 4 horas por dia",
    platform: "youtube" as const,
    viral_score: 87,
    views: "245.2K",
    thumbnail: "https://picsum.photos/seed/viral1/120/70",
  },
  {
    rank: "#2",
    title: "Eu testei isso por 30 dias — resultado chocante",
    platform: "reels" as const,
    viral_score: 84,
    views: "189.5K",
    thumbnail: "https://picsum.photos/seed/viral6/120/70",
  },
  {
    rank: "#3",
    title: "O segredo que ninguém te conta sobre produtividade",
    platform: "youtube" as const,
    viral_score: 91,
    views: "154.2K",
    thumbnail: "https://picsum.photos/seed/viral2/120/70",
  },
];

const chatPills = [
  "Qual é o meu melhor horário para postar?",
  "Como posso aumentar minha retenção no início?",
  "Quais gatilhos mentais funcionam mais comigo?",
  "Como estruturar um CTA de alta conversão?",
];

const chatAnswers: Record<string, string> = {
  "Qual é o meu melhor horário para postar?":
    "Com base nas suas métricas acumuladas, seu pico de engajamento ocorre nas **terças e quintas-feiras entre 19h e 21h**. Experimente programar seus vídeos principais nesse intervalo!",
  "Como posso aumentar minha retenção no início?":
    "Seu gancho médio atual é de 78%. Para passar de 85%, evite introduções longas ou saudações. Comece diretamente com uma **afirmação polêmica, quebra de padrão visual nos primeiros 2s, ou mostre o resultado final logo no início**.",
  "Quais gatilhos mentais funcionam mais comigo?":
    "Os gatilhos de **Curiosidade** (abrir um loop de história) e **Prova Social** (mostrando prints ou resultados práticos) geram cerca de **34% mais retenção** nos seus vídeos comparados aos demais.",
  "Como estruturar um CTA de alta conversão?":
    'Evite pedir "like e inscrição" no final do vídeo, quando as pessoas já estão saindo. Coloque o CTA de forma sutil logo após um pico emocional (como revelar uma dica secreta) no **meio do vídeo**, prometendo um recurso adicional nos comentários.',
};

function InsightsPage() {
  const navigate = useNavigate();

  // Chat states
  const [messages, setMessages] = useState<Message[]>([
    {
      sender: "ai",
      text: "Olá! Sou sua consultora de crescimento baseada em inteligência artificial. Analisei todo o histórico das suas publicações e o comportamento da sua audiência. Pergunte-me qualquer dúvida sobre como melhorar suas visualizações, retenção e conversões!",
    },
  ]);
  const [isTyping, setIsTyping] = useState(false);
  const [inputValue, setInputValue] = useState("");

  const chatEndRef = useRef<HTMLDivElement>(null);

  // Auto scroll to bottom
  const scrollToBottom = () => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  const handlePillClick = (question: string) => {
    if (isTyping) return;

    // Add user message
    const newMessages = [...messages, { sender: "user" as const, text: question }];
    setMessages(newMessages);
    setIsTyping(true);

    // Simulate AI thinking and replying
    setTimeout(() => {
      setIsTyping(false);
      setMessages((prev) => [
        ...prev,
        {
          sender: "ai" as const,
          text:
            chatAnswers[question] ||
            "Legal! Essa é uma excelente pergunta. Com base no modelo de engajamento do seu canal, recomendo ajustar seus ganchos de abertura para reter o público por mais de 45 segundos, quebrando padrões visuais logo de início.",
        },
      ]);
    }, 1500);
  };

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputValue.trim() || isTyping) return;

    const userText = inputValue;
    setInputValue("");
    setMessages((prev) => [...prev, { sender: "user" as const, text: userText }]);
    setIsTyping(true);

    // Simulate general AI reply
    setTimeout(() => {
      setIsTyping(false);
      setMessages((prev) => [
        ...prev,
        {
          sender: "ai" as const,
          text: `Entendi! Analisando seu canal em relação a "${userText}", recomendo focar na otimização de títulos. Títulos que misturam um elemento polêmico com um número exato costumam ter um CTR 14% maior no seu nicho.`,
        },
      ]);
    }, 1500);
  };

  return (
    <AppLayout>
      <div className="mx-auto w-full max-w-7xl px-4 py-6 md:px-6 md:py-8 space-y-8">
        {/* Header */}
        <header>
          <h1 className="text-3xl font-bold text-white">Insights & Crescimento</h1>
          <p className="mt-1 text-sm text-zinc-400">
            Recomendações e estratégias de IA personalizadas com base no desempenho do seu perfil.
          </p>
        </header>

        {/* Growth Consultant Chat Block */}
        <section className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5 shadow-lg">
          <div className="flex items-center justify-between border-b border-zinc-800 pb-4 mb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-violet-950/40 border border-violet-800 flex items-center justify-center">
                <Brain className="w-5 h-5 text-violet-400" />
              </div>
              <div>
                <h3 className="font-bold text-white text-sm">IA Consultora de Crescimento</h3>
                <div className="flex items-center gap-1.5 mt-0.5">
                  <span className="bg-violet-900/50 border border-violet-800 text-[10px] text-violet-300 px-1.5 py-0.2 rounded font-semibold">
                    BETA
                  </span>
                  <div className="flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
                    <span className="text-[10px] text-zinc-400 font-medium">Online</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Messages Container */}
          <div className="space-y-4 max-h-[320px] overflow-y-auto pr-2 min-h-[200px] mb-4">
            {messages.map((msg, idx) => {
              const isAi = msg.sender === "ai";
              return (
                <div key={idx} className="flex flex-col w-full">
                  <div
                    className={`${
                      isAi
                        ? "bg-zinc-800 text-zinc-200 rounded-xl rounded-tl-sm self-start max-w-[85%] sm:max-w-[70%]"
                        : "bg-violet-900/50 border border-violet-800 text-white rounded-xl rounded-tr-sm self-end ml-auto max-w-[85%] sm:max-w-[70%]"
                    } p-3 text-sm leading-relaxed`}
                  >
                    <p className="whitespace-pre-line">{msg.text}</p>
                  </div>
                </div>
              );
            })}

            {/* Typing Indicator */}
            <AnimatePresence>
              {isTyping && (
                <div className="flex items-center gap-2 bg-zinc-800 text-zinc-400 rounded-xl rounded-tl-sm p-3 self-start max-w-[120px]">
                  <span className="text-xs font-semibold mr-1">Digitando</span>
                  <div className="flex gap-1 items-center">
                    <span
                      className="w-1.5 h-1.5 bg-violet-400 rounded-full animate-bounce"
                      style={{ animationDelay: "0s" }}
                    />
                    <span
                      className="w-1.5 h-1.5 bg-violet-400 rounded-full animate-bounce"
                      style={{ animationDelay: "0.1s" }}
                    />
                    <span
                      className="w-1.5 h-1.5 bg-violet-400 rounded-full animate-bounce"
                      style={{ animationDelay: "0.2s" }}
                    />
                  </div>
                </div>
              )}
            </AnimatePresence>
            <div ref={chatEndRef} />
          </div>

          {/* Suggested Pills */}
          <div className="mb-4">
            <span className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider block mb-2">
              Perguntas Sugeridas
            </span>
            <div className="flex flex-wrap gap-2">
              {chatPills.map((pill) => (
                <button
                  key={pill}
                  onClick={() => handlePillClick(pill)}
                  disabled={isTyping}
                  className="bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-xs px-3 py-2 rounded-xl transition cursor-pointer border border-zinc-700/50 hover:text-white disabled:opacity-50 disabled:cursor-not-allowed text-left"
                >
                  {pill}
                </button>
              ))}
            </div>
          </div>

          {/* Chat Form */}
          <form onSubmit={handleSendMessage} className="flex gap-2">
            <input
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder="Pergunte qualquer coisa sobre crescimento e canais..."
              className="flex-1 h-10 bg-zinc-950 border border-zinc-700 rounded-xl px-4 text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-violet-500"
            />
            <button
              type="submit"
              disabled={isTyping}
              className="h-10 w-10 bg-violet-600 hover:bg-violet-500 disabled:bg-zinc-800 disabled:text-zinc-600 text-white rounded-xl flex items-center justify-center transition cursor-pointer shrink-0"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
        </section>

        {/* Diagnóstico Estratégico */}
        <section className="space-y-3">
          <h2 className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">
            DIAGNÓSTICO ESTRATÉGICO
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* PARAR */}
            <div className="border-l-4 border-red-500 bg-red-950/20 rounded-xl p-4 flex flex-col justify-between">
              <div>
                <h4 className="flex items-center gap-1.5 text-red-400 font-bold text-sm">
                  <XCircle className="w-4 h-4" /> 🛑 PARAR
                </h4>
                <ul className="mt-3 space-y-2 text-xs text-zinc-300 leading-relaxed list-disc list-inside">
                  {mockInsights.stop_doing.map((item, idx) => (
                    <li key={idx}>{item}</li>
                  ))}
                </ul>
              </div>
            </div>

            {/* REPETIR */}
            <div className="border-l-4 border-green-500 bg-green-950/20 rounded-xl p-4 flex flex-col justify-between">
              <div>
                <h4 className="flex items-center gap-1.5 text-green-400 font-bold text-sm">
                  <CheckCircle className="w-4 h-4" /> 🔁 REPETIR
                </h4>
                <ul className="mt-3 space-y-2 text-xs text-zinc-300 leading-relaxed list-disc list-inside">
                  {mockInsights.keep_doing.map((item, idx) => (
                    <li key={idx}>{item}</li>
                  ))}
                </ul>
              </div>
            </div>

            {/* ESCALAR */}
            <div className="border-l-4 border-violet-500 bg-violet-950/20 rounded-xl p-4 flex flex-col justify-between">
              <div>
                <h4 className="flex items-center gap-1.5 text-violet-400 font-bold text-sm">
                  <Rocket className="w-4 h-4" /> 🚀 ESCALAR
                </h4>
                <ul className="mt-3 space-y-2 text-xs text-zinc-300 leading-relaxed list-disc list-inside">
                  {mockInsights.scale_now.map((item, idx) => (
                    <li key={idx}>{item}</li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </section>

        {/* Lower Grid: Timing Ideal + Top Conteúdos */}
        <section className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Timing Ideal */}
          <div className="space-y-3">
            <h2 className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">
              TIMING IDEAL
            </h2>
            <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5 grid grid-cols-2 gap-4">
              <div>
                <span className="text-[10px] text-zinc-500 font-semibold uppercase tracking-wider block">
                  Frequência
                </span>
                <span className="font-mono text-xl font-bold text-white mt-1 block">Diária</span>
              </div>

              <div>
                <span className="text-[10px] text-zinc-500 font-semibold uppercase tracking-wider block">
                  Formato Ideal
                </span>
                <span className="inline-block mt-1 font-semibold text-xs bg-cyan-950/40 text-cyan-400 border border-cyan-800 px-2 py-0.5 rounded">
                  Shorts (60s)
                </span>
              </div>

              <div>
                <span className="text-[10px] text-zinc-500 font-semibold uppercase tracking-wider block mb-1">
                  Melhores Dias
                </span>
                <div className="flex gap-1.5 flex-wrap">
                  {["Ter", "Qui", "Sex"].map((d) => (
                    <span
                      key={d}
                      className="bg-green-950/40 border border-green-800 text-green-400 text-[10px] font-semibold px-2 py-0.5 rounded"
                    >
                      {d}
                    </span>
                  ))}
                </div>
              </div>

              <div>
                <span className="text-[10px] text-zinc-500 font-semibold uppercase tracking-wider block mb-1">
                  Melhores Horários
                </span>
                <div className="flex gap-1.5 flex-wrap">
                  {["12h", "18h", "20h"].map((h) => (
                    <span
                      key={h}
                      className="bg-violet-950/40 border border-violet-800 text-violet-300 text-[10px] font-semibold px-2 py-0.5 rounded"
                    >
                      {h}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Top Conteúdos */}
          <div className="space-y-3">
            <h2 className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">
              TOP CONTEÚDOS
            </h2>
            <div className="space-y-3 bg-zinc-900 border border-zinc-800 rounded-2xl p-4">
              {mockTopContents.map((tc, idx) => (
                <div
                  key={idx}
                  className="flex items-center gap-3 border-b border-zinc-800 last:border-0 pb-3 last:pb-0"
                >
                  <span className="font-mono text-lg font-bold text-zinc-700 shrink-0">
                    {tc.rank}
                  </span>
                  <div className="w-16 h-10 rounded-md overflow-hidden bg-zinc-800 shrink-0">
                    <img src={tc.thumbnail} alt={tc.title} className="w-full h-full object-cover" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="text-xs font-semibold text-white truncate">{tc.title}</h4>
                    <div className="flex items-center gap-2 mt-1">
                      <PlatformBadge platform={tc.platform} />
                      <span className="font-mono text-[10px] text-zinc-500">{tc.views} views</span>
                    </div>
                  </div>
                  <div className="shrink-0">
                    <ViralScore score={tc.viral_score} size="sm" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Modo Viral */}
        <section className="bg-gradient-to-br from-violet-950/50 to-zinc-900 border border-violet-700 rounded-2xl p-6">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
            <div>
              <span className="bg-violet-900/40 text-violet-300 text-xs px-2.5 py-1 rounded border border-violet-800 font-semibold mb-2 inline-block">
                Modo Viral Ativo ⚡
              </span>
              <h2 className="text-xl font-bold text-white mb-2">
                Tendências do Momento no seu Nicho
              </h2>
              <p className="text-xs text-zinc-400 max-w-lg leading-relaxed">
                Nossa IA identificou os 3 tópicos quentes com maior velocidade de crescimento. Crie
                um vídeo sobre esses temas agora para surfar no algoritmo!
              </p>
            </div>
            <button
              onClick={() => navigate({ to: "/analyze" })}
              className="bg-violet-600 hover:bg-violet-500 text-white text-sm font-semibold h-11 px-6 rounded-xl transition cursor-pointer shrink-0"
            >
              Analisar Tendência Now
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
            {[
              { title: "Desafio 30 dias", score: "94%" },
              { title: "Roast de perfil", score: "87%" },
              { title: "Tutorial em 60s", score: "81%" },
            ].map((trend, idx) => (
              <div
                key={idx}
                className="bg-zinc-900/60 border border-violet-900/50 rounded-xl p-4 flex justify-between items-center"
              >
                <div>
                  <span className="text-xs text-zinc-500 block uppercase font-bold tracking-wider">
                    Tendência
                  </span>
                  <span className="text-sm font-bold text-white mt-1 block">{trend.title}</span>
                </div>
                <div className="text-right">
                  <span className="text-[10px] text-violet-400 font-bold block">POTENCIAL</span>
                  <span className="font-mono text-base font-bold text-violet-300 block">
                    {trend.score}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>
    </AppLayout>
  );
}
