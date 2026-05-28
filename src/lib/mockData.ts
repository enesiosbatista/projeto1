import type { Analysis, Profile } from '@/types/database';

export const mockUser: Profile = {
  id: 'user-1',
  username: 'João Silva',
  plan: 'free',
  credits: 3,
  created_at: new Date().toISOString(),
};

// Retention curve: starts at 100, dips, small bump at CTA
const retentionCurve = [
  100, 96, 92, 88, 85, 82, 78, 74, 71, 68,
  66, 65, 67, 70, 72, 71, 69, 66, 62, 58,
].map((retention, i) => ({ second: i * 20, retention }));

export const mockAnalysis: Analysis = {
  id: 'mock-001',
  user_id: 'user-1',
  url: 'https://youtube.com/watch?v=mock',
  platform: 'youtube',
  title: 'Como ganhar R$10.000 por mês trabalhando 4 horas por dia',
  thumbnail_url: 'https://picsum.photos/seed/viral1/640/360',
  duration_seconds: 387,
  viral_score: 87,
  status: 'complete',
  created_at: new Date().toISOString(),
  result: {
    verdict: 'viralized',
    overall_analysis:
      'Este vídeo viralizou por combinar três elementos fundamentais: um hook impossível de ignorar nos primeiros 3 segundos, uma promessa específica e mensurável (R$10.000/mês), e uma estrutura narrativa que mantém o espectador curioso até o final. A escolha do título alinhado com a thumbnail criou um CTR estimado acima de 12%, muito superior à média do nicho.\n\nA progressão emocional também foi decisiva: o criador alterna entre prova social, vulnerabilidade e instrução prática, evitando a queda típica de retenção aos 30 segundos. O CTA no minuto 5:42 aproveita o pico de engajamento para converter views em inscrições.',
    metrics: {
      hook_score: 92,
      retention_estimated: 78,
      share_potential: 85,
      audio_quality: 88,
      cta_strength: 81,
      title_optimization: 94,
    },
    retention_data: retentionCurve,
    strong_points: [
      { title: 'Hook impactante nos primeiros 3 segundos', description: 'Abre com uma afirmação polêmica que quebra padrões e gera curiosidade imediata.' },
      { title: 'Título com promessa específica', description: 'Inclui número exato e prazo, aumentando o CTR em redes sociais.' },
      { title: 'Storytelling com vulnerabilidade', description: 'Compartilha falhas pessoais antes da solução, criando conexão emocional.' },
      { title: 'Ritmo de edição dinâmico', description: 'Cortes a cada 2-3 segundos mantêm a atenção do espectador moderno.' },
      { title: 'CTA contextualizado', description: 'A chamada para ação aparece no momento de maior engajamento, não no fim.' },
    ],
    weak_points: [
      {
        title: 'Queda de retenção aos 4:15',
        description: 'Há uma seção explicativa longa demais que perde 8% dos espectadores.',
        suggestion: 'Quebre em duas partes com um padrão de interrupção (pergunta, mudança de cenário).',
      },
      {
        title: 'Audio com ruído de fundo',
        description: 'Em alguns momentos há eco que distrai a percepção de profissionalismo.',
        suggestion: 'Use tratamento acústico ou plugin de denoise em pós-produção.',
      },
    ],
    mental_triggers: [
      { name: 'Curiosidade', description: 'Abre loop narrativo no início que só fecha aos 4 minutos.', timestamp: '0:03' },
      { name: 'Urgência', description: 'Menciona oportunidade limitada no nicho atual.', timestamp: '1:24' },
      { name: 'Prova Social', description: 'Mostra prints de alunos com resultados reais.', timestamp: '3:10' },
      { name: 'Antecipação', description: 'Promete revelar segredo apenas no final.', timestamp: '5:00' },
    ],
    transcript: [
      { timestamp: '0:00', text: 'Se você trabalha 8 horas por dia e ainda assim não sobra dinheiro, esse vídeo é pra você.', type: 'hook' },
      { timestamp: '0:12', text: 'Há dois anos eu estava exatamente onde você está agora.', type: 'normal' },
      { timestamp: '0:34', text: 'Mas descobri uma coisa que mudou tudo — e não é o que você pensa.', type: 'highlight' },
      { timestamp: '1:02', text: 'A primeira coisa que precisa entender é a matemática do tempo livre.', type: 'normal' },
      { timestamp: '1:48', text: 'Olha esse print: R$ 13.247 no último mês trabalhando do sofá.', type: 'highlight' },
      { timestamp: '2:30', text: 'Existem três pilares que sustentam qualquer renda alta com pouco tempo.', type: 'normal' },
      { timestamp: '3:15', text: 'Veja o resultado da Maria, ela aplicou e em 60 dias dobrou a renda.', type: 'highlight' },
      { timestamp: '3:58', text: 'O segundo pilar é o que mais gente erra — e eu cometi por anos.', type: 'normal' },
      { timestamp: '4:45', text: 'Anota essa frase: produtividade não é fazer mais, é fazer o certo.', type: 'highlight' },
      { timestamp: '5:20', text: 'Agora vou te entregar o terceiro pilar, o que ninguém fala.', type: 'normal' },
      { timestamp: '5:42', text: 'Se isso te ajudou, deixa o like e se inscreve, isso me ajuda demais.', type: 'cta' },
      { timestamp: '6:20', text: 'Te vejo no próximo vídeo. Valeu!', type: 'normal' },
    ],
    script_recreation: {
      hook: 'Você não precisa trabalhar mais — você precisa parar de fazer 3 coisas que te quebram financeiramente.',
      body: 'Comece mostrando o problema universal (cansaço + falta de dinheiro), apresente sua história em 30s, revele os 3 erros que travam a maioria, mostre prova social com prints reais e finalize com o framework prático passo a passo.',
      cta: 'Se você quer o checklist completo dos 3 erros + o template pronto, me segue e comenta CHECKLIST aqui embaixo que eu te mando.',
      plagiarism_risk: 4,
      viral_potential: 89,
    },
    new_title_suggestion: 'Eu trabalhava 12 horas por dia e ainda assim faltava dinheiro — até descobrir isso',
    hook_suggestions: [
      'Pare de trabalhar mais. O problema não é o tempo, é outro — e ninguém te conta.',
      'Em 2 anos saí de R$ 2.000 pra R$ 30.000 por mês fazendo exatamente o oposto do que ensinam.',
      'Se você ainda troca tempo por dinheiro em 2026, esse vídeo vai te incomodar.',
    ],
    best_posting_times: {
      youtube: 'Terça e quinta, 19h-21h',
      shorts: 'Diariamente, 12h e 20h',
      reels: 'Quarta e sexta, 18h-22h',
      tiktok: 'Diariamente, 21h-23h',
    },
  },
};

const platforms = ['youtube', 'shorts', 'reels', 'tiktok'] as const;
const titles = [
  'O segredo que ninguém te conta sobre produtividade',
  '5 erros que estão destruindo seu Instagram',
  'Por que esse trend morreu em 48 horas',
  'A fórmula matemática do conteúdo viral',
  'Eu testei isso por 30 dias — resultado chocante',
  'Pare de fazer isso se quer crescer no TikTok',
  'O algoritmo mudou outra vez (e ninguém percebeu)',
  'Como criar 30 vídeos em 1 hora com IA',
];
const scores = [91, 84, 76, 68, 54, 43, 87, 23];

export const mockAnalysisList: Analysis[] = titles.map((title, i) => ({
  ...mockAnalysis,
  id: `mock-${String(i + 1).padStart(3, '0')}`,
  title,
  platform: platforms[i % platforms.length],
  viral_score: scores[i],
  thumbnail_url: `https://picsum.photos/seed/viral${i + 2}/640/360`,
  result: {
    ...mockAnalysis.result,
    verdict: scores[i] >= 70 ? 'viralized' : 'not_viralized',
  },
}));
