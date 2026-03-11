import { Bot, webhookCallback, InlineKeyboard } from "grammy";
import { createLogger } from "@/lib/logger";
import { handleStart } from "./handlers/start";
import { handleMessage } from "./handlers/message";
import { handleVoice } from "./handlers/voice";
import {
  handleTripCommand,
  handleFlightCommand,
  handleHotelCommand,
  handleGuideCommand,
  handleDocsCommand,
} from "./handlers/commands";
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
    _bot.command("trip", handleTripCommand);
    _bot.command("flight", handleFlightCommand);
    _bot.command("hotel", handleHotelCommand);
    _bot.command("guide", handleGuideCommand);
    _bot.command("docs", handleDocsCommand);
    _bot.command("help", async (ctx) => {
      const keyboard = new InlineKeyboard()
        .text("📋 Trip", "cmd_trip")
        .text("✈️ Flight", "cmd_flight")
        .row()
        .text("🏨 Hotel", "cmd_hotel")
        .text("🧑‍💼 Guide", "cmd_guide")
        .row()
        .text("📄 Docs", "cmd_docs");

      await ctx.reply(
        "🤖 I'm your Travel Assistant!\n\n" +
          "Just send me a message and I'll answer questions about your trip.\n\n" +
          "Commands:\n" +
          "/trip — trip summary\n" +
          "/flight — flight details\n" +
          "/hotel — hotel info\n" +
          "/guide — guide contact\n" +
          "/docs — trip documents\n" +
          "/help — this message\n\n" +
          "Or use the buttons below:",
        { reply_markup: keyboard },
      );
    });

    // ─── Inline button callbacks ────────────
    _bot.callbackQuery("cmd_trip", async (ctx) => {
      await ctx.answerCallbackQuery();
      await handleTripCommand(ctx);
    });
    _bot.callbackQuery("cmd_flight", async (ctx) => {
      await ctx.answerCallbackQuery();
      await handleFlightCommand(ctx);
    });
    _bot.callbackQuery("cmd_hotel", async (ctx) => {
      await ctx.answerCallbackQuery();
      await handleHotelCommand(ctx);
    });
    _bot.callbackQuery("cmd_guide", async (ctx) => {
      await ctx.answerCallbackQuery();
      await handleGuideCommand(ctx);
    });
    _bot.callbackQuery("cmd_docs", async (ctx) => {
      await ctx.answerCallbackQuery();
      await handleDocsCommand(ctx);
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
