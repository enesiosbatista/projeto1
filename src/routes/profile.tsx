import { createFileRoute, Link } from '@tanstack/react-router';
import { AppLayout } from '@/components/layout/AppLayout';
import { mockUser } from '@/lib/mockData';

export const Route = createFileRoute('/profile')({
  head: () => ({ meta: [{ title: 'Perfil — ViralMind AI' }] }),
  component: ProfilePage,
});

function ProfilePage() {
  const initials = mockUser.username
    .split(' ')
    .map((n) => n[0])
    .slice(0, 2)
    .join('');
  const total = 5;
  const pct = (mockUser.credits / total) * 100;

  return (
    <AppLayout>
      <div className="mx-auto w-full max-w-2xl px-4 py-8 md:px-6 md:py-12">
        <div className="rounded-2xl border border-zinc-800 bg-zinc-900 p-6 md:p-8">
          <div className="flex flex-col items-center text-center">
            <div className="flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-primary to-secondary text-2xl font-bold text-primary-foreground">
              {initials}
            </div>
            <h1 className="mt-4 text-2xl font-bold text-white">{mockUser.username}</h1>
            <p className="mt-1 text-sm text-zinc-400">joao@email.com</p>
            <span className="mt-3 inline-block rounded-full bg-zinc-800 px-3 py-1 text-xs font-medium text-zinc-300">
              Plano Gratuito
            </span>
            <p className="mt-2 max-w-sm text-xs text-zinc-500">
              Acesso a 5 análises por mês com recursos básicos da IA.
            </p>
          </div>

          <div className="mt-8 rounded-xl border border-zinc-800 bg-zinc-950/50 p-5">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-zinc-300">Créditos restantes</span>
              <span className="font-mono text-sm text-primary">
                {mockUser.credits} / {total}
              </span>
            </div>
            <div className="mt-3 h-2 w-full overflow-hidden rounded-full bg-zinc-800">
              <div
                className="h-full rounded-full bg-primary transition-all"
                style={{ width: `${pct}%` }}
              />
            </div>
          </div>

          <div className="mt-6 flex flex-col gap-2 sm:flex-row">
            <button
              disabled
              title="Em breve"
              className="flex-1 cursor-not-allowed rounded-lg bg-primary/40 px-4 py-2.5 text-sm font-semibold text-primary-foreground/60 opacity-60"
            >
              Gerenciar Plano (em breve)
            </button>
            <Link
              to="/"
              className="flex-1 rounded-lg border border-zinc-700 px-4 py-2.5 text-center text-sm font-semibold text-zinc-200 transition hover:bg-zinc-800"
            >
              Sair
            </Link>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
