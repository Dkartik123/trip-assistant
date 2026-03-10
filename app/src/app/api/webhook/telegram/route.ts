import { createWebhookHandler } from "@/lib/bot";

/**
 * POST /api/webhook/telegram
 * Receives Telegram updates via webhook.
 * grammY processes the update and calls the appropriate handler.
 */
export const POST = createWebhookHandler();
