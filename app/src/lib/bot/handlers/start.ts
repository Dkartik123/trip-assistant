import { Context } from "grammy";
import { createLogger } from "@/lib/logger";
import { tripRepository, clientRepository } from "@/lib/db/repositories";

const log = createLogger("bot:start");

/**
 * Handle `/start TRIP_TOKEN` command.
 * Links the Telegram chat to the client/trip via permanent deep-link token.
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

    // Send welcome message with trip summary
    const flightInfo = trip.flightNumber
      ? `✈️ ${trip.flightNumber}: ${trip.departureCity || "?"} → ${trip.arrivalCity || "?"}`
      : "";
    const dateInfo = trip.flightDate
      ? `📅 ${new Date(trip.flightDate).toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" })}`
      : "";
    const hotelInfo = trip.hotelName ? `🏨 ${trip.hotelName}` : "";

    const welcomeLines = [
      `👋 Hello, ${client.name}! I'm your travel assistant.`,
      "",
      flightInfo,
      dateInfo,
      hotelInfo,
      "",
      "Ask me anything about your trip! 🌍",
    ].filter(Boolean);

    await ctx.reply(welcomeLines.join("\n"));
  } catch (error) {
    log.error({ error, chatId, token }, "Failed to handle /start");
    await ctx.reply("⚠️ Something went wrong. Please try again later.");
  }
}
