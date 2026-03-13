import { GoogleGenAI } from "@google/genai";
import { createLogger } from "@/lib/logger";
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

// Lazy-init singleton — avoids import-time env validation
let _client: GoogleGenAI | null = null;
function getClient(): GoogleGenAI {
  if (!_client) {
    _client = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY! });
  }
  return _client;
}

const FLASH_MODEL = "gemini-2.0-flash";
const PRO_MODEL = "gemini-2.0-flash-lite";

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
      const tf = t as TransferItem & { type?: string; fromLocation?: string; toLocation?: string; date?: string; time?: string; price?: string };
      const typeLabel = tf.type === "rental" ? "Car Rental" : tf.type === "walking" ? "Walking" : "Transfer";
      const route = tf.fromLocation && tf.toLocation
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
  return `You are a friendly personal travel assistant for a tourist. You help answer questions about their upcoming trip. Be concise, helpful, and warm.

## Trip Information

${formatFlights(trip.flights)}
${formatHotels(trip.hotels)}
${formatGuides(trip.guides)}
${formatTransfers(trip.transfers)}
${formatInsurances(trip.insurances)}
- **Manager contact**: ${trip.managerPhone || "N/A"}

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
 * Convert chat history to Gemini content format.
 */
function buildContents(
  history: Message[],
  userMessage: string,
): Array<{ role: "user" | "model"; parts: Array<{ text: string }> }> {
  const sorted = [...history].reverse();

  const contents = sorted.map((m) => ({
    role: (m.role === "assistant" ? "model" : "user") as "user" | "model",
    parts: [{ text: m.content }],
  }));

  contents.push({ role: "user", parts: [{ text: userMessage }] });

  return contents;
}

/**
 * Generate an AI response to a tourist's question.
 * Uses Gemini 2.0 Flash (fast/cheap) by default, falls back to Flash-Lite.
 */
export async function generateResponse(
  trip: Trip,
  history: Message[],
  userMessage: string,
): Promise<string> {
  const client = getClient();
  const systemPrompt = buildSystemPrompt(trip);
  const contents = buildContents(history, userMessage);

  try {
    const response = await client.models.generateContent({
      model: FLASH_MODEL,
      config: {
        maxOutputTokens: 1024,
        systemInstruction: systemPrompt,
      },
      contents,
    });

    const text = response.text ?? "";

    log.debug(
      {
        model: FLASH_MODEL,
        inputTokens: response.usageMetadata?.promptTokenCount,
        outputTokens: response.usageMetadata?.candidatesTokenCount,
      },
      "AI response generated",
    );

    return text;
  } catch (error) {
    log.error({ error }, "AI generation failed, trying fallback model");

    try {
      const fallback = await client.models.generateContent({
        model: PRO_MODEL,
        config: {
          maxOutputTokens: 1024,
          systemInstruction: systemPrompt,
        },
        contents,
      });

      return fallback.text ?? "Sorry, I couldn't process your request.";
    } catch (fallbackError) {
      log.error({ fallbackError }, "Fallback model also failed");
      return trip.managerPhone
        ? `I'm having trouble right now. Please contact your manager: ${trip.managerPhone}`
        : "I'm having trouble right now. Please contact your travel manager.";
    }
  }
}
