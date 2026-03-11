import { NextRequest, NextResponse } from "next/server";
import { tripRepository } from "@/lib/db/repositories";
import { createLogger } from "@/lib/logger";
import { badRequest, notFound, serverError } from "@/lib/api-error";

const log = createLogger("api:trips:invite");

type RouteParams = { params: Promise<{ id: string }> };

/**
 * POST /api/trips/:id/invite — Generate Telegram deep-link for client.
 */
export async function POST(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
    const trip = await tripRepository.findById(id);

    if (!trip) {
      return notFound("Trip not found");
    }

    if (!trip.inviteToken) {
      return badRequest("Trip has no invite token");
    }

    // Bot username should be from env or bot info
    const botUsername = process.env.TELEGRAM_BOT_USERNAME || "your_bot";
    const deepLink = `https://t.me/${botUsername}?start=${trip.inviteToken}`;

    return NextResponse.json({
      data: {
        deepLink,
        inviteToken: trip.inviteToken,
      },
    });
  } catch (error) {
    log.error({ error }, "Failed to generate invite");
    return serverError();
  }
}
