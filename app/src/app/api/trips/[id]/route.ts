import { NextRequest, NextResponse } from "next/server";
import { tripService } from "@/lib/services";
import { tripRepository } from "@/lib/db/repositories";
import { createLogger } from "@/lib/logger";
import { badRequest, notFound, serverError } from "@/lib/api-error";
import { updateTripSchema } from "@/lib/schemas/trip.schemas";

const log = createLogger("api:trips:id");

type RouteParams = { params: Promise<{ id: string }> };

/**
 * GET /api/trips/:id — Get trip details.
 */
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
    const trip = await tripRepository.findById(id);

    if (!trip) {
      return notFound("Trip not found");
    }

    return NextResponse.json({ data: trip });
  } catch (error) {
    log.error({ error }, "Failed to get trip");
    return serverError();
  }
}

/**
 * PUT /api/trips/:id — Update trip.
 */
export async function PUT(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
    const body = await request.json();
    const parsed = updateTripSchema.safeParse(body);

    if (!parsed.success) {
      return badRequest("Validation error", parsed.error.flatten());
    }

    const existing = await tripRepository.findById(id);
    if (!existing) {
      return notFound("Trip not found");
    }

    const data = parsed.data;
    const firstFlightDate = data.flights?.[0]?.flightDate;

    const trip = await tripService.updateTrip(id, {
      ...data,
      flightDate: firstFlightDate ? new Date(firstFlightDate) : undefined,
    });

    return NextResponse.json({ data: trip });
  } catch (error) {
    log.error({ error }, "Failed to update trip");
    return serverError();
  }
}

/**
 * DELETE /api/trips/:id — Delete trip.
 */
export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
    const existing = await tripRepository.findById(id);

    if (!existing) {
      return notFound("Trip not found");
    }

    await tripRepository.delete(id);
    return NextResponse.json({ status: "deleted" });
  } catch (error) {
    log.error({ error }, "Failed to delete trip");
    return serverError();
  }
}
