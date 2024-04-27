import { createBrowserClient } from "@supabase/ssr";
import type { Database } from "types_db";
import { env } from "~/env";

// This is the supabase client we will use on the client-side
// For things like realtime updates with supabase subscriptions
// Make sure to implement RLS on the database
export const createClient = () =>
  createBrowserClient<Database>(
    env.NEXT_PUBLIC_SUPABASE_URL,
    env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  );
