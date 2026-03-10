import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { tripService } from "@/lib/services";
import { tripRepository } from "@/lib/db/repositories";
import { createLogger } from "@/lib/logger";

const log = createLogger("api:trips");

// ─── Validation Schemas ─────────────────────────────────

const createTripSchema = z.object({
  clientId: z.string().uuid(),
  managerId: z.string().uuid(),
  status: z.enum(["draft", "active", "completed"]).default("draft"),
  flightDate: z.string().datetime().optional(),
  flightNumber: z.string().max(20).optional(),
  departureCity: z.string().max(100).optional(),
  departureAirport: z.string().max(10).optional(),
  arrivalCity: z.string().max(100).optional(),
  arrivalAirport: z.string().max(10).optional(),
  gate: z.string().max(10).optional(),
  hotelName: z.string().max(255).optional(),
  hotelAddress: z.string().optional(),
  hotelPhone: z.string().max(50).optional(),
  checkinTime: z.string().max(10).optional(),
  checkoutTime: z.string().max(10).optional(),
  guideName: z.string().max(255).optional(),
  guidePhone: z.string().max(50).optional(),
  transferInfo: z.string().optional(),
  transferDriverPhone: z.string().max(50).optional(),
  transferMeetingPoint: z.string().optional(),
  insuranceInfo: z.string().optional(),
  insurancePhone: z.string().max(50).optional(),
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
      return NextResponse.json(
        { error: "managerId query param required" },
        { status: 400 },
      );
    }

    const trips = await tripRepository.findByManagerId(managerId);
    return NextResponse.json({ data: trips });
  } catch (error) {
    log.error({ error }, "Failed to list trips");
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
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
      return NextResponse.json(
        { error: "Validation error", details: parsed.error.flatten() },
        { status: 400 },
      );
    }

    const data = parsed.data;
    const trip = await tripService.createTrip({
      ...data,
      flightDate: data.flightDate ? new Date(data.flightDate) : undefined,
    });

    return NextResponse.json({ data: trip }, { status: 201 });
  } catch (error) {
    log.error({ error }, "Failed to create trip");
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
