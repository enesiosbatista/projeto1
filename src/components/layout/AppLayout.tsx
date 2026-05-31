import type { ReactNode } from "react";
import { useEffect } from "react";
import { useNavigate } from "@tanstack/react-router";
import { useAuth } from "./AuthProvider";
import { Header } from "./Header";
import { Sidebar } from "./Sidebar";
import { BottomNav } from "./BottomNav";
import { Loader2 } from "lucide-react";

export function AppLayout({ children }: { children: ReactNode }) {
  const { user, loading, signOut } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading) {
      if (!user) {
        navigate({ to: "/login" });
      } else if (
        user.user_metadata?.plan === "banned" ||
        user.user_metadata?.role === "banned"
      ) {
        import("sonner").then(({ toast }) => {
          toast.error("Sua conta foi suspensa temporariamente ou banida por violação dos Termos de Uso.");
        });
        signOut();
        navigate({ to: "/login" });
      }
    }
  }, [user, loading, navigate, signOut]);

  if (loading) {
    return (
      <div className="flex min-h-screen w-full items-center justify-center bg-zinc-950 text-foreground">
        <div className="text-center space-y-4">
          <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto" />
          <p className="text-sm text-zinc-400 font-medium font-mono">Carregando...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return null; // Will redirect in useEffect
  }

  return (
    <div className="flex min-h-screen w-full bg-background text-foreground">
      <Sidebar />
      <div className="flex min-h-screen flex-1 flex-col">
        <Header />
        <main className="flex-1 overflow-y-auto pb-20 md:pb-0">{children}</main>
      </div>
      <BottomNav />
    </div>
  );
}
