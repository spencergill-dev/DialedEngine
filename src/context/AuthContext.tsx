import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useMemo,
  useCallback,
} from "react";
import type { Session, User } from "@supabase/supabase-js";
import { supabase, isSupabaseConfigured } from "@/lib/supabaseClient";
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
 * Synchronously retrieves cached session from localStorage to enable instant
 * optimistic UI rendering on app reload before Supabase network validation.
 */
export function getOptimisticSession(): Session | null {
  if (typeof window === "undefined" || !window.localStorage) return null;

  try {
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (
        key &&
        ((key.startsWith("sb-") && key.endsWith("-auth-token")) ||
          key === "supabase.auth.token")
      ) {
        const raw = localStorage.getItem(key);
        if (!raw) continue;
        const parsed = JSON.parse(raw);
        const sessionData: any =
          parsed?.access_token ? parsed : parsed?.session || parsed?.currentSession;

        if (sessionData?.access_token && sessionData?.user?.id) {
          const nowSec = Math.floor(Date.now() / 1000);
          // If token has an expiration, ensure it hasn't expired (30s buffer)
          if (!sessionData.expires_at || sessionData.expires_at > nowSec + 30) {
            return sessionData as Session;
          }
        }
      }
    }
  } catch (err) {
    console.warn("[AuthContext] Failed parsing optimistic session from localStorage:", err);
  }

  return null;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  // 1. Optimistic Synchronous State: Instant Frame 1 UI for returning users
  const [session, setSession] = useState<Session | null>(() => getOptimisticSession());
  const [isAuthLoading, setIsAuthLoading] = useState<boolean>(() => {
    if (!isSupabaseConfigured) return false;
    return !getOptimisticSession();
  });
  const [isGuestMode, setIsGuestMode] = useState<boolean>(false);

  useEffect(() => {
    let isMounted = true;

    if (!isSupabaseConfigured) {
      setIsAuthLoading(false);
      return;
    }

    // 1. Single consolidated call to getSession at the highest level
    supabase.auth
      .getSession()
      .then(({ data: { session: verifiedSession }, error }) => {
        if (!isMounted) return;
        if (error) {
          console.warn("[AuthProvider] Session verification error:", error);
        }
        if (verifiedSession) {
          setSession(verifiedSession);
        } else {
          // If no active session found on server, clear optimistic state
          setSession(null);
        }
        setIsAuthLoading(false);
      })
      .catch((err) => {
        console.warn("[AuthProvider] getSession exception:", err);
        if (isMounted) setIsAuthLoading(false);
      });

    // 2. Sole global listener for auth state changes across the entire application
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
