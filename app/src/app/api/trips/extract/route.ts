import { NextRequest, NextResponse } from "next/server";
import { createLogger } from "@/lib/logger";
import { serverError } from "@/lib/api-error";
import { getGeminiClient } from "@/lib/ai/gemini-client";
import {
  extractTextFromFormData,
  parseAiJsonResponse,
} from "@/lib/ai/extract-text";
import {
  TRIP_EXTRACTION_PROMPT,
  TRIP_CATEGORY_PROMPTS,
} from "@/lib/prompts/trip-extraction";

const log = createLogger("api:trips:extract");

/**
 * POST /api/trips/extract
 * Accepts multipart form data with either:
 *   - "file" (PDF or text file)
 *   - "text" (plain text)
 * Returns extracted trip fields via Gemini AI.
 */
export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const category = formData.get("category") as string | null;

    const result = await extractTextFromFormData(formData);
    if (result instanceof NextResponse) return result;
    const extractedText = result;

    if (extractedText.length < 10) {
      return NextResponse.json(
        { error: "Слишком мало текста для анализа" },
        { status: 400 },
      );
    }

    const truncated = extractedText.slice(0, 15000);
    const prompt =
      (category && TRIP_CATEGORY_PROMPTS[category]) || TRIP_EXTRACTION_PROMPT;

    const client = getGeminiClient();
    const response = await client.models.generateContent({
      model: "gemini-2.0-flash",
      config: { maxOutputTokens: 4096, temperature: 0.1 },
      contents: [
        {
          role: "user",
          parts: [
            { text: prompt },
            { text: `\n\nText to extract from:\n\n${truncated}` },
          ],
        },
      ],
    });

    const raw = response.text ?? "";
    log.info(
      {
        inputLen: truncated.length,
        tokens: response.usageMetadata?.promptTokenCount,
      },
      "AI extraction completed",
    );

    const parsed = parseAiJsonResponse(raw) as Record<string, unknown>;

    // Sanitize: build structured response with arrays
    const data: Record<string, unknown> = {};
    const arrayCategories = [
      "flights",
      "hotels",
      "guides",
      "transfers",
      "insurances",
      "attractions",
      "clients",
    ] as const;

    for (const cat of arrayCategories) {
      if (Array.isArray(parsed[cat]) && parsed[cat].length > 0) {
        data[cat] = parsed[cat];
      }
    }

    // Normalize legacy propertyMessage → propertyMessages[]
    if (Array.isArray(data.hotels)) {
      data.hotels = (data.hotels as Record<string, unknown>[]).map((h) => {
        if (typeof h.propertyMessage === "string" && h.propertyMessage) {
          h.propertyMessages = [
            ...((h.propertyMessages as string[]) ?? []),
            h.propertyMessage,
          ];
          delete h.propertyMessage;
        }
        return h;
      });
    }

    if (parsed.managerPhone && typeof parsed.managerPhone === "string") {
      data.managerPhone = parsed.managerPhone.trim();
    }
    if (parsed.notes && typeof parsed.notes === "string") {
      data.notes = parsed.notes.trim();
    }

    return NextResponse.json({ data });
  } catch (error) {
    log.error({ error }, "Failed to extract trip data");

    if (error instanceof SyntaxError) {
      return NextResponse.json(
        { error: "AI не смог распознать данные. Попробуйте другой формат" },
        { status: 422 },
      );
    }

    return serverError();
  }
}
