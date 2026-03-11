import type { NoteItem } from "@/lib/types/trip-sections";

/**
 * Parse notes from a raw JSON string or plain text string.
 */
export function parseNotes(raw: string): NoteItem[] {
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed)) return parsed;
  } catch {
    if (raw.trim()) return [{ title: "", text: raw }];
  }
  return [];
}

/**
 * Serialize notes to a JSON string, filtering out empty items.
 */
export function serializeNotes(notes: NoteItem[]): string {
  const filtered = notes.filter((n) => n.title.trim() || n.text.trim());
  if (filtered.length === 0) return "";
  return JSON.stringify(filtered);
}
