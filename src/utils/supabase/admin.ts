import { createClient } from "@supabase/supabase-js";
import { Database } from "types_db";
import { env } from "~/env";

export const supabaseAdmin = createClient<Database>(
  env.NEXT_PUBLIC_SUPABASE_URL,
  env.SUPABASE_SERVICE_ROLE,
);
