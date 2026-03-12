import { Context } from "grammy";
import { createLogger } from "@/lib/logger";
import { tripRepository, clientRepository, subscriberRepository } from "@/lib/db/repositories";
import { tripMessageService, summarizeTripForClient, translateParts, translateMessage } from "@/lib/services/trip-message.service";

const log = createLogger("bot:start");

/**
 * Build a display name from Telegram context.
 */
function getTelegramName(ctx: Context): string {
  const from = ctx.from;
  if (!from) return "Unknown";
  const parts = [from.first_name, from.last_name].filter(Boolean);
  return parts.join(" ") || from.username || "Unknown";
}

/**
 * Handle `/start TRIP_TOKEN` command.
 * Links the Telegram chat to the client/trip via permanent deep-link token.
 * Also adds the user as a trip subscriber so multiple people can follow one trip.
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

    // Link Telegram chat to primary client (backward-compat — only if this is the primary client's chat)
    const isGroup = ctx.chat?.type === "group" || ctx.chat?.type === "supergroup";
    const isPrimaryClient = !client.telegramChatId && !client.telegramGroupId;

    if (isPrimaryClient) {
      if (isGroup) {
        await clientRepository.linkTelegramGroup(client.id, chatId);
        log.info({ clientId: client.id, groupId: chatId }, "Group linked");
      } else {
        await clientRepository.linkTelegramChat(client.id, chatId);
        log.info({ clientId: client.id, chatId }, "Chat linked");
      }
    }

    // Add this user as a trip subscriber (idempotent)
    const subscriberName = getTelegramName(ctx);
    const subscriber = await subscriberRepository.subscribe({
      tripId: trip.id,
      telegramChatId: chatId,
      name: subscriberName,
      language: client.language ?? "en",
    });

    const isNewSubscriber = new Date().getTime() - new Date(subscriber.joinedAt).getTime() < 5000;
    log.info(
      { tripId: trip.id, chatId, name: subscriberName, isNew: isNewSubscriber },
      isNewSubscriber ? "New subscriber joined trip" : "Existing subscriber reconnected",
    );

    // Send welcome + full trip summary (AI-summarized verbose parts)
    const lang = subscriber.language ?? client.language;
    const welcome = tripMessageService.formatWelcome(client.name);
    const translatedWelcome = await translateMessage(welcome, lang);
    await ctx.reply(translatedWelcome, { parse_mode: "HTML" });

    const summarized = await summarizeTripForClient(trip);
    const summaryParts = tripMessageService.formatFullSummary(summarized);
    const translatedParts = await translateParts(summaryParts, lang);
    for (const part of translatedParts) {
      await ctx.reply(part, { parse_mode: "HTML" });
    }
  } catch (error) {
    log.error({ error, chatId, token }, "Failed to handle /start");
    await ctx.reply("⚠️ Something went wrong. Please try again later.");
  }
}
