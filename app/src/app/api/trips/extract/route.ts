import { NextRequest, NextResponse } from "next/server";
import { GoogleGenAI } from "@google/genai";
import { PDFParse } from "pdf-parse";
import { createLogger } from "@/lib/logger";
import { serverError } from "@/lib/api-error";

const log = createLogger("api:trips:extract");

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5 MB
const ALLOWED_TYPES = new Set([
  "application/pdf",
  "text/plain",
  "text/csv",
  "text/html",
]);

let _client: GoogleGenAI | null = null;
function getClient(): GoogleGenAI {
  if (!_client) {
    _client = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY! });
  }
  return _client;
}

const EXTRACTION_PROMPT = `You are a data extraction assistant for a travel agency.
Extract trip information from the provided text and return a JSON object with these arrays (use empty string for missing values):

{
  "flights": [
    {
      "flightDate": "YYYY-MM-DDTHH:mm" (local time, 24h) or "",
      "flightNumber": "string" or "",
      "departureCity": "string" or "",
      "departureAirport": "IATA code" or "",
      "arrivalCity": "string" or "",
      "arrivalAirport": "IATA code" or "",
      "arrivalDate": "YYYY-MM-DDTHH:mm" or "",
      "gate": "string" or ""
    }
  ],
  "hotels": [
    {
      "hotelName": "string" or "",
      "hotelAddress": "string" or "",
      "hotelPhone": "string" or "",
      "checkinTime": "HH:mm" or "",
      "checkoutTime": "HH:mm" or ""
    }
  ],
  "guides": [
    { "guideName": "string" or "", "guidePhone": "string" or "" }
  ],
  "transfers": [
    {
      "transferInfo": "string" or "",
      "transferDriverPhone": "string" or "",
      "transferMeetingPoint": "string" or ""
    }
  ],
  "insurances": [
    { "insuranceInfo": "string" or "", "insurancePhone": "string" or "" }
  ],
  "managerPhone": "string" or null,
  "notes": "any extra info not fitting above" or null
}

Rules:
- Return ONLY valid JSON, no markdown, no explanation.
- For airport codes, use 3-letter IATA codes (e.g., SVO, AYT, TLL).
- For phone numbers, keep the original format including country code.
- For dates, convert to YYYY-MM-DDTHH:mm format.
- If you find MULTIPLE flights, hotels, transfers, etc., include ALL of them as separate items in the array.
- Use empty string for missing fields within objects. Use null for missing top-level scalars.
- Omit entire array or use empty array if no items found for that category.`;

const CATEGORY_PROMPTS: Record<string, string> = {
  flight: `Extract FLIGHT information only. Return JSON:
{
  "flights": [
    {
      "flightDate": "YYYY-MM-DDTHH:mm" or "",
      "flightNumber": "string" or "",
      "departureCity": "string" or "",
      "departureAirport": "IATA code" or "",
      "arrivalCity": "string" or "",
      "arrivalAirport": "IATA code" or "",
      "arrivalDate": "YYYY-MM-DDTHH:mm" or "",
      "gate": "string" or ""
    }
  ]
}
Extract ALL flights found. Return ONLY valid JSON.`,
  hotel: `Extract HOTEL information only. Return JSON:
{
  "hotels": [
    {
      "hotelName": "string" or "",
      "hotelAddress": "string" or "",
      "hotelPhone": "string" or "",
      "checkinTime": "HH:mm" or "",
      "checkoutTime": "HH:mm" or ""
    }
  ]
}
Extract ALL hotels found. Return ONLY valid JSON.`,
  guide: `Extract GUIDE information only. Return JSON:
{
  "guides": [
    { "guideName": "string" or "", "guidePhone": "string" or "" }
  ]
}
Extract ALL guides found. Return ONLY valid JSON.`,
  transfer: `Extract TRANSFER information only. Return JSON:
{
  "transfers": [
    {
      "transferInfo": "string" or "",
      "transferDriverPhone": "string" or "",
      "transferMeetingPoint": "string" or ""
    }
  ]
}
Extract ALL transfers found. Return ONLY valid JSON.`,
  insurance: `Extract INSURANCE information only. Return JSON:
{
  "insurances": [
    { "insuranceInfo": "string" or "", "insurancePhone": "string" or "" }
  ]
}
Extract ALL insurances found. Return ONLY valid JSON.`,
};

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
    const file = formData.get("file") as File | null;
    const text = formData.get("text") as string | null;
    const category = formData.get("category") as string | null;

    let extractedText = "";

    if (file) {
      if (file.size > MAX_FILE_SIZE) {
        return NextResponse.json(
          { error: "Файл слишком большой (макс. 5 МБ)" },
          { status: 400 },
        );
      }

      if (!ALLOWED_TYPES.has(file.type) && !file.name.endsWith(".pdf")) {
        return NextResponse.json(
          {
            error:
              "Неподдерживаемый формат. Используйте PDF или текстовый файл",
          },
          { status: 400 },
        );
      }

      const buffer = Buffer.from(await file.arrayBuffer());

      if (file.type === "application/pdf" || file.name.endsWith(".pdf")) {
        const parser = new PDFParse({ data: new Uint8Array(buffer) });
        const result = await parser.getText();
        extractedText = result.text;
        await parser.destroy();
      } else {
        extractedText = buffer.toString("utf-8");
      }
    } else if (text && text.trim()) {
      extractedText = text.trim();
    } else {
      return NextResponse.json(
        { error: "Загрузите файл или введите текст" },
        { status: 400 },
      );
    }

    if (extractedText.length < 10) {
      return NextResponse.json(
        { error: "Слишком мало текста для анализа" },
        { status: 400 },
      );
    }

    // Truncate very long texts to stay within token limits
    const truncated = extractedText.slice(0, 15000);

    const prompt =
      (category && CATEGORY_PROMPTS[category]) || EXTRACTION_PROMPT;

    const client = getClient();
    const response = await client.models.generateContent({
      model: "gemini-2.0-flash",
      config: {
        maxOutputTokens: 1024,
        temperature: 0.1,
      },
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

    // Parse JSON from response (strip markdown fences if present)
    const jsonStr = raw
      .replace(/```json?\s*/gi, "")
      .replace(/```\s*/g, "")
      .trim();
    const parsed = JSON.parse(jsonStr);

    // Sanitize: build structured response with arrays
    const data: Record<string, unknown> = {};

    const arrayCategories = [
      "flights",
      "hotels",
      "guides",
      "transfers",
      "insurances",
    ] as const;
    for (const cat of arrayCategories) {
      if (Array.isArray(parsed[cat]) && parsed[cat].length > 0) {
        data[cat] = parsed[cat];
      }
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
