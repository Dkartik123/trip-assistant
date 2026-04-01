import { NextResponse } from "next/server";
import { clientRepository, tripRepository } from "@/lib/db/repositories";
import { createLogger } from "@/lib/logger";
import {
  buildTripPdfFileName,
  generateTripPdf,
} from "@/lib/services/trip-export.service";
import { notFound, serverError } from "@/lib/api-error";

const log = createLogger("api:trips:pdf");

type RouteParams = { params: Promise<{ id: string }> };

export const runtime = "nodejs";

export async function GET(request: Request, { params }: RouteParams) {
  try {
    const { id } = await params;
    const trip = await tripRepository.findById(id);

    if (!trip) {
      return notFound("Trip not found");
    }

    const client = await clientRepository.findById(trip.clientId);
    const buffer = await generateTripPdf(trip, client?.name);

    return new NextResponse(new Uint8Array(buffer), {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="${buildTripPdfFileName(trip, client?.name)}"`,
      },
    });
  } catch (error) {
    log.error({ error }, "Failed to export trip PDF");
    return serverError();
  }
}
