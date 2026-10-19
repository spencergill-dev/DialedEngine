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

    // 1. Fail-Fast Hydration:
    // Wrap initial supabase.auth.getSession() in a 1500ms timeout race condition.
    // If Safari hangs on the Web Locks API, catch the timeout, log the warning,
    // and force the app to render the unauthenticated state (or optimistic cached state)
    // immediately so the user is never stuck waiting 20 seconds.
    const AUTH_TIMEOUT_MS = 1500;
    let timeoutId: ReturnType<typeof setTimeout>;

    const timeoutPromise = new Promise<{ timeout: true }>((resolve) => {
      timeoutId = setTimeout(() => resolve({ timeout: true }), AUTH_TIMEOUT_MS);
    });

    const sessionPromise = supabase.auth.getSession().catch((err) => {
      console.warn("[AuthProvider] getSession error:", err);
      return { data: { session: null }, error: err };
    });

    Promise.race([sessionPromise, timeoutPromise])
      .then((result) => {
        if (!isMounted) return;

        if ("timeout" in result) {
          console.warn(
            `[AuthProvider] Safari Web Locks / getSession timed out after ${AUTH_TIMEOUT_MS}ms. Forcing immediate render with optimistic or unauthenticated state.`
          );
          // Release loading state immediately: UI will display optimistic cached session
          // if available, or unauthenticated view if none exists.
          setIsAuthLoading(false);
          return;
        }

        const { data: { session: verifiedSession }, error } = result;
        if (error) {
          console.warn("[AuthProvider] Session verification error:", error);
        }

        if (verifiedSession) {
          setSession(verifiedSession);
        } else {
          // If server verified there is no active session, clear state
          setSession(null);
        }
        setIsAuthLoading(false);
      })
      .catch((err) => {
        console.warn("[AuthProvider] Auth race exception:", err);
        if (isMounted) {
          setIsAuthLoading(false);
        }
      });

    // 2. Global listener for auth state changes & background token refresh
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

    return () => {
      isMounted = false;
      clearTimeout(timeoutId);
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
