import { Context } from "grammy";
import { createLogger } from "@/lib/logger";

const log = createLogger("rate-limiter");

/**
 * In-memory rate limiter: 10 messages per minute per chat_id.
 * Simple sliding window implementation.
 */
const windows = new Map<string, number[]>();

const MAX_MESSAGES = 10;
const WINDOW_MS = 60_000; // 1 minute

/**
 * Clean up stale entries every 5 minutes to prevent memory leaks.
 */
setInterval(
  () => {
    const now = Date.now();
    for (const [key, timestamps] of windows.entries()) {
      const recent = timestamps.filter((t) => now - t < WINDOW_MS);
      if (recent.length === 0) {
        windows.delete(key);
      } else {
        windows.set(key, recent);
      }
    }
  },
  5 * 60_000,
);

export async function rateLimiter(
  ctx: Context,
  next: () => Promise<void>,
): Promise<void> {
  const chatId = ctx.chat?.id?.toString();
  if (!chatId) return next();

  const now = Date.now();
  const timestamps = windows.get(chatId) ?? [];
  const recent = timestamps.filter((t) => now - t < WINDOW_MS);

  if (recent.length >= MAX_MESSAGES) {
    log.warn({ chatId }, "Rate limit exceeded");
    await ctx.reply("⏳ Too many messages. Please wait a minute.");
    return;
  }

  recent.push(now);
  windows.set(chatId, recent);

  return next();
}
