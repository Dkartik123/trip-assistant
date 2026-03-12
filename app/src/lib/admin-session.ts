import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { eq } from "drizzle-orm";
import { managers } from "@/lib/db/schema";

/**
 * Resolve the authenticated manager from the session JWT.
 * Throws if not authenticated or manager not found.
 */
export async function getCurrentManager() {
  const session = await auth();

  if (!session?.user?.managerId) {
    throw new Error("Not authenticated");
  }

  const manager = await db.query.managers.findFirst({
    where: eq(managers.id, session.user.managerId),
    with: { agency: true },
  });

  if (!manager) {
    throw new Error("Manager not found");
  }

  return manager;
}
