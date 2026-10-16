import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/db/schema";

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

export const supabase: SupabaseClient<Database> = createClient<Database>(
  resolvedUrl,
  resolvedAnonKey
);

export default supabase;
