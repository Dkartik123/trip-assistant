import PDFDocument from "pdfkit";
import type { Trip } from "@/lib/db/repositories";
import type { FlightItem } from "@/lib/types/trip-sections";
import { tripMessageService } from "@/lib/services/trip-message.service";

const DEFAULT_ORGANIZATION_NAME = "Trip Assistant";
const GOOGLE_CALENDAR_BASE_URL =
  "https://calendar.google.com/calendar/render?action=TEMPLATE";
const DEFAULT_ATTRACTION_DURATION_MS = 2 * 60 * 60 * 1000;
const DEFAULT_TRIP_DURATION_MS = 4 * 60 * 60 * 1000;

function decodeNumericHtmlEntities(text: string): string {
  return text.replace(/&#(x?[0-9a-f]+);/gi, (_, code: string) => {
    const value = code.toLowerCase().startsWith("x")
      ? Number.parseInt(code.slice(1), 16)
      : Number.parseInt(code, 10);

    return Number.isNaN(value) ? _ : String.fromCodePoint(value);
  });
}

function decodeHtml(text: string): string {
  return decodeNumericHtmlEntities(text)
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/<\/p>/gi, "\n\n")
    .replace(/<[^>]+>/g, "")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&nbsp;/g, " ")
    .replace(/&copy;/g, "©")
    .replace(/&euro;/g, "€")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'");
}

function normalizeText(text: string): string {
  return decodeHtml(text)
    .replace(/\r\n/g, "\n")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

export function normalizeTripSummary(parts: string[]): string {
  return parts.map(normalizeText).join("\n\n");
}

function sanitizeFilePart(
  value: string | null | undefined,
  fallback: string,
): string {
  const cleaned = (value ?? "")
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

  return cleaned || fallback;
}

function pdfBufferFromDocument(doc: PDFDocument): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    const chunks: Buffer[] = [];

    doc.on("data", (chunk: Buffer) => chunks.push(chunk));
    doc.on("end", () => resolve(Buffer.concat(chunks)));
    doc.on("error", reject);
    doc.end();
  });
}

function getFlights(trip: Trip): FlightItem[] {
  return Array.isArray(trip.flights) ? (trip.flights as FlightItem[]) : [];
}

function toDate(value: string | Date | null | undefined): Date | null {
  if (!value) return null;
  const date = value instanceof Date ? value : new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
}

function toDateWithFallbackTime(
  value: string | Date | null | undefined,
  fallbackTime: string,
): Date | null {
  if (!value) return null;
  if (value instanceof Date) return value;
  const normalized = value.includes("T") ? value : `${value}T${fallbackTime}`;
  return toDate(normalized);
}

function toGoogleCalendarDateFormat(value: Date): string {
  return value
    .toISOString()
    .replace(/[-:]/g, "")
    .replace(/\.\d{3}Z$/, "Z");
}

function formatDateTime(value: string | null | undefined): string {
  const date = toDate(value);
  if (!date) return value ?? "";

  return date.toLocaleString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function formatFlightRoute(flight: FlightItem): string {
  return `${flight.departureCity || flight.departureAirport || "?"} → ${flight.arrivalCity || flight.arrivalAirport || "?"}`;
}

function buildTripTitle(trip: Trip, clientName?: string): string {
  const flights = getFlights(trip);
  const firstFlight = flights[0];
  const destination = firstFlight?.arrivalCity || firstFlight?.arrivalAirport;

  if (clientName && destination) return `${clientName} trip to ${destination}`;
  if (destination) return `Trip to ${destination}`;
  if (clientName) return `${clientName} trip`;
  return "Trip itinerary";
}

function resolveTripWindow(trip: Trip): { start: Date; end: Date } {
  const candidatesStart: Date[] = [];
  const candidatesEnd: Date[] = [];

  const flights = getFlights(trip);
  for (const flight of flights) {
    const departure = toDate(flight.flightDate);
    const arrival = toDate(flight.arrivalDate) ?? departure;

    if (departure) candidatesStart.push(departure);
    if (arrival) candidatesEnd.push(arrival);
  }

  const hotels = Array.isArray(trip.hotels) ? trip.hotels : [];
  for (const hotel of hotels) {
    const checkin = toDateWithFallbackTime(hotel.checkinDate, "15:00");
    const checkout = toDateWithFallbackTime(hotel.checkoutDate, "11:00");

    if (checkin) candidatesStart.push(checkin);
    if (checkout) candidatesEnd.push(checkout);
  }

  const attractions = Array.isArray(trip.attractions) ? trip.attractions : [];
  for (const attraction of attractions) {
    const start = toDateWithFallbackTime(
      attraction.date,
      attraction.time || "10:00",
    );

    if (start) {
      candidatesStart.push(start);
      candidatesEnd.push(
        new Date(start.getTime() + DEFAULT_ATTRACTION_DURATION_MS),
      );
    }
  }

  const start =
    candidatesStart.sort((a, b) => a.getTime() - b.getTime())[0] ??
    toDate(trip.flightDate) ??
    new Date();
  const end =
    candidatesEnd.sort((a, b) => b.getTime() - a.getTime())[0] ??
    toDate(trip.arrivalDate) ??
    new Date(start.getTime() + DEFAULT_TRIP_DURATION_MS);

  if (end.getTime() <= start.getTime()) {
    return {
      start,
      end: new Date(start.getTime() + DEFAULT_TRIP_DURATION_MS),
    };
  }

  return { start, end };
}

function buildTripLocation(trip: Trip): string {
  const hotel = Array.isArray(trip.hotels) ? trip.hotels[0] : undefined;
  if (hotel?.hotelAddress) return hotel.hotelAddress;

  const flight = getFlights(trip)[0];
  return (
    flight?.arrivalAirport ||
    flight?.arrivalCity ||
    flight?.departureAirport ||
    flight?.departureCity ||
    "Trip"
  );
}

function buildTripDetails(trip: Trip): string {
  const details: string[] = [];
  const flights = getFlights(trip);

  if (flights.length > 0) {
    details.push(
      "Flights:",
      ...flights.map((flight) => {
        const number =
          flight.type === "train"
            ? flight.trainNumber || "Train"
            : flight.flightNumber || "Flight";
        const route = formatFlightRoute(flight);
        const departure = formatDateTime(flight.flightDate);
        return `• ${number}: ${route}${departure ? ` (${departure})` : ""}`;
      }),
    );
  }

  const hotels = Array.isArray(trip.hotels) ? trip.hotels : [];
  if (hotels.length > 0) {
    details.push(
      "",
      "Hotels:",
      ...hotels.map(
        (hotel) =>
          `• ${hotel.hotelName || "Hotel"}${hotel.hotelAddress ? ` — ${hotel.hotelAddress}` : ""}`,
      ),
    );
  }

  if (trip.notes?.trim()) {
    details.push("", "Notes:", trip.notes.trim());
  }

  return details.join("\n").trim();
}

export function buildTripPdfFileName(trip: Trip, clientName?: string): string {
  return `${sanitizeFilePart(clientName, "trip")}-${sanitizeFilePart(trip.id, "itinerary")}.pdf`;
}

export function buildGoogleCalendarUrl(
  trip: Trip,
  clientName?: string,
): string {
  const { start, end } = resolveTripWindow(trip);
  const params = new URLSearchParams({
    text: buildTripTitle(trip, clientName),
    dates: `${toGoogleCalendarDateFormat(start)}/${toGoogleCalendarDateFormat(end)}`,
    details: buildTripDetails(trip),
    location: buildTripLocation(trip),
  });

  return `${GOOGLE_CALENDAR_BASE_URL}&${params.toString()}`;
}

export async function generateTripPdf(
  trip: Trip,
  clientName?: string,
): Promise<Buffer> {
  const doc = new PDFDocument({
    margin: 48,
    size: "A4",
    info: {
      Title: buildTripTitle(trip, clientName),
      Author: "Trip Assistant",
      Subject: "Trip itinerary",
    },
  });

  const summary = normalizeTripSummary(
    tripMessageService.formatFullSummary(trip),
  );

  doc.fontSize(20).text(buildTripTitle(trip, clientName));
  doc.moveDown();
  doc.fontSize(11).text(summary || "No trip details available yet.", {
    width: 500,
    lineGap: 3,
  });

  return pdfBufferFromDocument(doc);
}
