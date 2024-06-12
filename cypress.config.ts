import { createClient } from "@supabase/supabase-js";
import { defineConfig } from "cypress";
import { type Database } from "types_db";

export default defineConfig({
  component: {
    devServer: {
      framework: "next",
      bundler: "webpack",
      webpackConfig: {},
    },
  },
  e2e: {
    setupNodeEvents(on, config) {
      on("task", {
        async getCustomers({
          NEXT_PUBLIC_SUPABASE_URL,
          SUPABASE_SERVICE_ROLE,
        }: {
          NEXT_PUBLIC_SUPABASE_URL: string;
          SUPABASE_SERVICE_ROLE: string;
        }) {
          const supabaseAdmin = createClient<Database>(
            NEXT_PUBLIC_SUPABASE_URL,
            SUPABASE_SERVICE_ROLE,
          );

          const customers = await supabaseAdmin.from("customers").select("*");

          return customers.data;
        },
      });

      return config;
    },
  },
});
