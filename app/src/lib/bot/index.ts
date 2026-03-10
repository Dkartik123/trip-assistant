import { Bot, webhookCallback, Context } from "grammy";
import { createLogger } from "@/lib/logger";
import { handleStart } from "./handlers/start";
import { handleMessage } from "./handlers/message";
import { handleVoice } from "./handlers/voice";
import { rateLimiter } from "./middleware/rate-limiter";

const log = createLogger("bot");

// Lazy-init singleton — avoids import-time env validation
let _bot: Bot | null = null;

export function getBot(): Bot {
  if (!_bot) {
    const token = process.env.TELEGRAM_BOT_TOKEN;
    if (!token) throw new Error("TELEGRAM_BOT_TOKEN is not set");

    _bot = new Bot(token);

    // ─── Middleware ──────────────────────────
    _bot.use(rateLimiter);

    // ─── Commands ───────────────────────────
    _bot.command("start", handleStart);
    _bot.command("trip", async (ctx) => {
      await ctx.reply("ℹ️ Use free text to ask about your trip!");
    });
    _bot.command("help", async (ctx) => {
      await ctx.reply(
        "🤖 I'm your Travel Assistant!\n\n" +
          "Just send me a message and I'll answer questions about your trip.\n\n" +
          "Commands:\n" +
          "/trip — trip summary\n" +
          "/flight — flight details\n" +
          "/hotel — hotel info\n" +
          "/guide — guide contact\n" +
          "/docs — trip documents\n" +
          "/help — this message",
      );
    });

    // ─── Voice messages ─────────────────────
    _bot.on("message:voice", handleVoice);

    // ─── Text messages (catch-all) ──────────
    _bot.on("message:text", handleMessage);

    // ─── Error handler ──────────────────────
    _bot.catch((err) => {
      log.error({ error: err.error, ctx: err.ctx?.update }, "Bot error");
    });

    log.info("Telegram bot initialized");
  }

  return _bot;
}

/**
 * Next.js webhook handler for `POST /api/webhook/telegram`.
 * grammY handles the Telegram update processing.
 */
export function createWebhookHandler() {
  const bot = getBot();
  return webhookCallback(bot, "std/http", {
    secretToken: process.env.TELEGRAM_WEBHOOK_SECRET,
  });
}
