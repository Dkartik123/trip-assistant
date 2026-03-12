import { NextRequest, NextResponse } from "next/server";
import {
  messageRepository,
  tripRepository,
  clientRepository,
  subscriberRepository,
} from "@/lib/db/repositories";
import { createLogger } from "@/lib/logger";
import { badRequest, notFound, serverError } from "@/lib/api-error";

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

/**
 * POST /api/trips/:id/messages — Send a message from the operator to the client via Telegram.
 * Body: { content: string }
 * Stores in DB with role: "operator" and delivers to all connected Telegram chats.
 */
export async function POST(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
    const body = await request.json();
    const content = body?.content?.trim();

    if (!content) {
      return badRequest("Message content is required");
    }

    const trip = await tripRepository.findById(id);
    if (!trip) {
      return notFound("Trip not found");
    }

    // Collect all Telegram chat IDs to send to
    const chatIds = new Set<string>();

    // 1) Primary client
    const client = await clientRepository.findById(trip.clientId);
    if (client?.telegramChatId) chatIds.add(client.telegramChatId);
    if (client?.telegramGroupId) chatIds.add(client.telegramGroupId);

    // 2) All subscribers
    const subscribers = await subscriberRepository.findByTripId(id);
    for (const sub of subscribers) {
      chatIds.add(sub.telegramChatId);
    }

    if (chatIds.size === 0) {
      return badRequest("No connected Telegram chats for this trip");
    }

    // Send message to all chats via Telegram bot
    const { getBot } = await import("@/lib/bot");
    const bot = getBot();

    const formattedMessage = `👤 <b>Оператор</b>:\n${content
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")}`;

    const sentChatIds: string[] = [];
    for (const chatId of chatIds) {
      try {
        await bot.api.sendMessage(chatId, formattedMessage, {
          parse_mode: "HTML",
        });
        sentChatIds.push(chatId);
      } catch (err) {
        log.warn({ err, chatId }, "Failed to send operator message to chat");
      }
    }

    // Save to DB
    const message = await messageRepository.create({
      tripId: id,
      chatId: sentChatIds[0] ?? "admin",
      channel: "telegram",
      role: "operator",
      content,
      contentType: "text",
    });

    log.info(
      { tripId: id, recipients: sentChatIds.length },
      "Operator message sent",
    );

    return NextResponse.json({
      data: {
        id: message.id,
        role: message.role,
        content: message.content,
        createdAt: message.createdAt.toISOString(),
        deliveredTo: sentChatIds.length,
      },
    });
  } catch (error) {
    log.error({ error }, "Failed to send operator message");
    return serverError();
  }
}
