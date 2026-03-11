import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { tripService } from "@/lib/services";
import { tripRepository } from "@/lib/db/repositories";
import { createLogger } from "@/lib/logger";
import { badRequest, serverError } from "@/lib/api-error";

const log = createLogger("api:trips");

// ─── Validation Schemas ─────────────────────────────────

const flightSchema = z.object({
  flightDate: z.string().optional().default(""),
  flightNumber: z.string().optional().default(""),
  departureCity: z.string().optional().default(""),
  departureAirport: z.string().optional().default(""),
  arrivalCity: z.string().optional().default(""),
  arrivalAirport: z.string().optional().default(""),
  arrivalDate: z.string().optional().default(""),
  gate: z.string().optional().default(""),
});

const hotelSchema = z.object({
  hotelName: z.string().optional().default(""),
  hotelAddress: z.string().optional().default(""),
  hotelPhone: z.string().optional().default(""),
  checkinTime: z.string().optional().default(""),
  checkoutTime: z.string().optional().default(""),
});

const guideSchema = z.object({
  guideName: z.string().optional().default(""),
  guidePhone: z.string().optional().default(""),
});

const transferSchema = z.object({
  transferInfo: z.string().optional().default(""),
  transferDriverPhone: z.string().optional().default(""),
  transferMeetingPoint: z.string().optional().default(""),
});

const insuranceSchema = z.object({
  insuranceInfo: z.string().optional().default(""),
  insurancePhone: z.string().optional().default(""),
});

const createTripSchema = z.object({
  clientId: z.string().uuid(),
  managerId: z.string().uuid(),
  status: z.enum(["draft", "active", "completed"]).default("draft"),
  flights: z.array(flightSchema).optional().default([]),
  hotels: z.array(hotelSchema).optional().default([]),
  guides: z.array(guideSchema).optional().default([]),
  transfers: z.array(transferSchema).optional().default([]),
  insurances: z.array(insuranceSchema).optional().default([]),
  managerPhone: z.string().max(50).optional(),
  notes: z.string().optional(),
});

/**
 * GET /api/trips — List all trips.
 * TODO: Add auth middleware + filter by manager/agency.
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const managerId = searchParams.get("managerId");

    if (!managerId) {
      return badRequest("managerId query param required");
    }

    const trips = await tripRepository.findByManagerId(managerId);
    return NextResponse.json({ data: trips });
  } catch (error) {
    log.error({ error }, "Failed to list trips");
    return serverError();
  }
}

/**
 * POST /api/trips — Create a new trip.
 * TODO: Add auth middleware.
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const parsed = createTripSchema.safeParse(body);

    if (!parsed.success) {
      return badRequest("Validation error", parsed.error.flatten());
    }

    const data = parsed.data;

    // Sync flightDate from first flight for notification scheduling
    const firstFlightDate = data.flights?.[0]?.flightDate;

    const trip = await tripService.createTrip({
      ...data,
      flightDate: firstFlightDate ? new Date(firstFlightDate) : undefined,
    });

    return NextResponse.json({ data: trip }, { status: 201 });
  } catch (error) {
    log.error({ error }, "Failed to create trip");
    return serverError();
  }
}
