import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { tripService } from "@/lib/services";
import { tripRepository, messageRepository } from "@/lib/db/repositories";
import { createLogger } from "@/lib/logger";

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
      return NextResponse.json({ error: "Trip not found" }, { status: 404 });
    }

    return NextResponse.json({ data: trip });
  } catch (error) {
    log.error({ error }, "Failed to get trip");
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}

const updateTripSchema = z.object({
  status: z.enum(["draft", "active", "completed"]).optional(),
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
 * PUT /api/trips/:id — Update trip.
 */
export async function PUT(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
    const body = await request.json();
    const parsed = updateTripSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Validation error", details: parsed.error.flatten() },
        { status: 400 },
      );
    }

    const existing = await tripRepository.findById(id);
    if (!existing) {
      return NextResponse.json({ error: "Trip not found" }, { status: 404 });
    }

    const data = parsed.data;
    const trip = await tripService.updateTrip(id, {
      ...data,
      flightDate: data.flightDate ? new Date(data.flightDate) : undefined,
    });

    return NextResponse.json({ data: trip });
  } catch (error) {
    log.error({ error }, "Failed to update trip");
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
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
      return NextResponse.json({ error: "Trip not found" }, { status: 404 });
    }

    await tripRepository.delete(id);
    return NextResponse.json({ status: "deleted" });
  } catch (error) {
    log.error({ error }, "Failed to delete trip");
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
