import { NextResponse } from "next/server";
import pdf from "pdf-parse";

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5 MB per file
const MAX_TOTAL_FILES = 10;
const ALLOWED_TYPES = new Set([
  "application/pdf",
  "text/plain",
  "text/csv",
  "text/html",
]);

async function extractFileText(file: File): Promise<string | NextResponse> {
  if (file.size > MAX_FILE_SIZE) {
    return NextResponse.json(
      { error: `Файл "${file.name}" слишком большой (макс. 5 МБ)` },
      { status: 400 },
    );
  }
  if (!ALLOWED_TYPES.has(file.type) && !file.name.endsWith(".pdf")) {
    return NextResponse.json(
      { error: `Неподдерживаемый формат: "${file.name}". Используйте PDF или текстовый файл` },
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

/**
 * Extract text from a form data submission.
 * Supports single "file", multiple "files", or plain "text".
 * Returns concatenated text or a NextResponse error.
 */
export async function extractTextFromFormData(
  formData: FormData,
): Promise<string | NextResponse> {
  const text = formData.get("text") as string | null;

  // Collect all files: supports both "file" (legacy single) and "files" (multi)
  const multiFiles = formData.getAll("files") as File[];
  const singleFile = formData.get("file") as File | null;
  const allFiles = multiFiles.length > 0 ? multiFiles : singleFile ? [singleFile] : [];

  if (allFiles.length > MAX_TOTAL_FILES) {
    return NextResponse.json(
      { error: `Максимум ${MAX_TOTAL_FILES} файлов за раз` },
      { status: 400 },
    );
  }

  if (allFiles.length > 0) {
    const parts: string[] = [];
    for (const file of allFiles) {
      const result = await extractFileText(file);
      if (result instanceof NextResponse) return result;
      const header = allFiles.length > 1 ? `=== ${file.name} ===\n` : "";
      parts.push(header + result);
    }
    return parts.join("\n\n");
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
