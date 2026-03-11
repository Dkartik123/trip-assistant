import { Context } from "grammy";
import { createLogger } from "@/lib/logger";
import { clientRepository, tripRepository } from "@/lib/db/repositories";

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

function formatDate(date: Date | string | null | undefined): string {
  if (!date) return "N/A";
  return new Date(date).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

/**
 * /trip — Full trip summary.
 */
export async function handleTripCommand(ctx: Context): Promise<void> {
  try {
    const trip = await resolveTrip(ctx);
    if (!trip) return;

    const lines = [
      "📋 *Trip Summary*\n",
      `✈️ *Flight*: ${trip.flightNumber || "N/A"}`,
      `📅 *Date*: ${formatDate(trip.flightDate)}`,
      `🛫 *From*: ${trip.departureCity || "?"} (${trip.departureAirport || "?"})`,
      `🛬 *To*: ${trip.arrivalCity || "?"} (${trip.arrivalAirport || "?"})`,
      `🚪 *Gate*: ${trip.gate || "Not assigned"}`,
      "",
      `🏨 *Hotel*: ${trip.hotelName || "N/A"}`,
      `📍 *Address*: ${trip.hotelAddress || "N/A"}`,
      `⏰ *Check-in*: ${trip.checkinTime || "N/A"} / *Check-out*: ${trip.checkoutTime || "N/A"}`,
      "",
      `🧑‍💼 *Guide*: ${trip.guideName || "N/A"} — ${trip.guidePhone || "N/A"}`,
      `🚐 *Transfer*: ${trip.transferInfo || "N/A"}`,
      `🛡️ *Insurance*: ${trip.insuranceInfo || "N/A"} — ${trip.insurancePhone || "N/A"}`,
      "",
      `📞 *Manager*: ${trip.managerPhone || "N/A"}`,
    ];

    await ctx.reply(lines.join("\n"), { parse_mode: "Markdown" });
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

    if (!trip.flightNumber) {
      await ctx.reply("✈️ No flight details available yet.");
      return;
    }

    const lines = [
      "✈️ *Flight Details*\n",
      `*Flight*: ${trip.flightNumber}`,
      `*Date*: ${formatDate(trip.flightDate)}`,
      `*From*: ${trip.departureCity || "?"} (${trip.departureAirport || "?"})`,
      `*To*: ${trip.arrivalCity || "?"} (${trip.arrivalAirport || "?"})`,
      `*Gate*: ${trip.gate || "Not assigned yet"}`,
    ];

    await ctx.reply(lines.join("\n"), { parse_mode: "Markdown" });
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

    if (!trip.hotelName) {
      await ctx.reply("🏨 No hotel details available yet.");
      return;
    }

    const lines = [
      "🏨 *Hotel Details*\n",
      `*Name*: ${trip.hotelName}`,
      `*Address*: ${trip.hotelAddress || "N/A"}`,
      `*Phone*: ${trip.hotelPhone || "N/A"}`,
      `*Check-in*: ${trip.checkinTime || "N/A"}`,
      `*Check-out*: ${trip.checkoutTime || "N/A"}`,
    ];

    await ctx.reply(lines.join("\n"), { parse_mode: "Markdown" });
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

    if (!trip.guideName) {
      await ctx.reply("🧑‍💼 No guide assigned to this trip yet.");
      return;
    }

    const lines = [
      "🧑‍💼 *Your Guide*\n",
      `*Name*: ${trip.guideName}`,
      `*Phone*: ${trip.guidePhone || "N/A"}`,
    ];

    await ctx.reply(lines.join("\n"), { parse_mode: "Markdown" });
  } catch (error) {
    log.error({ error }, "Failed /guide command");
    await ctx.reply("⚠️ Could not load guide info.");
  }
}

/**
 * /docs — Trip documents summary (notes + key info).
 */
export async function handleDocsCommand(ctx: Context): Promise<void> {
  try {
    const trip = await resolveTrip(ctx);
    if (!trip) return;

    const lines = [
      "📄 *Trip Documents & Notes*\n",
      `*Insurance*: ${trip.insuranceInfo || "N/A"}`,
      `*Insurance Phone*: ${trip.insurancePhone || "N/A"}`,
      `*Transfer Info*: ${trip.transferInfo || "N/A"}`,
      `*Driver Phone*: ${trip.transferDriverPhone || "N/A"}`,
      `*Meeting Point*: ${trip.transferMeetingPoint || "N/A"}`,
    ];

    if (trip.notes) {
      lines.push("", `📝 *Notes*:\n${trip.notes}`);
    }

    await ctx.reply(lines.join("\n"), { parse_mode: "Markdown" });
  } catch (error) {
    log.error({ error }, "Failed /docs command");
    await ctx.reply("⚠️ Could not load documents.");
  }
}
