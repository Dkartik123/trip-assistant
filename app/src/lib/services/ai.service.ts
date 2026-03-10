import Anthropic from "@anthropic-ai/sdk";
import { createLogger } from "@/lib/logger";
import type { Trip } from "@/lib/db/repositories";
import type { Message } from "@/lib/db/repositories";

const log = createLogger("ai-service");

// Lazy-init singleton — avoids import-time env validation
let _client: Anthropic | null = null;
function getClient(): Anthropic {
  if (!_client) {
    _client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY! });
  }
  return _client;
}

const HAIKU_MODEL = "claude-haiku-4-5-20251001";
const SONNET_MODEL = "claude-sonnet-4-6-20250516";

/**
 * Build a system prompt with trip context.
 */
function buildSystemPrompt(trip: Trip): string {
  return `You are a friendly personal travel assistant for a tourist. You help answer questions about their upcoming trip. Be concise, helpful, and warm.

## Trip Information

- **Flight**: ${trip.flightNumber || "N/A"} on ${trip.flightDate ? new Date(trip.flightDate).toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" }) : "N/A"}
- **Route**: ${trip.departureCity || "?"} (${trip.departureAirport || "?"}) → ${trip.arrivalCity || "?"} (${trip.arrivalAirport || "?"})
- **Gate**: ${trip.gate || "Not assigned yet"}
- **Hotel**: ${trip.hotelName || "N/A"}, ${trip.hotelAddress || "N/A"}, Phone: ${trip.hotelPhone || "N/A"}
- **Check-in**: ${trip.checkinTime || "N/A"}, Check-out: ${trip.checkoutTime || "N/A"}
- **Guide**: ${trip.guideName || "N/A"}, Phone: ${trip.guidePhone || "N/A"}
- **Transfer**: ${trip.transferInfo || "N/A"}, Driver: ${trip.transferDriverPhone || "N/A"}, Meeting: ${trip.transferMeetingPoint || "N/A"}
- **Insurance**: ${trip.insuranceInfo || "N/A"}, Phone: ${trip.insurancePhone || "N/A"}
- **Manager contact**: ${trip.managerPhone || "N/A"}

## Rules

1. Answer ONLY about this trip and general travel advice.
2. Detect the language of the user's message and reply in the SAME language.
3. If you don't know something about the trip (field is "N/A"), say so and suggest contacting the manager: ${trip.managerPhone || "your travel manager"}.
4. For emergencies (lost passport, illness, missed flight), provide practical advice AND the manager's phone number.
5. Be concise — tourists are often in a hurry.
6. Never invent flight times, hotel addresses, or other factual trip data.`;
}

/**
 * Convert chat history to Anthropic message format.
 */
function buildMessages(
  history: Message[],
  userMessage: string,
): Anthropic.MessageParam[] {
  // history is newest-first from DB, reverse for chronological order
  const sorted = [...history].reverse();

  const msgs: Anthropic.MessageParam[] = sorted.map((m) => ({
    role: m.role as "user" | "assistant",
    content: m.content,
  }));

  msgs.push({ role: "user", content: userMessage });

  return msgs;
}

/**
 * Generate an AI response to a tourist's question.
 * Uses Haiku (fast/cheap) by default, falls back to Sonnet for complex questions.
 */
export async function generateResponse(
  trip: Trip,
  history: Message[],
  userMessage: string,
): Promise<string> {
  const client = getClient();
  const systemPrompt = buildSystemPrompt(trip);
  const messages = buildMessages(history, userMessage);

  try {
    const response = await client.messages.create({
      model: HAIKU_MODEL,
      max_tokens: 1024,
      system: systemPrompt,
      messages,
    });

    const text =
      response.content[0].type === "text" ? response.content[0].text : "";

    log.debug(
      {
        model: HAIKU_MODEL,
        inputTokens: response.usage.input_tokens,
        outputTokens: response.usage.output_tokens,
      },
      "AI response generated",
    );

    return text;
  } catch (error) {
    log.error({ error }, "AI generation failed, trying Sonnet fallback");

    try {
      const fallback = await client.messages.create({
        model: SONNET_MODEL,
        max_tokens: 1024,
        system: systemPrompt,
        messages,
      });

      return fallback.content[0].type === "text"
        ? fallback.content[0].text
        : "Sorry, I couldn't process your request.";
    } catch (fallbackError) {
      log.error({ fallbackError }, "Sonnet fallback also failed");
      return trip.managerPhone
        ? `I'm having trouble right now. Please contact your manager: ${trip.managerPhone}`
        : "I'm having trouble right now. Please contact your travel manager.";
    }
  }
}
