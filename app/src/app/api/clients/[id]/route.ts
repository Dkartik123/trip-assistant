import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { clientRepository } from "@/lib/db/repositories";
import { createLogger } from "@/lib/logger";
import { badRequest, serverError } from "@/lib/api-error";

const log = createLogger("api:clients:id");

const updateClientSchema = z.object({
  name: z.string().min(1).max(255).optional(),
  firstName: z.string().max(128).optional().nullable(),
  lastName: z.string().max(128).optional().nullable(),
  phone: z.string().max(50).optional().nullable(),
  email: z.string().email().max(255).optional().nullable(),
  country: z.string().max(100).optional().nullable(),
  language: z.string().max(10).optional(),
  locale: z.string().max(20).optional().nullable(),
  timezone: z.string().max(100).optional(),
  telegramChatId: z.string().max(50).optional().nullable(),
  telegramUsername: z.string().max(100).optional().nullable(),
  whatsappPhone: z.string().max(50).optional().nullable(),
  preferredMessenger: z
    .enum(["whatsapp", "telegram", "sms", "email"])
    .optional()
    .nullable(),
  clientStatus: z.enum(["active", "archived", "blocked"]).optional(),
  source: z.string().max(100).optional().nullable(),
  managerId: z.string().uuid().optional().nullable(),
  notes: z.string().optional().nullable(),
  preferredContactTime: z.string().max(100).optional().nullable(),
  voiceEnabled: z.boolean().optional(),
  notificationEnabled: z.boolean().optional(),
  emergencyContactName: z.string().max(255).optional().nullable(),
  emergencyContactPhone: z.string().max(50).optional().nullable(),
  consentMarketing: z.boolean().optional(),
  consentMessaging: z.boolean().optional(),
  consentPrivacy: z.boolean().optional(),
});

/**
 * GET /api/clients/[id] — Get single client.
 */
export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const client = await clientRepository.findById(id);

    if (!client) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    return NextResponse.json({ data: client });
  } catch (error) {
    log.error({ error }, "Failed to get client");
    return serverError();
  }
}

/**
 * PATCH /api/clients/[id] — Update client fields.
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const parsed = updateClientSchema.safeParse(body);

    if (!parsed.success) {
      return badRequest("Validation error", parsed.error.flatten());
    }

    const existing = await clientRepository.findById(id);
    if (!existing) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    const updated = await clientRepository.update(id, {
      ...parsed.data,
      updatedAt: new Date(),
    });

    return NextResponse.json({ data: updated });
  } catch (error) {
    log.error({ error }, "Failed to update client");
    return serverError();
  }
}
