import { NextResponse } from "next/server";
import pdf from "pdf-parse";

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5 MB
const ALLOWED_TYPES = new Set([
  "application/pdf",
  "text/plain",
  "text/csv",
  "text/html",
]);

/**
 * Extract text from a form data submission (file or text field).
 * Returns the extracted text or a NextResponse error.
 */
export async function extractTextFromFormData(
  formData: FormData,
): Promise<string | NextResponse> {
  const file = formData.get("file") as File | null;
  const text = formData.get("text") as string | null;

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
      const result = await pdf(buffer);
      return result.text;
    }

    return buffer.toString("utf-8");
  }

  if (text && text.trim()) {
    return text.trim();
  }

  return NextResponse.json(
    { error: "Загрузите файл или введите текст" },
    { status: 400 },
  );
}

/**
 * Parse a JSON response from AI, stripping markdown fences.
 */
export function parseAiJsonResponse(raw: string): unknown {
  const jsonStr = raw
    .replace(/```json?\s*/gi, "")
    .replace(/```\s*/g, "")
    .trim();
  return JSON.parse(jsonStr);
}
