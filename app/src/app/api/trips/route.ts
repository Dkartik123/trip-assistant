import { NextRequest, NextResponse } from "next/server";
import { tripService } from "@/lib/services";
import { tripRepository } from "@/lib/db/repositories";
import { createLogger } from "@/lib/logger";
import { badRequest, serverError } from "@/lib/api-error";
import { createTripSchema } from "@/lib/schemas/trip.schemas";

const log = createLogger("api:trips");

/**
 * GET /api/trips — List all trips.
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
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const parsed = createTripSchema.safeParse(body);

    if (!parsed.success) {
      return badRequest("Validation error", parsed.error.flatten());
    }

    const data = parsed.data;
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
