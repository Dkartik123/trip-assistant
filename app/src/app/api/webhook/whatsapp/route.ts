import { NextRequest, NextResponse } from "next/server";
import { createLogger } from "@/lib/logger";

const log = createLogger("webhook:whatsapp");

/**
 * POST /api/webhook/whatsapp
 * Receives WhatsApp messages via Twilio webhook.
 * TODO: Implement full WhatsApp message handling in Étap 2.
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.formData();
    const from = body.get("From") as string;
    const messageBody = body.get("Body") as string;

    log.info({ from, messageBody }, "WhatsApp message received");

    // TODO: Implement WhatsApp message pipeline
    // 1. Find client by whatsapp_phone
    // 2. Find active trip
    // 3. Generate AI response
    // 4. Reply via Twilio

    return NextResponse.json({ status: "received" });
  } catch (error) {
    log.error({ error }, "WhatsApp webhook error");
    return NextResponse.json(
      { status: "error" },
      { status: 500 },
    );
  }
}
