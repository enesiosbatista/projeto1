import { Link, useRouterState } from "@tanstack/react-router";
import { Home, LayoutDashboard, Search, User } from "lucide-react";

const items: { to: string; label: string; icon: typeof Home; exact?: boolean }[] = [
  { to: "/", label: "Início", icon: Home, exact: true },
  { to: "/analyze", label: "Analisar", icon: Search },
  { to: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { to: "/profile", label: "Perfil", icon: User },
];

export function BottomNav() {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  return (
    <nav className="fixed inset-x-0 bottom-0 z-30 flex h-16 border-t border-zinc-800 bg-zinc-950/95 backdrop-blur md:hidden">
      {items.map(({ to, label, icon: Icon, exact }) => {
        const active = exact ? pathname === to : pathname.startsWith(to);
        return (
          <Link
            key={to}
            to={to}
            className={`flex flex-1 flex-col items-center justify-center gap-1 text-[10px] transition-colors ${
              active ? "text-primary" : "text-zinc-500"
            }`}
          >
            <Icon className="h-5 w-5" />
            {label}
          </Link>
        );
      })}
    </nav>
  );
}
