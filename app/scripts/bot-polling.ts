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
import {
  handleSupportCommand,
  handleAiCommand,
  handleSupportMessage,
  isInSupportMode,
} from "@/lib/bot/handlers/support";
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
bot.command("support", handleSupportCommand);
bot.command("ai", handleAiCommand);
bot.command("help", async (ctx) => {
  const keyboard = new InlineKeyboard()
    .text("📋 Trip", "cmd_trip")
    .text("✈️ Flight", "cmd_flight")
    .row()
    .text("🏨 Hotel", "cmd_hotel")
    .text("🧑‍💼 Guide", "cmd_guide")
    .row()
    .text("📄 Docs", "cmd_docs")
    .text("👤 Support", "cmd_support");

  await ctx.reply(
    "🤖 I'm your Travel Assistant!\n\n" +
      "Just send me a message and I'll answer questions about your trip.\n\n" +
      "Commands:\n" +
      "/trip — trip summary\n" +
      "/flight — flight details\n" +
      "/hotel — hotel info\n" +
      "/guide — guide contact\n" +
      "/docs — trip documents\n" +
      "/support — talk to operator\n" +
      "/ai — return to AI assistant\n" +
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
bot.callbackQuery("cmd_support", async (ctx) => {
  await ctx.answerCallbackQuery();
  await handleSupportCommand(ctx);
});

// ─── Voice messages ─────────────────────
bot.on("message:voice", handleVoice);

// ─── Text messages (catch-all) ──────────
// If user is in support mode, save message for operator instead of AI reply
bot.on("message:text", async (ctx) => {
  const chatId = ctx.chat?.id?.toString();
  if (chatId && isInSupportMode(chatId)) {
    const text = ctx.message?.text ?? "";
    if (!text.startsWith("/")) {
      await handleSupportMessage(ctx);
    }
    return;
  }
  await handleMessage(ctx);
});

// ─── Error handler ──────────────────────
bot.catch((err) => {
  console.error("Bot error:", err.error);
});

// ─── Delete existing webhook & start polling ──────

async function main() {
  console.log("🔄 Deleting webhook (if any) to enable polling…");
  await bot.api.deleteWebhook({ drop_pending_updates: true });

  // ─── Set Telegram command menu ────────
  await bot.api.setMyCommands([
    { command: "trip", description: "📋 Trip summary" },
    { command: "flight", description: "✈️ Flight details" },
    { command: "hotel", description: "🏨 Hotel info" },
    { command: "guide", description: "🧑‍💼 Guide contact" },
    { command: "docs", description: "📄 Trip documents" },
    { command: "support", description: "👤 Talk to operator" },
    { command: "ai", description: "🤖 Return to AI assistant" },
    { command: "help", description: "❓ Show all commands" },
  ]);
  console.log("📋 Telegram command menu set");

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
