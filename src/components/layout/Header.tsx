import { useEffect, useRef, useState } from "react";
import { Link, useNavigate } from "@tanstack/react-router";
import { Bell, Plus } from "lucide-react";
import { useAuth } from "./AuthProvider";
import { toast } from "sonner";

export function Header() {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const { user, signOut } = useAuth();
  const navigate = useNavigate();

  const username = user?.user_metadata?.name || user?.email?.split("@")[0] || "Criador";
  const initials = username
    .split(" ")
    .map((n: string) => n[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  const credits = user?.user_metadata?.credits ?? 0;

  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, []);

  const handleLogout = async () => {
    setOpen(false);
    toast.success("Desconectando...");
    try {
      await signOut();
      setTimeout(() => {
        navigate({ to: "/" });
      }, 500);
    } catch (err) {
      toast.error("Erro ao sair.");
    }
  };

  return (
    <header className="sticky top-0 z-30 flex h-14 items-center justify-between border-b border-zinc-800 bg-background/80 px-4 backdrop-blur md:px-6">
      <div className="flex items-center gap-3 md:hidden">
        <Link to="/" className="flex items-center gap-2">
          <span className="text-primary">⚡</span>
          <span className="text-sm font-bold text-white">ViralMind</span>
        </Link>
      </div>

      <div className="ml-auto flex items-center gap-2 md:gap-3">
        <Link
          to="/analyze"
          className="hidden items-center gap-1.5 rounded-lg bg-primary px-3 py-1.5 text-sm font-semibold text-primary-foreground transition hover:bg-primary/90 md:inline-flex"
        >
          <Plus size={14} /> Nova Análise
        </Link>

        <span className="hidden rounded-md bg-zinc-800 px-2.5 py-1 text-xs font-medium text-zinc-300 sm:inline font-mono">
          {credits} {credits === 1 ? "crédito" : "créditos"}
        </span>

        <button
          aria-label="Notificações"
          className="relative rounded-md p-2 text-zinc-400 transition hover:bg-zinc-900 hover:text-zinc-100"
        >
          <Bell size={16} />
          <span className="absolute right-1 top-1 flex h-4 min-w-[16px] items-center justify-center rounded-full bg-primary px-1 text-[10px] font-bold text-primary-foreground">
            2
          </span>
        </button>

        <div ref={ref} className="relative">
          <button
            onClick={() => setOpen((o) => !o)}
            className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-primary to-secondary text-xs font-bold text-primary-foreground transition hover:scale-105"
          >
            {initials}
          </button>
          {open && (
            <div className="absolute right-0 top-10 z-40 w-44 overflow-hidden rounded-xl border border-zinc-800 bg-zinc-900 shadow-xl">
              <Link
                to="/profile"
                onClick={() => setOpen(false)}
                className="block px-4 py-2.5 text-sm text-zinc-200 transition hover:bg-zinc-800"
              >
                Meu Perfil
              </Link>
              <button
                onClick={() => setOpen(false)}
                className="block w-full px-4 py-2.5 text-left text-sm text-zinc-200 transition hover:bg-zinc-800"
              >
                Configurações
              </button>
              <div className="border-t border-zinc-800" />
              <button
                onClick={handleLogout}
                className="block w-full px-4 py-2.5 text-left text-sm text-red-400 transition hover:bg-zinc-800 cursor-pointer"
              >
                Sair
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
