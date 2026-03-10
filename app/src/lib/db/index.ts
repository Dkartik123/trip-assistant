import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "./schema";

/**
 * Database connection singleton.
 * In development, reuse across hot-reloads via globalThis.
 */
const globalForDb = globalThis as unknown as {
  pgConnection: ReturnType<typeof postgres> | undefined;
};

const connectionString = process.env.DATABASE_URL!;

const pg =
  globalForDb.pgConnection ??
  postgres(connectionString, {
    max: 10,
    idle_timeout: 20,
    connect_timeout: 10,
  });

if (process.env.NODE_ENV !== "production") {
  globalForDb.pgConnection = pg;
}

export const db = drizzle(pg, { schema });

export type Database = typeof db;
