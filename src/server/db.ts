import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";

// Read directly from process.env since our env.js module will throw errors if ran from using npx
const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error("DATABASE_URL is not defined");
}

// Disable prefetch as it is not supported for "Transaction" pool mode
export const client = postgres(connectionString, { prepare: false });
export const db = drizzle(client);
