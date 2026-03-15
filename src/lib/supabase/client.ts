import { createBrowserClient } from "@supabase/ssr";
import type { Database } from "@/types/database";

export function createClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

  if (!url || !key) {
    console.error("[supabase] missing env vars", {
      url: url ? "set" : "MISSING",
      key: key ? "set" : "MISSING",
    });
  }

  return createBrowserClient<Database>(url, key);
}
