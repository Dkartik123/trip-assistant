import { Context } from "grammy";
import { createLogger } from "@/lib/logger";
import { tripRepository, clientRepository } from "@/lib/db/repositories";
import { tripMessageService, summarizeTripForClient } from "@/lib/services/trip-message.service";

const log = createLogger("bot:start");

/**
 * Handle `/start TRIP_TOKEN` command.
 * Links the Telegram chat to the client/trip via permanent deep-link token.
 * Sends a beautifully formatted trip summary.
 */
export async function handleStart(ctx: Context): Promise<void> {
  const chatId = ctx.chat?.id?.toString();
  if (!chatId) return;

  // Extract token from `/start TOKEN`
  const text = ctx.message?.text ?? "";
  const token = text.split(" ")[1]?.trim();

  if (!token) {
    await ctx.reply(
      "👋 Welcome! Please use the link provided by your travel agency to connect.",
    );
    return;
  }

  try {
    // Find trip by invite token
    const trip = await tripRepository.findByInviteToken(token);
    if (!trip) {
      await ctx.reply(
        "❌ Invalid link. Please contact your travel agency for a new one.",
      );
      return;
    }

    // Find the client associated with this trip
    const client = await clientRepository.findById(trip.clientId);
    if (!client) {
      await ctx.reply("❌ Client not found. Please contact your travel agency.");
      return;
    }

    // Link Telegram chat to client (permanent binding)
    const isGroup = ctx.chat?.type === "group" || ctx.chat?.type === "supergroup";

    if (isGroup) {
      await clientRepository.linkTelegramGroup(client.id, chatId);
      log.info({ clientId: client.id, groupId: chatId }, "Group linked");
    } else {
      await clientRepository.linkTelegramChat(client.id, chatId);
      log.info({ clientId: client.id, chatId }, "Chat linked");
    }

    // Send welcome + full trip summary (AI-summarized verbose parts)
    const welcome = tripMessageService.formatWelcome(client.name);
    await ctx.reply(welcome, { parse_mode: "HTML" });

    const summarized = await summarizeTripForClient(trip);
    const summaryParts = tripMessageService.formatFullSummary(summarized);
    for (const part of summaryParts) {
      await ctx.reply(part, { parse_mode: "HTML" });
    }
  } catch (error) {
    log.error({ error, chatId, token }, "Failed to handle /start");
    await ctx.reply("⚠️ Something went wrong. Please try again later.");
  }
}
