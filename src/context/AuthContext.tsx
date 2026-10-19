import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useMemo,
  useCallback,
} from "react";
import type { Session, User } from "@supabase/supabase-js";
import {
  supabase,
  isSupabaseConfigured,
  getFastPathSession,
} from "@/lib/supabaseClient";
import { clearAllLocalUserData } from "@/lib/accountService";

export interface AuthContextType {
  session: Session | null;
  user: User | null;
  userId: string | null;
  userEmail: string | null;
  userName: string | null;
  isAuthLoading: boolean;
  isGuestMode: boolean;
  setIsGuestMode: (guest: boolean) => void;
  signOut: () => Promise<void>;
  refreshSession: () => Promise<void>;
}

/**
 * Backwards-compatible alias for getFastPathSession
 */
export const getOptimisticSession = getFastPathSession;

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  // 1. Optimistic Initial State: Synchronous Fast-Path check directly reads localStorage/cookie
  // Allows app UI to render instantly without waiting for async lock queue or network getSession()
  const [session, setSession] = useState<Session | null>(() => getFastPathSession());
  const [isAuthLoading, setIsAuthLoading] = useState<boolean>(() => {
    if (!isSupabaseConfigured) return false;
    // If fast-path session exists, optimistic render happens immediately on Frame 0
    return !getFastPathSession();
  });
  const [isGuestMode, setIsGuestMode] = useState<boolean>(false);

  useEffect(() => {
    let isMounted = true;

    if (!isSupabaseConfigured) {
      setIsAuthLoading(false);
      return;
    }

    // 2. Background Validation & Refresh:
    // Let supabase.auth.onAuthStateChange handle actual token validation and refresh
    // in the background *after* the initial optimistic render.
    // We intentionally DO NOT call `await supabase.auth.getSession()` on mount to prevent
    // any navigator.locks queue stall on mobile Safari.
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, newSession) => {
      if (!isMounted) return;
      setSession(newSession);
      setIsAuthLoading(false);
      if (newSession) {
        setIsGuestMode(false);
      }
    });

    // Fast-path safety fallback: If onAuthStateChange hasn't emitted within 100ms
    // (e.g. for brand new unauthenticated users or offline mode), release loading state.
    const fallbackTimer = setTimeout(() => {
      if (isMounted) {
        setIsAuthLoading(false);
      }
    }, 100);

    return () => {
      isMounted = false;
      clearTimeout(fallbackTimer);
      subscription.unsubscribe();
    };
  }, []);

  const signOut = useCallback(async () => {
    const uid = session?.user?.id;
    try {
      await supabase.auth.signOut({ scope: "local" });
    } catch {}
    try {
      await supabase.auth.signOut();
    } catch {}
    clearAllLocalUserData(uid);
    setSession(null);
    setIsGuestMode(false);
  }, [session?.user?.id]);

  const refreshSession = useCallback(async () => {
    try {
      const { data } = await supabase.auth.getSession();
      if (data?.session) {
        setSession(data.session);
      }
    } catch (err) {
      console.warn("[AuthProvider] Failed refreshing session:", err);
    }
  }, []);

  const user = session?.user || null;
  const userId = user?.id || null;
  const userEmail = user?.email || null;
  const userName =
    user?.user_metadata?.first_name ||
    user?.user_metadata?.name ||
    (userEmail ? userEmail.split("@")[0] : null);

  const value = useMemo<AuthContextType>(
    () => ({
      session,
      user,
      userId,
      userEmail,
      userName,
      isAuthLoading,
      isGuestMode,
      setIsGuestMode,
      signOut,
      refreshSession,
    }),
    [
      session,
      user,
      userId,
      userEmail,
      userName,
      isAuthLoading,
      isGuestMode,
      signOut,
      refreshSession,
    ]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}

export default AuthProvider;
