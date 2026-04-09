import { Context, InputFile } from "grammy";
import { createLogger } from "@/lib/logger";
import {
  clientRepository,
  tripRepository,
  subscriberRepository,
  type Trip,
} from "@/lib/db/repositories";
import {
  tripMessageService,
  summarizeTripForClient,
  translateParts,
  translateMessage,
} from "@/lib/services/trip-message.service";
import {
  buildGoogleCalendarUrl,
  buildTripPdfFileName,
  generateTripPdf,
} from "@/lib/services/trip-export.service";
import type { FlightItem } from "@/lib/types/trip-sections";

const log = createLogger("bot:commands");

/**
 * Helper: resolve the active trip + language for the current chat.
 * First checks if this chatId belongs to a registered client (legacy flow).
 * Then falls back to checking trip_subscribers (multi-user flow).
 */
async function resolveTrip(
  ctx: Context,
): Promise<{ trip: Trip; language: string; travelerName?: string } | null> {
  const chatId = ctx.chat?.id?.toString();
  if (!chatId) return null;

  // 1) Try legacy client-based lookup
  const isGroup = ctx.chat?.type === "group" || ctx.chat?.type === "supergroup";
  const client = isGroup
    ? await clientRepository.findByTelegramGroupId(chatId)
    : await clientRepository.findByTelegramChatId(chatId);

  if (client) {
    const trip = await tripRepository.findByClientId(client.id);
    if (trip) {
      return {
        trip,
        language: client.language ?? "en",
        travelerName: client.name,
      };
    }
  }

  // 2) Fall back to subscriber lookup
  const subscriber = await subscriberRepository.findByChatId(chatId);
  if (subscriber) {
    const trip = await tripRepository.findById(subscriber.tripId);
    if (trip) {
      return {
        trip,
        language: subscriber.language ?? "en",
        travelerName: subscriber.name ?? undefined,
      };
    }
  }

  await ctx.reply(
    "🔗 I don't recognize you yet. Please use the link from your travel agency to connect.",
  );
  return null;
}

/**
 * /trip — Full trip summary using tripMessageService.
 * Heavy AI work fires in background so webhook returns 200 immediately.
 */
export async function handleTripCommand(ctx: Context): Promise<void> {
  try {
    const result = await resolveTrip(ctx);
    if (!result) return;
    const { trip, language } = result;

    await ctx.reply("⏳ Loading your trip summary...");

    void (async () => {
      try {
        const summarized = await summarizeTripForClient(trip);
        const parts = tripMessageService.formatFullSummary(summarized);
        const translated = await translateParts(parts, language);
        for (const part of translated) {
          await ctx.reply(part, { parse_mode: "HTML" });
        }
      } catch (error) {
        log.error({ error }, "Failed /trip background work");
        await ctx
          .reply("⚠️ Could not load trip info. Please try again.")
          .catch(() => {});
      }
    })();
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
    const result = await resolveTrip(ctx);
    if (!result) return;
    const { trip, language } = result;

    const text = tripMessageService.formatFlights(trip);
    const translated = await translateMessage(text, language);
    await ctx.reply(translated, { parse_mode: "HTML" });
  } catch (error) {
    log.error({ error }, "Failed /flight command");
    await ctx.reply("⚠️ Could not load flight info.");
  }
}

/**
 * /hotel — Hotel info (AI summarize + translate in background).
 */
export async function handleHotelCommand(ctx: Context): Promise<void> {
  try {
    const result = await resolveTrip(ctx);
    if (!result) return;
    const { trip, language } = result;

    await ctx.reply("⏳ Loading hotel details...");

    void (async () => {
      try {
        const summarized = await summarizeTripForClient(trip);
        const text = tripMessageService.formatHotels(summarized);
        const translated = await translateMessage(text, language);
        await ctx.reply(translated, { parse_mode: "HTML" });
      } catch (error) {
        log.error({ error }, "Failed /hotel background work");
        await ctx.reply("⚠️ Could not load hotel info.").catch(() => {});
      }
    })();
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
    const result = await resolveTrip(ctx);
    if (!result) return;
    const { trip, language } = result;

    const text = tripMessageService.formatGuides(trip);
    const translated = await translateMessage(text, language);
    await ctx.reply(translated, { parse_mode: "HTML" });
  } catch (error) {
    log.error({ error }, "Failed /guide command");
    await ctx.reply("⚠️ Could not load guide info.");
  }
}

/**
 * /docs — Trip documents summary (insurance + notes). AI work in background.
 */
export async function handleDocsCommand(ctx: Context): Promise<void> {
  try {
    const result = await resolveTrip(ctx);
    if (!result) return;
    const { trip, language, travelerName } = result;

    await ctx.reply("⏳ Loading documents...");

    void (async () => {
      try {
        const summarized = await summarizeTripForClient(trip);
        const text = tripMessageService.formatDocs(summarized);
        const translated = await translateMessage(text, language);
        await ctx.reply(translated, { parse_mode: "HTML" });

        const pdfBuffer = await generateTripPdf(summarized, travelerName);
        await ctx.replyWithDocument(
          new InputFile(
            pdfBuffer,
            buildTripPdfFileName(summarized, travelerName),
          ),
          {
            caption: "📄 PDF itinerary",
          },
        );

        await ctx.reply(
          `📅 Add this trip to Google Calendar:\n${buildGoogleCalendarUrl(summarized, travelerName)}`,
        );
      } catch (error) {
        log.error({ error }, "Failed /docs background work");
        await ctx.reply("⚠️ Could not load documents.").catch(() => {});
      }
    })();
  } catch (error) {
    log.error({ error }, "Failed /docs command");
    await ctx.reply("⚠️ Could not load documents.");
  }
}
