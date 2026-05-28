import { createFileRoute, useNavigate } from '@tanstack/react-router';
import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Brain } from 'lucide-react';
import { AppLayout } from '@/components/layout/AppLayout';
import { LoadingSteps } from '@/components/ui/LoadingSteps';

export const Route = createFileRoute('/analyze')({
  head: () => ({
    meta: [
      { title: 'Analisando vídeo — ViralMind AI' },
      { name: 'description', content: 'A IA está analisando seu vídeo.' },
    ],
  }),
  component: AnalyzePage,
});

const STEPS = [
  { delay: 0, label: '🔍 Identificando plataforma e vídeo...' },
  { delay: 2500, label: '📥 Extraindo metadados do vídeo...' },
  { delay: 6000, label: '🧠 IA analisando estrutura e emoções...' },
  { delay: 12000, label: '📊 Calculando Score de Viralização...' },
  { delay: 20000, label: '✍️ Gerando relatório personalizado...' },
  { delay: 27000, label: '✅ Análise concluída! Redirecionando...' },
];

const TOTAL_MS = 30000;

function AnalyzePage() {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(0);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const timeouts = STEPS.map((s, i) =>
      setTimeout(() => setCurrentStep(i), s.delay),
    );
    const start = Date.now();
    const interval = setInterval(() => {
      const elapsed = Date.now() - start;
      setProgress(Math.min(100, (elapsed / TOTAL_MS) * 100));
    }, 80);
    const finish = setTimeout(() => {
      navigate({ to: '/result/$id', params: { id: 'mock-001' } });
    }, TOTAL_MS);

    return () => {
      timeouts.forEach(clearTimeout);
      clearInterval(interval);
      clearTimeout(finish);
    };
  }, [navigate]);

  return (
    <AppLayout>
      <div className="mx-auto flex min-h-[calc(100vh-3.5rem)] max-w-xl flex-col items-center justify-center px-6 py-10">
        <motion.div
          animate={{ scale: [1, 1.08, 1], opacity: [0.8, 1, 0.8] }}
          transition={{ duration: 1.6, repeat: Infinity, ease: 'easeInOut' }}
          className="flex h-20 w-20 items-center justify-center rounded-2xl bg-primary/15 text-primary"
        >
          <Brain className="h-10 w-10" />
        </motion.div>

        <h1 className="mt-6 text-center text-2xl font-bold">
          Analisando seu vídeo
        </h1>
        <p className="mt-2 text-center text-sm text-zinc-400">
          Isso leva cerca de 30 segundos. Não feche esta janela.
        </p>

        <div className="mt-8 w-full">
          <LoadingSteps
            steps={STEPS.map((s) => s.label)}
            currentStep={currentStep}
          />
        </div>

        <div className="mt-10 w-full">
          <div className="h-2 w-full overflow-hidden rounded-full bg-zinc-800">
            <motion.div
              className="h-full bg-primary"
              animate={{ width: `${progress}%` }}
              transition={{ ease: 'linear', duration: 0.08 }}
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
