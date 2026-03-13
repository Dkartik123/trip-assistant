import { createWebhookHandler } from "@/lib/bot";

/**
 * POST /api/webhook/telegram
 * Receives Telegram updates via webhook.
 * grammY processes the update and calls the appropriate handler.
 *
 * Lazy handler — avoids bot initialization at build time (no env vars available).
 */
export async function POST(req: Request) {
  const handler = createWebhookHandler();
  return handler(req);
}
