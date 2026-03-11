import type { Trip } from "@/lib/db/repositories";
import type {
  FlightItem,
  HotelItem,
  GuideItem,
  TransferItem,
  InsuranceItem,
  AttractionItem,
  PassengerItem,
} from "@/lib/types/trip-sections";
import { getGeminiClient } from "@/lib/ai/gemini-client";
import { createLogger } from "@/lib/logger";

const log = createLogger("trip-message");

// ─── HTML helpers (Telegram HTML parse mode) ─────────────

/** Escape HTML special characters for Telegram */
function esc(text: string): string {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

/** Bold + escaped */
function b(text: string): string {
  return `<b>${esc(text)}</b>`;
}

/** Italic + escaped */
function i(text: string): string {
  return `<i>${esc(text)}</i>`;
}

/** Emit a keyed line only if value is truthy */
function kv(emoji: string, label: string, value: string | null | undefined): string {
  if (!value?.trim()) return "";
  return `${emoji} ${b(label)}: ${esc(value)}`;
}

/** Emit a plain emoji-prefixed line only if value is truthy */
function line(emoji: string, value: string | null | undefined): string {
  if (!value?.trim()) return "";
  return `${emoji} ${esc(value)}`;
}

/** Join non-empty lines with newlines */
function join(lines: string[]): string {
  return lines.filter(Boolean).join("\n");
}

/** Format date string (YYYY-MM-DD or ISO) → human-friendly "15 Jun 2026" */
function fmtDate(raw: string | null | undefined): string {
  if (!raw?.trim()) return "";
  try {
    const d = new Date(raw);
    if (isNaN(d.getTime())) return raw;
    return d.toLocaleDateString("en-GB", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  } catch {
    return raw;
  }
}

/**
 * Format ISO datetime (YYYY-MM-DDTHH:mm) → "15 Mar 2026, 14:30"
 * If no time component, returns just the date.
 */
function fmtDateTimeFull(raw: string | null | undefined): string {
  if (!raw?.trim()) return "";
  const str = raw.trim();
  // Extract time from "YYYY-MM-DDTHH:mm" or "YYYY-MM-DD HH:mm"
  const timeMatch = str.match(/[T ](\d{2}:\d{2})/);
  const datePart = fmtDate(str);
  if (timeMatch && timeMatch[1] && timeMatch[1] !== "00:00") {
    return datePart ? `${datePart}, ${timeMatch[1]}` : timeMatch[1];
  }
  return datePart;
}

/** Format date + time together */
function fmtDateTime(date: string | null | undefined, time: string | null | undefined): string {
  const d = fmtDate(date);
  const t = time?.trim() || "";
  if (d && t) return `${d}, ${t}`;
  return d || t || "";
}

const DIVIDER = "━━━━━━━━━━━━━━━━━━";
const SUB_DIVIDER = "──────────";

// ─── Section formatters ──────────────────────────────────

function formatPassenger(p: PassengerItem, idx: number): string {
  const parts: string[] = [];
  const name = p.name || `Passenger ${idx + 1}`;
  const typeLabel = p.type === "child" ? "👦" : p.type === "infant" ? "👶" : "🧑";
  let main = `   ${typeLabel} ${esc(name)}`;
  if (p.dateOfBirth) main += ` (${esc(p.dateOfBirth)})`;
  parts.push(main);

  const details: string[] = [];
  if (p.baggage) details.push(`🧳 ${esc(p.baggage)}`);
  if (p.baggagePrice) details.push(`bag ${esc(p.baggagePrice)}`);
  if (p.ticketPrice) details.push(`🎫 ${esc(p.ticketPrice)}`);
  if (details.length > 0) parts.push(`      ${details.join(" · ")}`);

  return parts.join("\n");
}

function formatFlightItem(f: FlightItem, idx: number): string {
  const lines: string[] = [];
  const isTrain = f.type === "train";

  if (isTrain) {
    const num = f.trainNumber ? esc(f.trainNumber) : `Train ${idx + 1}`;
    lines.push(`🚆 ${b(num)}`);

    const dep = [f.departureCity, f.departureStation ? `(${f.departureStation})` : ""].filter(Boolean).join(" ");
    const arr = [f.arrivalCity, f.arrivalStation ? `(${f.arrivalStation})` : ""].filter(Boolean).join(" ");
    if (dep || arr) lines.push(`🚉 ${esc(dep || "?")} → ${esc(arr || "?")}`);

    if (f.flightDate) lines.push(kv("📅", "Departure", fmtDateTimeFull(f.flightDate)));
    if (f.arrivalDate) lines.push(kv("🏁", "Arrival", fmtDateTimeFull(f.arrivalDate)));
    lines.push(kv("💺", "Seat", f.seat));
    lines.push(kv("🎫", "Class", f.carriageClass));
  } else {
    const num = f.flightNumber ? esc(f.flightNumber) : `Flight ${idx + 1}`;
    lines.push(`✈️ ${b(num)}`);

    const dep = [f.departureCity, f.departureAirport ? `(${f.departureAirport})` : ""].filter(Boolean).join(" ");
    const arr = [f.arrivalCity, f.arrivalAirport ? `(${f.arrivalAirport})` : ""].filter(Boolean).join(" ");
    if (dep || arr) lines.push(`🛫 ${esc(dep || "?")} → ${esc(arr || "?")}`);

    if (f.flightDate) lines.push(kv("📅", "Departure", fmtDateTimeFull(f.flightDate)));
    if (f.arrivalDate) lines.push(kv("🛬", "Arrival", fmtDateTimeFull(f.arrivalDate)));
    if (f.gate) lines.push(kv("🚪", "Gate", f.gate));
  }

  if (f.passengers?.length) {
    lines.push(`👥 ${b("Passengers")}:`);
    f.passengers.forEach((p, pi) => lines.push(formatPassenger(p, pi)));
  }

  return join(lines);
}

function formatHotelItem(h: HotelItem, idx: number): string {
  const lines: string[] = [];
  lines.push(`🏨 ${b(h.hotelName || `Hotel ${idx + 1}`)}`);
  lines.push(line("📍", h.hotelAddress));
  lines.push(line("📞", h.hotelPhone));
  if (h.guestName) lines.push(kv("🧑", "Guest", h.guestName));

  const checkin = fmtDate(h.checkinDate);
  const checkout = fmtDate(h.checkoutDate);
  if (checkin || checkout) {
    lines.push(`📅 ${esc(checkin || "?")} → ${esc(checkout || "?")}`);
  }
  if (h.checkinTime || h.checkoutTime) {
    lines.push(`⏰ In: ${esc(h.checkinTime || "—")} / Out: ${esc(h.checkoutTime || "—")}`);
  }

  lines.push(kv("🛏️", "Room", h.roomType));
  lines.push(kv("🍽️", "Meal", h.mealPlan));
  lines.push(kv("📋", "Confirmation", h.confirmationNumber));
  if (h.pin) lines.push(kv("🔑", "PIN", h.pin));
  lines.push(kv("💰", "Price", h.price));
  lines.push(kv("🚫", "Cancellation", h.cancellationPolicy));
  lines.push(kv("📝", "Requests", h.specialRequests));

  if (h.propertyMessages?.length) {
    lines.push(`💬 ${b("Hotel messages")}:`);
    h.propertyMessages.forEach((msg) => {
      if (msg?.trim()) lines.push(`   • ${esc(msg)}`);
    });
  }

  return join(lines);
}

function formatGuideItem(g: GuideItem, idx: number): string {
  const lines: string[] = [];
  lines.push(`🧑‍💼 ${b(g.guideName || `Guide ${idx + 1}`)}`);
  lines.push(line("📞", g.guidePhone));
  return join(lines);
}

function transferTypeLabel(type: string): { emoji: string; label: string } {
  switch (type) {
    case "rental":
      return { emoji: "🚗", label: "Car Rental" };
    case "walking":
      return { emoji: "🚶", label: "Walking" };
    default:
      return { emoji: "🚐", label: "Transfer" };
  }
}

function formatTransferItem(t: TransferItem, idx: number): string {
  const lines: string[] = [];
  const { emoji, label } = transferTypeLabel(t.type);
  const title = t.transferInfo || `${label} ${idx + 1}`;
  lines.push(`${emoji} ${b(title)}`);

  // Common fields
  const from = t.fromLocation;
  const to = t.toLocation;
  if (from || to) lines.push(`📍 ${esc(from || "?")} → ${esc(to || "?")}`);
  if (t.date || t.time) lines.push(`📅 ${esc(fmtDateTime(t.date, t.time) || "N/A")}`);
  lines.push(kv("💰", "Price", t.price));
  lines.push(kv("📋", "Confirmation", t.confirmationNumber));

  // Transfer-specific
  if (t.type === "transfer" || !t.type) {
    lines.push(kv("📞", "Driver", t.transferDriverPhone));
    lines.push(kv("📍", "Meeting point", t.transferMeetingPoint));
  }

  // Rental-specific
  if (t.type === "rental") {
    lines.push(kv("🏢", "Company", t.rentalCompany));
    lines.push(kv("🚗", "Car", t.carModel));
    if (t.pickupLocation || t.pickupDate) {
      lines.push(`   📤 ${b("Pickup")}: ${esc(t.pickupLocation || "?")} — ${esc(fmtDateTime(t.pickupDate, t.pickupTime))}`);
    }
    if (t.dropoffLocation || t.dropoffDate) {
      lines.push(`   📥 ${b("Drop-off")}: ${esc(t.dropoffLocation || "?")} — ${esc(fmtDateTime(t.dropoffDate, t.dropoffTime))}`);
    }
    if (t.rentalInsuranceType || t.rentalInsuranceInfo) {
      lines.push(`   🛡️ ${b("Insurance")}: ${esc([t.rentalInsuranceType, t.rentalInsuranceInfo].filter(Boolean).join(" — "))}`);
      if (t.rentalInsurancePhone) lines.push(`   📞 ${esc(t.rentalInsurancePhone)}`);
    }
  }

  // Notes (all types)
  lines.push(kv("📝", "Note", t.notes));

  return join(lines);
}

function formatInsuranceItem(ins: InsuranceItem, idx: number): string {
  const lines: string[] = [];
  lines.push(`🛡️ ${b(ins.insuranceInfo || `Insurance ${idx + 1}`)}`);
  lines.push(line("📞", ins.insurancePhone));
  return join(lines);
}

function formatAttractionItem(a: AttractionItem, idx: number): string {
  const lines: string[] = [];
  lines.push(`🎯 ${b(a.name || `Activity ${idx + 1}`)}`);
  lines.push(line("📝", a.description));
  if (a.date || a.time) lines.push(`📅 ${esc(fmtDateTime(a.date, a.time))}`);
  lines.push(line("📍", a.location));
  lines.push(kv("💰", "Price", a.price));
  lines.push(kv("📋", "Confirmation", a.confirmationNumber));
  lines.push(kv("📝", "Note", a.notes));
  return join(lines);
}

// ─── Cast helpers (JSONB comes as unknown) ───────────────

function asFlights(raw: unknown): FlightItem[] {
  return (Array.isArray(raw) ? raw : []) as FlightItem[];
}
function asHotels(raw: unknown): HotelItem[] {
  return (Array.isArray(raw) ? raw : []) as HotelItem[];
}
function asGuides(raw: unknown): GuideItem[] {
  return (Array.isArray(raw) ? raw : []) as GuideItem[];
}
function asTransfers(raw: unknown): TransferItem[] {
  return (Array.isArray(raw) ? raw : []) as TransferItem[];
}
function asInsurances(raw: unknown): InsuranceItem[] {
  return (Array.isArray(raw) ? raw : []) as InsuranceItem[];
}
function asAttractions(raw: unknown): AttractionItem[] {
  return (Array.isArray(raw) ? raw : []) as AttractionItem[];
}

// ─── Public API ──────────────────────────────────────────

export const tripMessageService = {
  /**
   * Full trip summary — sent on /start deep-link and /trip command.
   * If the message would exceed Telegram's 4096-char limit,
   * it is split into multiple messages.
   */
  formatFullSummary(trip: Trip): string[] {
    const sections: string[] = [];

    // Header
    sections.push(`🌍 ${b("YOUR TRIP")}\n${DIVIDER}`);

    // Flights
    const flights = asFlights(trip.flights);
    if (flights.length > 0) {
      const flightLines = [`\n✈️ ${b("FLIGHTS")}\n${SUB_DIVIDER}`];
      flights.forEach((f, i) => flightLines.push(formatFlightItem(f, i)));
      sections.push(flightLines.join("\n"));
    }

    // Hotels
    const hotels = asHotels(trip.hotels);
    if (hotels.length > 0) {
      const hotelLines = [`\n🏨 ${b("HOTELS")}\n${SUB_DIVIDER}`];
      hotels.forEach((h, i) => hotelLines.push(formatHotelItem(h, i)));
      sections.push(hotelLines.join("\n"));
    }

    // Guides
    const guides = asGuides(trip.guides);
    if (guides.length > 0) {
      const guideLines = [`\n🧑‍💼 ${b("GUIDES")}\n${SUB_DIVIDER}`];
      guides.forEach((g, i) => guideLines.push(formatGuideItem(g, i)));
      sections.push(guideLines.join("\n"));
    }

    // Transfers
    const transfers = asTransfers(trip.transfers);
    if (transfers.length > 0) {
      const transferLines = [`\n🚐 ${b("TRANSPORT")}\n${SUB_DIVIDER}`];
      transfers.forEach((t, i) => transferLines.push(formatTransferItem(t, i)));
      sections.push(transferLines.join("\n"));
    }

    // Insurances
    const insurances = asInsurances(trip.insurances);
    if (insurances.length > 0) {
      const insLines = [`\n🛡️ ${b("INSURANCE")}\n${SUB_DIVIDER}`];
      insurances.forEach((ins, i) => insLines.push(formatInsuranceItem(ins, i)));
      sections.push(insLines.join("\n"));
    }

    // Attractions
    const attractions = asAttractions(trip.attractions);
    if (attractions.length > 0) {
      const attrLines = [`\n🎯 ${b("ACTIVITIES & ATTRACTIONS")}\n${SUB_DIVIDER}`];
      attractions.forEach((a, i) => attrLines.push(formatAttractionItem(a, i)));
      sections.push(attrLines.join("\n"));
    }

    // Manager & notes
    const footer: string[] = [];
    if (trip.managerPhone) footer.push(kv("📞", "Manager", trip.managerPhone));
    if (trip.notes) footer.push(`\n📝 ${b("Notes")}\n${esc(trip.notes)}`);
    if (footer.length > 0) {
      sections.push(`\n${SUB_DIVIDER}\n${join(footer)}`);
    }

    // If nothing filled yet
    if (sections.length <= 1) {
      sections.push(`\n${i("No trip details yet. Your manager will add them soon!")}`);
    }

    // Split into messages if > 4096 chars
    return splitMessages(sections.join("\n"));
  },

  /** Flights section only */
  formatFlights(trip: Trip): string {
    const flights = asFlights(trip.flights);
    if (flights.length === 0) return "✈️ No flight details available yet.";
    const lines = [`✈️ ${b("FLIGHTS")}\n${SUB_DIVIDER}`];
    flights.forEach((f, i) => lines.push(formatFlightItem(f, i)));
    return join(lines);
  },

  /** Hotels section only */
  formatHotels(trip: Trip): string {
    const hotels = asHotels(trip.hotels);
    if (hotels.length === 0) return "🏨 No hotel details available yet.";
    const lines = [`🏨 ${b("HOTELS")}\n${SUB_DIVIDER}`];
    hotels.forEach((h, i) => lines.push(formatHotelItem(h, i)));
    return join(lines);
  },

  /** Guides section only */
  formatGuides(trip: Trip): string {
    const guides = asGuides(trip.guides);
    if (guides.length === 0) return "🧑‍💼 No guide assigned yet.";
    const lines = [`🧑‍💼 ${b("GUIDES")}\n${SUB_DIVIDER}`];
    guides.forEach((g, i) => lines.push(formatGuideItem(g, i)));
    return join(lines);
  },

  /** Transfers/transport section only */
  formatTransfers(trip: Trip): string {
    const transfers = asTransfers(trip.transfers);
    if (transfers.length === 0) return "🚐 No transport details available yet.";
    const lines = [`🚐 ${b("TRANSPORT")}\n${SUB_DIVIDER}`];
    transfers.forEach((t, i) => lines.push(formatTransferItem(t, i)));
    return join(lines);
  },

  /** Insurance section only */
  formatInsurances(trip: Trip): string {
    const insurances = asInsurances(trip.insurances);
    if (insurances.length === 0) return "🛡️ No insurance details available yet.";
    const lines = [`🛡️ ${b("INSURANCE")}\n${SUB_DIVIDER}`];
    insurances.forEach((ins, i) => lines.push(formatInsuranceItem(ins, i)));
    return join(lines);
  },

  /** Attractions section only */
  formatAttractions(trip: Trip): string {
    const attractions = asAttractions(trip.attractions);
    if (attractions.length === 0) return "🎯 No activities planned yet.";
    const lines = [`🎯 ${b("ACTIVITIES & ATTRACTIONS")}\n${SUB_DIVIDER}`];
    attractions.forEach((a, i) => lines.push(formatAttractionItem(a, i)));
    return join(lines);
  },

  /** Documents & notes (insurance + transfer + notes) */
  formatDocs(trip: Trip): string {
    const lines = [`📄 ${b("DOCUMENTS & NOTES")}\n${SUB_DIVIDER}`];

    const insurances = asInsurances(trip.insurances);
    insurances.forEach((ins, i) => {
      lines.push(formatInsuranceItem(ins, i));
    });

    if (trip.managerPhone) lines.push(kv("📞", "Manager", trip.managerPhone));
    if (trip.notes) lines.push(`\n📝 ${b("Notes")}\n${esc(trip.notes)}`);

    if (lines.length <= 1) {
      return "📄 No documents or notes available yet.";
    }
    return join(lines);
  },

  /**
   * Short welcome line (name + quick trip hint).
   * Used as the first message before the full summary.
   */
  formatWelcome(clientName: string): string {
    return join([
      `👋 Hello, ${b(clientName)}!`,
      "",
      `I'm your personal travel assistant. Here's everything about your upcoming trip:`,
    ]);
  },
};

// ─── Telegram message splitter (4096 char limit) ────────

const TG_MAX_LENGTH = 4096;

function splitMessages(text: string): string[] {
  if (text.length <= TG_MAX_LENGTH) return [text];

  const messages: string[] = [];
  const sections = text.split("\n\n");
  let current = "";

  for (const section of sections) {
    // If a single section is already too long, split by lines
    if (section.length > TG_MAX_LENGTH) {
      if (current) {
        messages.push(current.trim());
        current = "";
      }
      const lines = section.split("\n");
      for (const ln of lines) {
        if ((current + "\n" + ln).length > TG_MAX_LENGTH) {
          if (current) messages.push(current.trim());
          current = ln;
        } else {
          current = current ? current + "\n" + ln : ln;
        }
      }
      continue;
    }

    const candidate = current ? current + "\n\n" + section : section;
    if (candidate.length > TG_MAX_LENGTH) {
      messages.push(current.trim());
      current = section;
    } else {
      current = candidate;
    }
  }

  if (current.trim()) messages.push(current.trim());
  return messages;
}

// ─── AI summarization ────────────────────────────────────

const SUMMARIZE_PROMPT = `You are a helpful travel assistant. Summarize the following text into a SHORT, clear, client‑friendly message in the SAME LANGUAGE as the original. 
Keep ONLY what matters to the traveler: key rules, important dates/times, action items, warnings.
Remove marketing fluff, legal boilerplate, and repetition.
Use bullet points (•) for clarity. Max 4-6 bullet points.
Do NOT add any greeting or sign-off. Return ONLY the summary text.`;

/**
 * Summarize a verbose text (hotel message, insurance policy) via Gemini.
 * Returns the original text on AI failure (graceful degradation).
 */
async function aiSummarize(text: string): Promise<string> {
  if (!text || text.length < 100) return text; // too short to summarize
  try {
    const client = getGeminiClient();
    const res = await client.models.generateContent({
      model: "gemini-2.0-flash",
      config: { maxOutputTokens: 400, systemInstruction: SUMMARIZE_PROMPT },
      contents: [{ role: "user", parts: [{ text }] }],
    });
    return res.text?.trim() || text;
  } catch (err) {
    log.warn({ err }, "AI summarize failed, using original text");
    return text;
  }
}

/**
 * Summarize all verbose fields in a trip (hotel messages, insurance info)
 * and return a shallow-cloned trip with condensed values.
 * Call this once before formatting for Telegram.
 */
export async function summarizeTripForClient(trip: Trip): Promise<Trip> {
  const clone = { ...trip };

  // Summarize hotel property messages
  const hotels = asHotels(trip.hotels);
  if (hotels.length > 0) {
    const summarized = await Promise.all(
      hotels.map(async (h) => {
        if (!h.propertyMessages?.length) return h;
        const combined = h.propertyMessages.filter(Boolean).join("\n\n");
        if (combined.length < 100) return h;
        const summary = await aiSummarize(combined);
        return { ...h, propertyMessages: [summary] };
      }),
    );
    clone.hotels = summarized as unknown as typeof trip.hotels;
  }

  // Summarize insurance info
  const insurances = asInsurances(trip.insurances);
  if (insurances.length > 0) {
    const summarized = await Promise.all(
      insurances.map(async (ins) => {
        if (!ins.insuranceInfo || ins.insuranceInfo.length < 100) return ins;
        const summary = await aiSummarize(ins.insuranceInfo);
        return { ...ins, insuranceInfo: summary };
      }),
    );
    clone.insurances = summarized as unknown as typeof trip.insurances;
  }

  // Summarize cancellation policies
  if (hotels.length > 0) {
    const h = asHotels(clone.hotels);
    const withCancellation = await Promise.all(
      h.map(async (hotel) => {
        if (!hotel.cancellationPolicy || hotel.cancellationPolicy.length < 100) return hotel;
        const summary = await aiSummarize(hotel.cancellationPolicy);
        return { ...hotel, cancellationPolicy: summary };
      }),
    );
    clone.hotels = withCancellation as unknown as typeof trip.hotels;
  }

  return clone;
}
