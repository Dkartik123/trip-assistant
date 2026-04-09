import Anthropic from "@anthropic-ai/sdk";
import { createLogger } from "@/lib/logger";
import { getAnthropicClient } from "@/lib/ai/anthropic-client";
import type { Trip } from "@/lib/db/repositories";
import type { Message } from "@/lib/db/repositories";
import type {
  FlightItem,
  HotelItem,
  GuideItem,
  TransferItem,
  InsuranceItem,
} from "@/lib/types/trip-sections";

const log = createLogger("ai-service");

const MODEL = "claude-opus-4-6";
const MEMORY_MODEL = "claude-haiku-4-5-20251001";

function formatFlights(raw: unknown): string {
  const flights = (raw as FlightItem[] | null) ?? [];
  if (flights.length === 0) return "- **Flights/Trains**: N/A";
  return flights
    .map((f, i) => {
      const isTrain = (f as { type?: string }).type === "train";
      if (isTrain) {
        return `- **Train ${i + 1}**: #${(f as { trainNumber?: string }).trainNumber || "N/A"}\n  Route: ${f.departureCity || "?"} (${(f as { departureStation?: string }).departureStation || "?"}) → ${f.arrivalCity || "?"} (${(f as { arrivalStation?: string }).arrivalStation || "?"})\n  Departure: ${f.flightDate || "N/A"}, Arrival: ${f.arrivalDate || "N/A"}\n  Seat: ${(f as { seat?: string }).seat || "N/A"}, Class: ${(f as { carriageClass?: string }).carriageClass || "N/A"}`;
      }
      return `- **Flight ${i + 1}**: ${f.flightNumber || "N/A"}\n  Route: ${f.departureCity || "?"} (${f.departureAirport || "?"}) → ${f.arrivalCity || "?"} (${f.arrivalAirport || "?"})\n  Departure: ${f.flightDate || "N/A"}, Arrival: ${f.arrivalDate || "N/A"}, Gate: ${f.gate || "N/A"}`;
    })
    .join("\n");
}

function formatHotels(raw: unknown): string {
  const hotels = (raw as HotelItem[] | null) ?? [];
  if (hotels.length === 0) return "- **Hotels**: N/A";
  return hotels
    .map(
      (h, i) =>
        `- **Hotel ${i + 1}**: ${h.hotelName || "N/A"}, ${h.hotelAddress || "N/A"}, Phone: ${h.hotelPhone || "N/A"}\n  Check-in: ${h.checkinTime || "N/A"}, Check-out: ${h.checkoutTime || "N/A"}`,
    )
    .join("\n");
}

function formatGuides(raw: unknown): string {
  const guides = (raw as GuideItem[] | null) ?? [];
  if (guides.length === 0) return "- **Guides**: N/A";
  return guides
    .map(
      (g, i) =>
        `- **Guide ${i + 1}**: ${g.guideName || "N/A"}, Phone: ${g.guidePhone || "N/A"}`,
    )
    .join("\n");
}

function formatTransfers(raw: unknown): string {
  const transfers = (raw as TransferItem[] | null) ?? [];
  if (transfers.length === 0) return "- **Transfers**: N/A";
  return transfers
    .map((t, i) => {
      const tf = t as TransferItem & {
        type?: string;
        fromLocation?: string;
        toLocation?: string;
        date?: string;
        time?: string;
        price?: string;
      };
      const typeLabel =
        tf.type === "rental"
          ? "Car Rental"
          : tf.type === "walking"
            ? "Walking"
            : "Transfer";
      const route =
        tf.fromLocation && tf.toLocation
          ? `${tf.fromLocation} → ${tf.toLocation}`
          : tf.fromLocation || tf.toLocation || "N/A";
      return `- **${typeLabel} ${i + 1}**: ${tf.transferInfo || typeLabel}\n  Route: ${route}, Date: ${tf.date || "N/A"} ${tf.time || ""}\n  Driver: ${tf.transferDriverPhone || "N/A"}, Meeting: ${tf.transferMeetingPoint || "N/A"}, Price: ${tf.price || "N/A"}`;
    })
    .join("\n");
}

function formatInsurances(raw: unknown): string {
  const insurances = (raw as InsuranceItem[] | null) ?? [];
  if (insurances.length === 0) return "- **Insurance**: N/A";
  return insurances
    .map(
      (ins, i) =>
        `- **Insurance ${i + 1}**: ${ins.insuranceInfo || "N/A"}, Phone: ${ins.insurancePhone || "N/A"}`,
    )
    .join("\n");
}

/**
 * Build a system prompt with trip context.
 */
function buildSystemPrompt(trip: Trip): string {
  const memorySection = trip.clientMemory
    ? `\n## What the client has shared\n${trip.clientMemory}\n`
    : "";

  const now = new Date();
  const currentDate = now.toLocaleDateString("en-GB", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return `You are a friendly personal travel assistant for a tourist. You help answer questions about their upcoming trip. Be concise, helpful, and warm.

## Current date
Today is ${currentDate}. Use this to answer questions like "what's today's date", "how many days until my trip", "is my flight tomorrow", etc.

## Trip Information

${formatFlights(trip.flights)}
${formatHotels(trip.hotels)}
${formatGuides(trip.guides)}
${formatTransfers(trip.transfers)}
${formatInsurances(trip.insurances)}
- **Manager contact**: ${trip.managerPhone || "N/A"}
${memorySection}
## Rules

1. Answer ONLY about this trip and general travel advice.
2. Detect the language of the user's message and reply in the SAME language.
3. If you don't know something about the trip (field is "N/A"), say so and suggest contacting the manager: ${trip.managerPhone || "your travel manager"}.
4. For emergencies (lost passport, illness, missed flight), provide practical advice AND the manager's phone number.
5. Be concise — tourists are often in a hurry.
6. Never invent flight times, hotel addresses, or other factual trip data.
7. Whenever you mention ANY physical location — hotel name, address, airport, station, attraction, meeting point, city landmark — ALWAYS wrap it in a clickable Google Maps link using Telegram HTML format: <a href="https://www.google.com/maps/search/?api=1&query=URL_ENCODED_LOCATION">Display Name</a>. Replace spaces with + in the query. Example: <a href="https://www.google.com/maps/search/?api=1&query=Rixos+Premium+Antalya">Rixos Premium Antalya</a>. Do NOT use markdown formatting — use HTML only.`;
}

/**
 * Extract and update client memory from a new message using Claude Haiku.
 * Returns updated memory string or null if nothing worth saving.
 */
export async function extractAndUpdateMemory(
  existingMemory: string | null,
  userMessage: string,
): Promise<string | null> {
  const client = getAnthropicClient();

  const system = `You are a memory manager for a travel assistant. Your job is to extract and remember useful facts that the client shares about themselves, their preferences, plans, or needs.

Extract ONLY genuinely useful facts: preferences (food, seats, transport), personal plans, health/accessibility needs, travel companions, extra destinations, budget hints, specific questions they keep asking about.

Do NOT store: greetings, questions about trip data that's already in the system, generic chitchat.

Return a concise bullet list (• fact). If nothing new or useful, return the existing memory unchanged.
Return ONLY the bullet list, no explanations.`;

  const userPrompt = `Existing memory:
${existingMemory || "(empty)"}

New client message:
"${userMessage}"

Return updated memory bullet list:`;

  try {
    const response = await client.messages.create({
      model: MEMORY_MODEL,
      max_tokens: 512,
      system,
      messages: [{ role: "user", content: userPrompt }],
    });

    const text =
      response.content[0]?.type === "text"
        ? response.content[0].text.trim()
        : null;

    // If response is empty or same as existing, return null (no update needed)
    if (!text || text === (existingMemory || "(empty)")) return null;
    return text;
  } catch (error) {
    log.warn({ error }, "Memory extraction failed, skipping");
    return null;
  }
}

/**
 * Convert chat history to Anthropic messages format.
 */
function buildMessages(
  history: Message[],
  userMessage: string,
): Anthropic.MessageParam[] {
  const sorted = [...history].reverse();

  const messages: Anthropic.MessageParam[] = sorted.map((m) => ({
    role: m.role === "assistant" ? "assistant" : "user",
    content: m.content,
  }));

  messages.push({ role: "user", content: userMessage });

  return messages;
}

/**
 * Generate an AI response to a tourist's question using Claude Opus 4.6.
 */
export async function generateResponse(
  trip: Trip,
  history: Message[],
  userMessage: string,
): Promise<string> {
  const client = getAnthropicClient();
  const systemPrompt = buildSystemPrompt(trip);
  const messages = buildMessages(history, userMessage);

  try {
    const response = await client.messages.create({
      model: MODEL,
      max_tokens: 1024,
      system: systemPrompt,
      messages,
    });

    const text =
      response.content[0]?.type === "text" ? response.content[0].text : "";

    log.debug(
      {
        model: MODEL,
        inputTokens: response.usage.input_tokens,
        outputTokens: response.usage.output_tokens,
      },
      "AI response generated",
    );

    return text;
  } catch (error) {
    log.error({ error }, "AI generation failed");
    return trip.managerPhone
      ? `I'm having trouble right now. Please contact your manager: ${trip.managerPhone}`
      : "I'm having trouble right now. Please contact your travel manager.";
  }
}
