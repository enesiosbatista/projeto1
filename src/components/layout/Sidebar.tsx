import { useEffect, useState } from 'react';
import { Link, useRouterState } from '@tanstack/react-router';
import {
  ChevronLeft,
  ChevronRight,
  Home,
  LayoutDashboard,
  Search,
  Zap,
} from 'lucide-react';
import { mockAnalysisList, mockUser } from '@/lib/mockData';

const nav: { to: string; label: string; icon: typeof Home; exact?: boolean }[] = [
  { to: '/', label: 'Home', icon: Home, exact: true },
  { to: '/analyze', label: 'Nova Análise', icon: Search },
  { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
];

function scoreColor(s: number) {
  if (s < 40) return 'text-red-400';
  if (s < 70) return 'text-amber-400';
  if (s < 85) return 'text-green-400';
  return 'text-primary';
}

export function Sidebar() {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const [collapsed, setCollapsed] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem('sidebar_collapsed');
    if (stored === '1') setCollapsed(true);
  }, []);

  const toggle = () => {
    setCollapsed((c) => {
      const next = !c;
      localStorage.setItem('sidebar_collapsed', next ? '1' : '0');
      return next;
    });
  };

  const recents = mockAnalysisList.slice(0, 3);
  const initials = mockUser.username
    .split(' ')
    .map((n) => n[0])
    .slice(0, 2)
    .join('');

  return (
    <aside
      className={`hidden shrink-0 flex-col border-r border-zinc-800 bg-zinc-950 transition-all duration-200 md:flex ${
        collapsed ? 'w-16' : 'w-60'
      }`}
    >
      {/* Top: logo + collapse */}
      <div className="flex h-14 items-center justify-between border-b border-zinc-800 px-3">
        {!collapsed && (
          <Link to="/" className="flex items-center gap-2">
            <Zap className="h-5 w-5 text-primary" fill="currentColor" />
            <span className="text-sm font-bold text-white">ViralMind</span>
          </Link>
        )}
        <button
          onClick={toggle}
          title={collapsed ? 'Expandir' : 'Recolher'}
          className="ml-auto rounded-md p-1.5 text-zinc-400 transition hover:bg-zinc-900 hover:text-zinc-200"
        >
          {collapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
        </button>
      </div>

      {/* Nav */}
      <nav className="flex flex-col gap-1 p-2">
        {nav.map(({ to, label, icon: Icon, exact }) => {
          const active = exact ? pathname === to : pathname.startsWith(to);
          return (
            <Link
              key={to}
              to={to}
              title={collapsed ? label : undefined}
              className={`flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                active
                  ? 'border-l-2 border-primary bg-primary/10 text-primary'
                  : 'text-zinc-400 hover:bg-zinc-900 hover:text-zinc-100'
              } ${collapsed ? 'justify-center' : ''}`}
            >
              <Icon className="h-4 w-4 shrink-0" />
              {!collapsed && <span>{label}</span>}
            </Link>
          );
        })}
      </nav>

      {/* Recents */}
      {!collapsed && (
        <div className="mt-2 flex-1 overflow-y-auto px-3">
          <h4 className="mb-2 px-2 text-[10px] font-semibold uppercase tracking-wider text-zinc-500">
            Recentes
          </h4>
          <ul className="space-y-1">
            {recents.map((a) => (
              <li key={a.id}>
                <Link
                  to="/result/$id"
                  params={{ id: a.id }}
                  className="flex items-center gap-2 rounded-lg p-2 transition hover:bg-zinc-900"
                >
                  <img
                    src={a.thumbnail_url}
                    alt=""
                    className="h-8 w-8 shrink-0 rounded object-cover"
                  />
                  <span className="flex-1 truncate text-xs text-zinc-300">
                    {a.title}
                  </span>
                  <span className={`font-mono text-[10px] font-bold ${scoreColor(a.viral_score)}`}>
                    {a.viral_score}
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Footer user */}
      <div className="mt-auto border-t border-zinc-800 p-3">
        <Link
          to="/profile"
          className={`flex items-center gap-3 rounded-lg p-2 transition hover:bg-zinc-900 ${
            collapsed ? 'justify-center' : ''
          }`}
        >
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-primary to-secondary text-xs font-bold text-primary-foreground">
            {initials}
          </div>
          {!collapsed && (
            <div className="min-w-0 flex-1">
              <p className="truncate text-xs font-semibold text-white">{mockUser.username}</p>
              <span className="mt-0.5 inline-block rounded bg-zinc-700 px-1.5 py-0.5 text-[10px] text-zinc-200">
                Plano Free
              </span>
            </div>
          )}
        </Link>
      </div>
    </aside>
  );
}
