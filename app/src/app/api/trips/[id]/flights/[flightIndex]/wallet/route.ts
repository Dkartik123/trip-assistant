import { NextResponse } from "next/server";
import { clientRepository, tripRepository } from "@/lib/db/repositories";
import { createLogger } from "@/lib/logger";
import type { FlightItem } from "@/lib/types/trip-sections";
import {
  buildWalletPassFileName,
  canGenerateWalletPasses,
  generateWalletPass,
} from "@/lib/services/trip-export.service";
import { badRequest, notFound, serverError } from "@/lib/api-error";

const log = createLogger("api:trips:wallet");

type RouteParams = {
  params: Promise<{ id: string; flightIndex: string }>;
};

export const runtime = "nodejs";

export async function GET(request: Request, { params }: RouteParams) {
  try {
    const { id, flightIndex } = await params;
    const trip = await tripRepository.findById(id);

    if (!trip) {
      return notFound("Trip not found");
    }

    if (!canGenerateWalletPasses()) {
      return NextResponse.json(
        { error: "Apple Wallet export is not configured" },
        { status: 503 },
      );
    }

    const index = Number.parseInt(flightIndex, 10);
    if (!Number.isInteger(index) || index < 0) {
      return badRequest("Invalid flight index");
    }

    const flights = Array.isArray(trip.flights)
      ? (trip.flights as FlightItem[])
      : [];
    const flight = flights[index];

    if (!flight) {
      return notFound("Flight not found");
    }

    const client = await clientRepository.findById(trip.clientId);
    const buffer = await generateWalletPass(trip, flight, index, client?.name);

    return new NextResponse(buffer, {
      headers: {
        "Content-Type": "application/vnd.apple.pkpass",
        "Content-Disposition": `attachment; filename="${buildWalletPassFileName(trip, flight, index)}"`,
      },
    });
  } catch (error) {
    log.error({ error }, "Failed to export Apple Wallet pass");
    return serverError();
  }
}
