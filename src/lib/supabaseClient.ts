import { createClient, type Session, type SupabaseClient } from "@supabase/supabase-js";
export type { Database } from "@/db/schema";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || "";
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || "";

export const isSupabaseConfigured = Boolean(
  supabaseUrl &&
  supabaseAnonKey &&
  typeof supabaseUrl === "string" &&
  supabaseUrl.startsWith("http") &&
  !supabaseUrl.includes("[PASTE")
);

// Fallback placeholder URL and key if environment variables are not configured yet.
// Prevents createClient from throwing an uncaught exception on bundle initialization.
const resolvedUrl = isSupabaseConfigured
  ? supabaseUrl
  : "https://placeholder-dialed-instance.supabase.co";

const resolvedAnonKey = isSupabaseConfigured
  ? supabaseAnonKey
  : "placeholder-anon-key";

/**
 * Determine the default Supabase project storage key: `sb-<project-ref>-auth-token`
 */
export function getSupabaseProjectRef(): string | null {
  try {
    if (!resolvedUrl) return null;
    const hostname = new URL(resolvedUrl).hostname;
    const ref = hostname.split(".")[0];
    return ref || null;
  } catch {
    return null;
  }
}

export const SUPABASE_STORAGE_KEY = (() => {
  const ref = getSupabaseProjectRef();
  return ref ? `sb-${ref}-auth-token` : "sb-default-auth-token";
})();

/**
 * Safe Custom Storage Adapter wrapping localStorage.
 * Handles SSR, exceptions (e.g. Safari private browsing quota limits), and provides clean fallback.
 */
export const customStorageAdapter = {
  getItem: (key: string): string | null => {
    if (typeof window === "undefined" || !window.localStorage) return null;
    try {
      return window.localStorage.getItem(key);
    } catch (e) {
      console.warn("[CustomStorageAdapter] getItem failed:", e);
      return null;
    }
  },
  setItem: (key: string, value: string): void => {
    if (typeof window === "undefined" || !window.localStorage) return;
    try {
      window.localStorage.setItem(key, value);
    } catch (e) {
      console.warn("[CustomStorageAdapter] setItem failed:", e);
    }
  },
  removeItem: (key: string): void => {
    if (typeof window === "undefined" || !window.localStorage) return;
    try {
      window.localStorage.removeItem(key);
    } catch (e) {
      console.warn("[CustomStorageAdapter] removeItem failed:", e);
    }
  },
};

/**
 * Parse a raw JSON auth token string into a valid Supabase Session object.
 */
export function parseSessionPayload(raw: string): Session | null {
  try {
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    const sessionData: any =
      parsed?.access_token ? parsed : parsed?.session || parsed?.currentSession;

    if (sessionData?.access_token && sessionData?.user?.id) {
      return sessionData as Session;
    }
  } catch {
    // Malformed JSON, return null
  }
  return null;
}

/**
 * Synchronous fast-path check: Directly reads the JWT cookie or local storage string
 * (e.g., JSON.parse(localStorage.getItem('sb-<project-ref>-auth-token'))) to synchronously
 * get the session without waiting on WebKit's navigator.locks queue.
 */
export function getFastPathSession(): Session | null {
  if (typeof window === "undefined") return null;

  try {
    // 1. Direct check of the project's primary auth token key in localStorage
    if (window.localStorage) {
      const primaryRaw = customStorageAdapter.getItem(SUPABASE_STORAGE_KEY);
      if (primaryRaw) {
        const session = parseSessionPayload(primaryRaw);
        if (session) return session;
      }

      // 2. Scan localStorage for any sb-*-auth-token or supabase.auth.token
      for (let i = 0; i < window.localStorage.length; i++) {
        const key = window.localStorage.key(i);
        if (
          key &&
          ((key.startsWith("sb-") && key.endsWith("-auth-token")) ||
            key === "supabase.auth.token")
        ) {
          const raw = window.localStorage.getItem(key);
          if (raw) {
            const session = parseSessionPayload(raw);
            if (session) return session;
          }
        }
      }
    }

    // 3. Fallback: Directly read cookies for the auth token
    if (typeof document !== "undefined" && document.cookie) {
      const cookies = document.cookie.split(";");
      for (const cookie of cookies) {
        const [rawKey, rawVal] = cookie.trim().split("=");
        if (!rawKey || !rawVal) continue;
        if (
          rawKey === SUPABASE_STORAGE_KEY ||
          (rawKey.startsWith("sb-") && rawKey.endsWith("-auth-token")) ||
          rawKey === "supabase-auth-token" ||
          rawKey === "sb-access-token"
        ) {
          try {
            const decoded = decodeURIComponent(rawVal);
            const session = parseSessionPayload(decoded);
            if (session) return session;
          } catch {}
        }
      }
    }
  } catch (err) {
    console.warn("[FastPathAuth] Error synchronously reading session:", err);
  }

  return null;
}

/**
 * WebKit / iOS Safari Lock Bypass:
 * WebKit has a critical bug where navigator.locks.request deadlocks across tabs or during
 * initial page load, stalling getSession() for 10-30 seconds.
 * Providing a custom pass-through lock implementation bypasses navigator.locks safely.
 */
const safariBypassLock = async (
  _name: string,
  _acquireTimeout: number,
  fn: () => Promise<any>
) => {
  return await fn();
};

export const supabase: SupabaseClient<any, "public", any> = createClient(
  resolvedUrl,
  resolvedAnonKey,
  {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true,
      storage: customStorageAdapter,
      storageKey: SUPABASE_STORAGE_KEY,
      lock: safariBypassLock,
    },
  }
);

export default supabase;
