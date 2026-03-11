import { Context } from "grammy";
import { createLogger } from "@/lib/logger";
import { clientRepository, tripRepository } from "@/lib/db/repositories";
import { tripMessageService, summarizeTripForClient } from "@/lib/services/trip-message.service";

const log = createLogger("bot:commands");

/**
 * Helper: resolve the active trip for the current chat.
 */
async function resolveTrip(ctx: Context) {
  const chatId = ctx.chat?.id?.toString();
  if (!chatId) return null;

  const isGroup = ctx.chat?.type === "group" || ctx.chat?.type === "supergroup";
  const client = isGroup
    ? await clientRepository.findByTelegramGroupId(chatId)
    : await clientRepository.findByTelegramChatId(chatId);

  if (!client) {
    await ctx.reply(
      "🔗 I don't recognize you yet. Please use the link from your travel agency to connect.",
    );
    return null;
  }

  const trip = await tripRepository.findByClientId(client.id);
  if (!trip) {
    await ctx.reply("📭 No active trip found. Contact your travel agency.");
    return null;
  }

  return trip;
}

/**
 * /trip — Full trip summary using tripMessageService.
 */
export async function handleTripCommand(ctx: Context): Promise<void> {
  try {
    const trip = await resolveTrip(ctx);
    if (!trip) return;

    await ctx.replyWithChatAction("typing");
    const summarized = await summarizeTripForClient(trip);
    const parts = tripMessageService.formatFullSummary(summarized);
    for (const part of parts) {
      await ctx.reply(part, { parse_mode: "HTML" });
    }
  } catch (error) {
    log.error({ error }, "Failed /trip command");
    await ctx.reply("⚠️ Could not load trip info.");
  }
}

/**
 * /flight — Flight details.
 */
export async function handleFlightCommand(ctx: Context): Promise<void> {
  try {
    const trip = await resolveTrip(ctx);
    if (!trip) return;
    await ctx.reply(tripMessageService.formatFlights(trip), { parse_mode: "HTML" });
  } catch (error) {
    log.error({ error }, "Failed /flight command");
    await ctx.reply("⚠️ Could not load flight info.");
  }
}

/**
 * /hotel — Hotel info.
 */
export async function handleHotelCommand(ctx: Context): Promise<void> {
  try {
    const trip = await resolveTrip(ctx);
    if (!trip) return;
    await ctx.replyWithChatAction("typing");
    const summarized = await summarizeTripForClient(trip);
    await ctx.reply(tripMessageService.formatHotels(summarized), { parse_mode: "HTML" });
  } catch (error) {
    log.error({ error }, "Failed /hotel command");
    await ctx.reply("⚠️ Could not load hotel info.");
  }
}

/**
 * /guide — Guide contact.
 */
export async function handleGuideCommand(ctx: Context): Promise<void> {
  try {
    const trip = await resolveTrip(ctx);
    if (!trip) return;
    await ctx.reply(tripMessageService.formatGuides(trip), { parse_mode: "HTML" });
  } catch (error) {
    log.error({ error }, "Failed /guide command");
    await ctx.reply("⚠️ Could not load guide info.");
  }
}

/**
 * /docs — Trip documents summary (insurance + notes).
 */
export async function handleDocsCommand(ctx: Context): Promise<void> {
  try {
    const trip = await resolveTrip(ctx);
    if (!trip) return;
    await ctx.replyWithChatAction("typing");
    const summarized = await summarizeTripForClient(trip);
    await ctx.reply(tripMessageService.formatDocs(summarized), { parse_mode: "HTML" });
  } catch (error) {
    log.error({ error }, "Failed /docs command");
    await ctx.reply("⚠️ Could not load documents.");
  }
}
