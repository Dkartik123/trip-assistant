/**
 * Local development: run the Telegram bot in long-polling mode.
 *
 * Usage:  npm run bot:dev
 *         (or: npx tsx -r tsconfig-paths/register scripts/bot-polling.ts)
 *
 * This avoids the need for an ngrok tunnel —
 * Telegram pushes are replaced by the bot actively pulling updates.
 */

import "dotenv/config";
import "tsconfig-paths/register";
import { Bot, InlineKeyboard } from "grammy";
import { handleStart } from "@/lib/bot/handlers/start";
import { handleMessage } from "@/lib/bot/handlers/message";
import { handleVoice } from "@/lib/bot/handlers/voice";
import {
  handleTripCommand,
  handleFlightCommand,
  handleHotelCommand,
  handleGuideCommand,
  handleDocsCommand,
} from "@/lib/bot/handlers/commands";
import { rateLimiter } from "@/lib/bot/middleware/rate-limiter";

const token = process.env.TELEGRAM_BOT_TOKEN;
if (!token) {
  console.error("❌ TELEGRAM_BOT_TOKEN is not set in .env");
  process.exit(1);
}

console.log("🤖 Starting bot in polling mode…");
console.log(`   Token: ${token.slice(0, 8)}…${token.slice(-4)}`);

const bot = new Bot(token);

// ─── Middleware ──────────────────────────
bot.use(rateLimiter);

// ─── Commands ───────────────────────────
bot.command("start", handleStart);
bot.command("trip", handleTripCommand);
bot.command("flight", handleFlightCommand);
bot.command("hotel", handleHotelCommand);
bot.command("guide", handleGuideCommand);
bot.command("docs", handleDocsCommand);
bot.command("help", async (ctx) => {
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
bot.callbackQuery("cmd_trip", async (ctx) => {
  await ctx.answerCallbackQuery();
  await handleTripCommand(ctx);
});
bot.callbackQuery("cmd_flight", async (ctx) => {
  await ctx.answerCallbackQuery();
  await handleFlightCommand(ctx);
});
bot.callbackQuery("cmd_hotel", async (ctx) => {
  await ctx.answerCallbackQuery();
  await handleHotelCommand(ctx);
});
bot.callbackQuery("cmd_guide", async (ctx) => {
  await ctx.answerCallbackQuery();
  await handleGuideCommand(ctx);
});
bot.callbackQuery("cmd_docs", async (ctx) => {
  await ctx.answerCallbackQuery();
  await handleDocsCommand(ctx);
});

// ─── Voice messages ─────────────────────
bot.on("message:voice", handleVoice);

// ─── Text messages (catch-all) ──────────
bot.on("message:text", handleMessage);

// ─── Error handler ──────────────────────
bot.catch((err) => {
  console.error("Bot error:", err.error);
});

// ─── Delete existing webhook & start polling ──────

async function main() {
  console.log("🔄 Deleting webhook (if any) to enable polling…");
  await bot.api.deleteWebhook({ drop_pending_updates: true });

  console.log("✅ Bot is running in polling mode. Press Ctrl+C to stop.");
  await bot.start({
    onStart: (info) => {
      console.log(`🤖 @${info.username} is online (polling)`);
    },
  });
}

main().catch((err) => {
  console.error("❌ Failed to start bot:", err);
  process.exit(1);
});
