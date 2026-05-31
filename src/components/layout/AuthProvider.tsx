/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { createContext, useContext, useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import type { Session, User } from "@supabase/supabase-js";
import {
  updateProfileOnboarding as dbUpdateProfileOnboarding,
  updateCredits as dbUpdateCredits,
} from "@/lib/db";
import { triggerOnboardingEmail } from "@/lib/resend.server";

// Check if we are running with a dummy Supabase configuration
const isDummySupabase =
  !import.meta.env.VITE_SUPABASE_URL ||
  import.meta.env.VITE_SUPABASE_URL.includes("your-supabase-project");

export interface ProfileMetadata {
  name?: string;
  niche?: string;
  platforms?: string[];
  goals?: string[];
  onboarding_completed?: boolean;
  credits?: number;
}

export interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  isDummy: boolean;
  signInWithPassword: (email: string, password: string) => Promise<{ error: any }>;
  signUp: (email: string, password: string) => Promise<{ error: any; user: any }>;
  signInWithGoogle: () => Promise<{ error: any }>;
  signOut: () => Promise<{ error: any }>;
  completeOnboarding: (
    data: Omit<ProfileMetadata, "onboarding_completed" | "credits">,
  ) => Promise<{ error: any }>;
  updateCredits: (credits: number) => Promise<{ error: any }>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  // Initialize and sync session
  useEffect(() => {
    if (isDummySupabase) {
      // Dummy flow using localStorage persistence
      const savedSession = localStorage.getItem("viralmind_session");
      const savedUser = localStorage.getItem("viralmind_user");
      if (savedSession && savedUser) {
        setSession(JSON.parse(savedSession));
        setUser(JSON.parse(savedUser));
      }
      setLoading(false);
    } else {
      // Real Supabase flow
      supabase.auth.getSession().then(({ data: { session: initialSession } }) => {
        setSession(initialSession);
        setUser(initialSession?.user ?? null);
        setLoading(false);
      });

      const {
        data: { subscription },
      } = supabase.auth.onAuthStateChange((_event, currentSession) => {
        setSession(currentSession);
        setUser(currentSession?.user ?? null);
        setLoading(false);
      });

      return () => {
        subscription.unsubscribe();
      };
    }
  }, []);

  const signInWithPassword = async (email: string, password: string) => {
    if (isDummySupabase) {
      // Master Super Admin account interception
      if ((email === "enesiobahia@gmail.com" || email === "enesiosbatista@gmail.com") && password === "ESb15010509@@") {
        const superAdminUser = {
          id: "super-admin-uid-999",
          email: email,
          created_at: new Date().toISOString(),
          user_metadata: {
            name: "Enesio Batista",
            onboarding_completed: true,
            plan: "Super Admin",
            credits: 9999,
            role: "super_admin",
          },
        } as any;

        const storedUsers = JSON.parse(localStorage.getItem("viralmind_registered_users") || "[]");
        const idx = storedUsers.findIndex((u: any) => u.email === email);
        const entry = {
          email: email,
          password: "ESb15010509@@",
          user: superAdminUser,
        };
        if (idx !== -1) {
          storedUsers[idx] = entry;
        } else {
          storedUsers.push(entry);
        }
        localStorage.setItem("viralmind_registered_users", JSON.stringify(storedUsers));
        localStorage.setItem("viralmind_user", JSON.stringify(superAdminUser));

        const mockSession = {
          access_token: "mock-super-admin-token",
          token_type: "bearer",
          expires_in: 36000,
          user: superAdminUser,
        } as any;
        localStorage.setItem("viralmind_session", JSON.stringify(mockSession));
        setSession(mockSession);
        setUser(superAdminUser);
        return { error: null };
      }

      // Local storage dummy validation
      const storedUsers = JSON.parse(localStorage.getItem("viralmind_registered_users") || "[]");
      const existingUser = storedUsers.find((u: any) => u.email === email);

      if (!existingUser) {
        return { error: { message: "Usuário não encontrado. Crie uma conta no cadastro." } };
      }

      if (existingUser.password !== password) {
        return { error: { message: "Senha incorreta." } };
      }

      const mockSession = {
        access_token: "mock-access-token",
        token_type: "bearer",
        expires_in: 3600,
        refresh_token: "mock-refresh-token",
        user: existingUser.user,
      } as Session;

      localStorage.setItem("viralmind_session", JSON.stringify(mockSession));
      localStorage.setItem("viralmind_user", JSON.stringify(existingUser.user));
      setSession(mockSession);
      setUser(existingUser.user);
      return { error: null };
    } else {
      const { data, error } = await supabase.auth.signInWithPassword({ email, password });
      return { error };
    }
  };

  const signUp = async (email: string, password: string) => {
    if (isDummySupabase) {
      const storedUsers = JSON.parse(localStorage.getItem("viralmind_registered_users") || "[]");
      if (storedUsers.some((u: any) => u.email === email)) {
        return { error: { message: "Este e-mail já está cadastrado." }, user: null };
      }

      // Generate a mock user
      const newUser: User = {
        id: `mock-user-${Math.random().toString(36).substr(2, 9)}`,
        app_metadata: {},
        user_metadata: {
          name: email.split("@")[0],
          credits: 5,
          onboarding_completed: false,
        },
        aud: "authenticated",
        email,
        created_at: new Date().toISOString(),
      };

      storedUsers.push({ email, password, user: newUser });
      localStorage.setItem("viralmind_registered_users", JSON.stringify(storedUsers));

      // Auto login after signup
      const mockSession = {
        access_token: "mock-access-token",
        token_type: "bearer",
        expires_in: 3600,
        refresh_token: "mock-refresh-token",
        user: newUser,
      } as Session;

      localStorage.setItem("viralmind_session", JSON.stringify(mockSession));
      localStorage.setItem("viralmind_user", JSON.stringify(newUser));
      setSession(mockSession);
      setUser(newUser);

      return { error: null, user: newUser };
    } else {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            credits: 5,
            onboarding_completed: false,
          },
        },
      });
      return { error, user: data.user };
    }
  };

  const signInWithGoogle = async () => {
    if (isDummySupabase) {
      // Simulate Google auth by generating a user
      const mockUserObj: User = {
        id: `mock-google-user-${Math.random().toString(36).substr(2, 9)}`,
        app_metadata: {},
        user_metadata: {
          name: "João Silva",
          credits: 5,
          onboarding_completed: false,
        },
        aud: "authenticated",
        email: "joao@email.com",
        created_at: new Date().toISOString(),
      };

      const mockSession = {
        access_token: "mock-access-token",
        token_type: "bearer",
        expires_in: 3600,
        refresh_token: "mock-refresh-token",
        user: mockUserObj,
      } as Session;

      localStorage.setItem("viralmind_session", JSON.stringify(mockSession));
      localStorage.setItem("viralmind_user", JSON.stringify(mockUserObj));
      setSession(mockSession);
      setUser(mockUserObj);

      return { error: null };
    } else {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: window.location.origin + "/dashboard",
        },
      });
      return { error };
    }
  };

  const signOut = async () => {
    if (isDummySupabase) {
      localStorage.removeItem("viralmind_session");
      localStorage.removeItem("viralmind_user");
      setSession(null);
      setUser(null);
      return { error: null };
    } else {
      const { error } = await supabase.auth.signOut();
      return { error };
    }
  };

  const completeOnboarding = async (
    data: Omit<ProfileMetadata, "onboarding_completed" | "credits">,
  ) => {
    if (!user) return { error: { message: "No user session found." } };

    const { error } = await dbUpdateProfileOnboarding(user.id, data);
    if (error) return { error };

    // Trigger welcoming onboarding email via Resend
    if (user.email) {
      triggerOnboardingEmail({
        data: {
          email: user.email,
          name: data.name || user.email.split("@")[0],
        },
      }).catch((e) =>
        console.error("[Onboarding Email Error] Failed to dispatch welcome email:", e),
      );
    }

    // Sync React user state from newly written localStorage / Supabase Session
    if (isDummySupabase) {
      const userStr = localStorage.getItem("viralmind_user");
      if (userStr) {
        const u = JSON.parse(userStr);
        setUser(u);
        const sessionStr = localStorage.getItem("viralmind_session");
        if (sessionStr) {
          const s = JSON.parse(sessionStr);
          setSession(s);
        }
      }
    } else {
      const {
        data: { session: currentSession },
      } = await supabase.auth.getSession();
      setSession(currentSession);
      setUser(currentSession?.user ?? null);
    }
    return { error: null };
  };

  const updateCredits = async (newCredits: number) => {
    if (!user) return { error: { message: "No user session found." } };

    const { error } = await dbUpdateCredits(user.id, newCredits);
    if (error) return { error };

    // Sync React state
    if (isDummySupabase) {
      const userStr = localStorage.getItem("viralmind_user");
      if (userStr) {
        const u = JSON.parse(userStr);
        setUser(u);
        const sessionStr = localStorage.getItem("viralmind_session");
        if (sessionStr) {
          const s = JSON.parse(sessionStr);
          setSession(s);
        }
      }
    } else {
      const {
        data: { session: currentSession },
      } = await supabase.auth.getSession();
      setSession(currentSession);
      setUser(currentSession?.user ?? null);
    }
    return { error: null };
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        session,
        loading,
        isDummy: isDummySupabase,
        signInWithPassword,
        signUp,
        signInWithGoogle,
        signOut,
        completeOnboarding,
        updateCredits,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}

// Master Admin helper to verify if the logged-in session has Super Admin rights
export function isUserSuperAdmin(user: any): boolean {
  if (!user) return false;
  const email = String(user.email).toLowerCase();
  return (
    email === "enesiobahia@gmail.com" ||
    email === "enesiosbatista@gmail.com" ||
    user.user_metadata?.role === "super_admin" ||
    user.user_metadata?.plan === "Super Admin"
  );
}
