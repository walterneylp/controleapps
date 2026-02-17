import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { env } from "../config/env.js";

export interface SupabaseRuntime {
  enabled: boolean;
  authClient: SupabaseClient | null;
  serviceClient: SupabaseClient | null;
  bucketName: string;
}

function buildClient(url: string | undefined, key: string | undefined): SupabaseClient | null {
  if (!url || !key) return null;
  return createClient(url, key, {
    auth: {
      persistSession: false,
      autoRefreshToken: false
    }
  });
}

const authClient = buildClient(env.supabaseUrl, env.supabaseAnonKey);
const serviceClient = buildClient(env.supabaseUrl, env.supabaseServiceRoleKey);

export const supabaseRuntime: SupabaseRuntime = {
  enabled: Boolean(authClient || serviceClient),
  authClient,
  serviceClient,
  bucketName: env.supabaseBucket
};
