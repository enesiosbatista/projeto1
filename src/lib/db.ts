/* eslint-disable @typescript-eslint/no-explicit-any */
import { supabase } from "./supabase";
import type { Analysis, Profile } from "@/types/database";

const isDummySupabase =
  !import.meta.env.VITE_SUPABASE_URL ||
  import.meta.env.VITE_SUPABASE_URL.includes("your-supabase-project");

/**
 * DATABASE PROFILES FUNCTIONS
 */
export async function getProfile(userId: string): Promise<Profile | null> {
  if (isDummySupabase) {
    const userStr = localStorage.getItem("viralmind_user");
    if (userStr) {
      const userObj = JSON.parse(userStr);
      if (userObj && userObj.id === userId) {
        return {
          id: userObj.id,
          username: userObj.user_metadata?.name || userObj.email?.split("@")[0] || "Criador",
          plan: userObj.user_metadata?.plan || "free",
          credits: userObj.user_metadata?.credits ?? 5,
          created_at: userObj.created_at || new Date().toISOString(),
        } as Profile;
      }
    }
    return null;
  } else {
    const { data, error } = await supabase.from("profiles").select("*").eq("id", userId).single();

    if (error) {
      console.error("Error fetching profile from Supabase", error);
      return null;
    }
    return data as Profile;
  }
}

export async function updateProfileOnboarding(
  userId: string,
  data: { name: string; niche: string; platforms: string[]; goals: string[] },
): Promise<{ error: any }> {
  if (isDummySupabase) {
    const userStr = localStorage.getItem("viralmind_user");
    if (userStr) {
      const user = JSON.parse(userStr);
      const updatedMetadata = {
        ...user.user_metadata,
        name: data.name,
        niche: data.niche,
        platforms: data.platforms,
        goals: data.goals,
        onboarding_completed: true,
        credits: 3, // Initial starter credits
      };

      const updatedUser = {
        ...user,
        user_metadata: updatedMetadata,
      };

      // Sync user database
      const storedUsers = JSON.parse(localStorage.getItem("viralmind_registered_users") || "[]");
      const userIndex = storedUsers.findIndex((u: any) => u.user.id === userId);
      if (userIndex !== -1) {
        storedUsers[userIndex].user = updatedUser;
        localStorage.setItem("viralmind_registered_users", JSON.stringify(storedUsers));
      }

      localStorage.setItem("viralmind_user", JSON.stringify(updatedUser));
      const sessionStr = localStorage.getItem("viralmind_session");
      if (sessionStr) {
        const session = JSON.parse(sessionStr);
        localStorage.setItem(
          "viralmind_session",
          JSON.stringify({ ...session, user: updatedUser }),
        );
      }
      return { error: null };
    }
    return { error: { message: "Mock user not found in local storage" } };
  } else {
    // 1. Update auth metadata
    const { error: authError } = await supabase.auth.updateUser({
      data: {
        name: data.name,
        niche: data.niche,
        platforms: data.platforms,
        goals: data.goals,
        onboarding_completed: true,
        credits: 3,
      },
    });

    if (authError) return { error: authError };

    // 2. Insert/Update public.profiles table
    const { error: dbError } = await supabase.from("profiles").upsert({
      id: userId,
      username: data.name,
      plan: "free",
      credits: 3,
      niche: data.niche,
      platforms: data.platforms,
      goals: data.goals,
    });

    return { error: dbError };
  }
}

export async function updateCredits(userId: string, credits: number): Promise<{ error: any }> {
  if (isDummySupabase) {
    const userStr = localStorage.getItem("viralmind_user");
    if (userStr) {
      const user = JSON.parse(userStr);
      const updatedMetadata = {
        ...user.user_metadata,
        credits,
      };

      const updatedUser = {
        ...user,
        user_metadata: updatedMetadata,
      };

      // Sync user database
      const storedUsers = JSON.parse(localStorage.getItem("viralmind_registered_users") || "[]");
      const userIndex = storedUsers.findIndex((u: any) => u.user.id === userId);
      if (userIndex !== -1) {
        storedUsers[userIndex].user = updatedUser;
        localStorage.setItem("viralmind_registered_users", JSON.stringify(storedUsers));
      }

      localStorage.setItem("viralmind_user", JSON.stringify(updatedUser));
      const sessionStr = localStorage.getItem("viralmind_session");
      if (sessionStr) {
        const session = JSON.parse(sessionStr);
        localStorage.setItem(
          "viralmind_session",
          JSON.stringify({ ...session, user: updatedUser }),
        );
      }
      return { error: null };
    }
    return { error: { message: "Mock user not found" } };
  } else {
    // 1. Update user metadata
    await supabase.auth.updateUser({
      data: { credits },
    });

    // 2. Update profiles table
    const { error } = await supabase.from("profiles").update({ credits }).eq("id", userId);

    return { error };
  }
}

/**
 * DATABASE ANALYSES FUNCTIONS
 */
export async function getAnalyses(userId: string): Promise<Analysis[]> {
  if (isDummySupabase) {
    const key = `viralmind_analyses_${userId}`;
    const stored = localStorage.getItem(key);
    if (stored) {
      try {
        return JSON.parse(stored) as Analysis[];
      } catch (e) {
        console.error(e);
      }
    }
    return [];
  } else {
    const { data, error } = await supabase
      .from("analyses")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error fetching analyses", error);
      return [];
    }
    return (data || []) as Analysis[];
  }
}

export async function saveAnalysis(analysis: Analysis): Promise<{ error: any }> {
  if (isDummySupabase) {
    const key = `viralmind_analyses_${analysis.user_id}`;
    const stored = localStorage.getItem(key);
    let list = [];
    if (stored) {
      try {
        list = JSON.parse(stored);
      } catch (e) {
        console.error(e);
      }
    }
    // Check if item exists to update or insert
    const idx = list.findIndex((a: any) => a.id === analysis.id);
    if (idx !== -1) {
      list[idx] = analysis;
    } else {
      list.unshift(analysis);
    }
    localStorage.setItem(key, JSON.stringify(list));
    return { error: null };
  } else {
    const { error } = await supabase.from("analyses").upsert({
      id: analysis.id,
      user_id: analysis.user_id,
      url: analysis.url,
      platform: analysis.platform,
      title: analysis.title,
      thumbnail_url: analysis.thumbnail_url,
      duration_seconds: analysis.duration_seconds,
      viral_score: analysis.viral_score,
      status: analysis.status,
      is_favorited: analysis.isFavorited || false,
      result: analysis.result,
      created_at: analysis.created_at,
    });
    return { error };
  }
}

export async function deleteAnalysis(userId: string, analysisId: string): Promise<{ error: any }> {
  if (isDummySupabase) {
    const key = `viralmind_analyses_${userId}`;
    const stored = localStorage.getItem(key);
    if (stored) {
      try {
        const list = JSON.parse(stored) as Analysis[];
        const filtered = list.filter((a) => a.id !== analysisId);
        localStorage.setItem(key, JSON.stringify(filtered));
      } catch (e) {
        console.error(e);
      }
    }
    return { error: null };
  } else {
    const { error } = await supabase
      .from("analyses")
      .delete()
      .eq("id", analysisId)
      .eq("user_id", userId);
    return { error };
  }
}

export async function toggleFavoriteAnalysis(
  userId: string,
  analysisId: string,
  isFavorited: boolean,
): Promise<{ error: any }> {
  if (isDummySupabase) {
    const key = `viralmind_analyses_${userId}`;
    const stored = localStorage.getItem(key);
    if (stored) {
      try {
        const list = JSON.parse(stored) as Analysis[];
        const updated = list.map((a) => (a.id === analysisId ? { ...a, isFavorited } : a));
        localStorage.setItem(key, JSON.stringify(updated));
      } catch (e) {
        console.error(e);
      }
    }
    return { error: null };
  } else {
    const { error } = await supabase
      .from("analyses")
      .update({ is_favorited: isFavorited })
      .eq("id", analysisId)
      .eq("user_id", userId);
    return { error };
  }
}

/**
 * DATABASE RECREATIONS FUNCTIONS
 */
export async function getRecreations(analysisId: string): Promise<any[]> {
  if (isDummySupabase) {
    const key = `viralmind_recreations_${analysisId}`;
    const stored = localStorage.getItem(key);
    if (stored) {
      try {
        return JSON.parse(stored);
      } catch (e) {
        console.error(e);
      }
    }
    return [];
  } else {
    const { data, error } = await supabase
      .from("recreations")
      .select("*")
      .eq("analysis_id", analysisId)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error fetching recreations", error);
      return [];
    }
    return data || [];
  }
}

export async function saveRecreation(
  analysisId: string,
  style: string,
  content: string,
): Promise<{ error: any; data: any }> {
  if (isDummySupabase) {
    const key = `viralmind_recreations_${analysisId}`;
    const stored = localStorage.getItem(key);
    let list = [];
    if (stored) {
      try {
        list = JSON.parse(stored);
      } catch (e) {
        console.error(e);
      }
    }
    const newRecreation = {
      id: `recreation-${Date.now()}`,
      analysis_id: analysisId,
      style,
      content,
      created_at: new Date().toISOString(),
    };
    list.unshift(newRecreation);
    localStorage.setItem(key, JSON.stringify(list));
    return { error: null, data: newRecreation };
  } else {
    const { data, error } = await supabase
      .from("recreations")
      .insert({
        analysis_id: analysisId,
        style,
        content,
      })
      .select()
      .single();

    return { error, data };
  }
}
