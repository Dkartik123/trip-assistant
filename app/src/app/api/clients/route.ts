import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { clientRepository } from "@/lib/db/repositories";
import { createLogger } from "@/lib/logger";
import { badRequest, serverError } from "@/lib/api-error";

const log = createLogger("api:clients");

const createClientSchema = z.object({
  agencyId: z.string().uuid(),
  name: z.string().min(1).max(255),
  phone: z.string().max(50).optional(),
  email: z.string().email().max(255).optional(),
  timezone: z.string().max(100).default("UTC"),
  language: z.string().max(10).default("en"),
});

/**
 * GET /api/clients?agencyId=...
 */
export async function GET(request: NextRequest) {
  try {
    const agencyId = request.nextUrl.searchParams.get("agencyId");

    if (!agencyId) {
      return badRequest("agencyId query param required");
    }

    const clients = await clientRepository.findByAgencyId(agencyId);
    return NextResponse.json({ data: clients });
  } catch (error) {
    log.error({ error }, "Failed to list clients");
    return serverError();
  }
}

/**
 * POST /api/clients — Create a new client.
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const parsed = createClientSchema.safeParse(body);

    if (!parsed.success) {
      return badRequest("Validation error", parsed.error.flatten());
    }

    const client = await clientRepository.create(parsed.data);
    return NextResponse.json({ data: client }, { status: 201 });
  } catch (error) {
    log.error({ error }, "Failed to create client");
    return serverError();
  }
}
