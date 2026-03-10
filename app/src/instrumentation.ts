import { createLogger } from "@/lib/logger";

const log = createLogger("instrumentation");

/**
 * Next.js instrumentation — runs once on server startup.
 * Used to initialize the scheduler and bot.
 *
 * @see https://nextjs.org/docs/app/building-your-application/optimizing/instrumentation
 */
export async function register() {
  // Only run on server (not edge)
  if (process.env.NEXT_RUNTIME === "nodejs") {
    log.info("Server starting — initializing services");

    // Initialize scheduler (cron jobs)
    const { initScheduler } = await import("@/lib/scheduler");
    initScheduler();

    log.info("Services initialized");
  }
}
