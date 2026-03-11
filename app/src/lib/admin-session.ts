import { db } from "@/lib/db";

/**
 * Temporary helper to resolve the current manager.
 * Returns the first manager in the database.
 * TODO: Replace with real auth (JWT / session cookie).
 */
export async function getCurrentManager() {
  const manager = await db.query.managers.findFirst({
    with: { agency: true },
  });

  if (!manager) {
    throw new Error("No manager found — run seed first");
  }

  return manager;
}
