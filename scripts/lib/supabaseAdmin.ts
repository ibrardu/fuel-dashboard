// Service-role Supabase client for ingestion/backfill scripts only.
//
// Deliberately lives under scripts/, outside the Next.js app's module graph
// (app/, lib/), so the service-role key can never end up in a client bundle.
// Reads plain process.env vars — no NEXT_PUBLIC_ prefix, since that's a
// Next.js build-time convention for values that are safe to expose to the
// browser, which this key is not.

import { createClient, type SupabaseClient } from "@supabase/supabase-js";

let client: SupabaseClient | null = null;

export function getSupabaseAdmin(): SupabaseClient {
  if (client) return client;

  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) {
    throw new Error(
      "SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY must be set to run ingestion/backfill scripts."
    );
  }

  client = createClient(url, key, { auth: { persistSession: false } });
  return client;
}
