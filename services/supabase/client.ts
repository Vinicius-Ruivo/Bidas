import { createClient, type SupabaseClient } from "@supabase/supabase-js";

import type { Database } from "@/lib/database.types";
import { hasSupabaseEnv } from "@/lib/env";

export function createSupabaseClient(): SupabaseClient<Database> | null {
  if (!hasSupabaseEnv()) {
    return null;
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!.trim();
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!.trim();

  try {
    return createClient<Database>(supabaseUrl, supabaseAnonKey);
  } catch {
    return null;
  }
}
