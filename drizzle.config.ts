import type { Config } from "drizzle-kit";
import { env } from "~/env";

const config: Config = {
  // Path to the schema file
  schema: "./drizzle/schema.ts",
  // Output directory for the migration files
  out: "./drizzle",
  // Database driver to use
  driver: "pg",
  // Here we can select which schemas to include in drizzle when we use `drizzle-kit introspect`
  schemaFilter: ["public", "auth"],
  tablesFilter: ["users"],
  // Database connection credentials
  dbCredentials: {
    connectionString: env.DATABASE_URL,
  },
  // Enable verbose logging for detailed operation logs
  verbose: true,
  // Enforce strict mode for additional validations
  strict: true,
};

export default config;
