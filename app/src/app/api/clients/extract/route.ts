import { NextRequest, NextResponse } from "next/server";
import { createLogger } from "@/lib/logger";
import { serverError } from "@/lib/api-error";
import { getGeminiClient } from "@/lib/ai/gemini-client";
import {
  extractTextFromFormData,
  parseAiJsonResponse,
} from "@/lib/ai/extract-text";
import {
  CLIENT_EXTRACTION_PROMPT,
  CLIENT_ALLOWED_FIELDS,
} from "@/lib/prompts/client-extraction";

const log = createLogger("api:clients:extract");

function sanitizeClient(raw: Record<string, unknown>): Record<string, string> {
  const clean: Record<string, string> = {};
  for (const field of CLIENT_ALLOWED_FIELDS) {
    const val = raw[field];
    if (val != null && typeof val === "string" && val.trim() !== "") {
      clean[field] = val.trim();
    }
  }
  return clean;
}

/**
 * POST /api/clients/extract
 * Accepts multipart form data with either:
 *   - "file" (PDF or text file)
 *   - "text" (plain text)
 * Returns extracted client fields via Gemini AI.
 */
export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();

    const result = await extractTextFromFormData(formData);
    if (result instanceof NextResponse) return result;
    const extractedText = result;

    if (extractedText.length < 5) {
      return NextResponse.json(
        { error: "Слишком мало текста для анализа" },
        { status: 400 },
      );
    }

    const truncated = extractedText.slice(0, 15000);

    const client = getGeminiClient();
    const response = await client.models.generateContent({
      model: "gemini-2.0-flash",
      config: { maxOutputTokens: 2048, temperature: 0.1 },
      contents: [
        {
          role: "user",
          parts: [
            { text: CLIENT_EXTRACTION_PROMPT },
            { text: `\n\nText to extract client info from:\n\n${truncated}` },
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
      "AI client extraction completed",
    );

    const parsed = parseAiJsonResponse(raw) as Record<string, unknown>;

    // Handle both { clients: [...] } and flat { name, phone, ... } formats
    let clientsRaw: Record<string, unknown>[] = [];
    if (Array.isArray(parsed.clients) && parsed.clients.length > 0) {
      clientsRaw = parsed.clients;
    } else if (
      parsed.name ||
      parsed.firstName ||
      parsed.email ||
      parsed.phone
    ) {
      clientsRaw = [parsed];
    }

    const clients = clientsRaw
      .map(sanitizeClient)
      .filter((c) => Object.keys(c).length > 0);

    if (clients.length === 1) {
      return NextResponse.json({ data: clients[0], clients });
    }

    return NextResponse.json({ data: clients[0] ?? {}, clients });
  } catch (error) {
    log.error({ error }, "Failed to extract client data");

    if (error instanceof SyntaxError) {
      return NextResponse.json(
        { error: "AI не смог распознать данные. Попробуйте другой формат" },
        { status: 422 },
      );
    }

    return serverError();
  }
}
