import { NextRequest, NextResponse } from "next/server";
import { messageRepository, tripRepository } from "@/lib/db/repositories";
import { createLogger } from "@/lib/logger";
import { notFound, serverError } from "@/lib/api-error";

const log = createLogger("api:trips:messages");

type RouteParams = { params: Promise<{ id: string }> };

/**
 * GET /api/trips/:id/messages — Get message history for a trip.
 */
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get("limit") ?? "50", 10);

    const trip = await tripRepository.findById(id);
    if (!trip) {
      return notFound("Trip not found");
    }

    const messages = await messageRepository.findByTripId(id, limit);

    return NextResponse.json({ data: messages });
  } catch (error) {
    log.error({ error }, "Failed to get messages");
    return serverError();
  }
}
