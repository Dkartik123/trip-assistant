import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { tripService } from "@/lib/services";
import { tripRepository } from "@/lib/db/repositories";
import { createLogger } from "@/lib/logger";
import { badRequest, notFound, serverError } from "@/lib/api-error";

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

const updateTripSchema = z.object({
  status: z.enum(["draft", "active", "completed"]).optional(),
  flights: z
    .array(
      z.object({
        flightDate: z.string().optional().default(""),
        flightNumber: z.string().optional().default(""),
        departureCity: z.string().optional().default(""),
        departureAirport: z.string().optional().default(""),
        arrivalCity: z.string().optional().default(""),
        arrivalAirport: z.string().optional().default(""),
        arrivalDate: z.string().optional().default(""),
        gate: z.string().optional().default(""),
      }),
    )
    .optional(),
  hotels: z
    .array(
      z.object({
        hotelName: z.string().optional().default(""),
        hotelAddress: z.string().optional().default(""),
        hotelPhone: z.string().optional().default(""),
        checkinTime: z.string().optional().default(""),
        checkoutTime: z.string().optional().default(""),
      }),
    )
    .optional(),
  guides: z
    .array(
      z.object({
        guideName: z.string().optional().default(""),
        guidePhone: z.string().optional().default(""),
      }),
    )
    .optional(),
  transfers: z
    .array(
      z.object({
        transferInfo: z.string().optional().default(""),
        transferDriverPhone: z.string().optional().default(""),
        transferMeetingPoint: z.string().optional().default(""),
      }),
    )
    .optional(),
  insurances: z
    .array(
      z.object({
        insuranceInfo: z.string().optional().default(""),
        insurancePhone: z.string().optional().default(""),
      }),
    )
    .optional(),
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
      return badRequest("Validation error", parsed.error.flatten());
    }

    const existing = await tripRepository.findById(id);
    if (!existing) {
      return notFound("Trip not found");
    }

    const data = parsed.data;

    // Sync flightDate from first flight for notification scheduling
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
