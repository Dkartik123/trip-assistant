import { Context } from "grammy";
import { createLogger } from "@/lib/logger";
import {
  clientRepository,
  tripRepository,
  messageRepository,
  subscriberRepository,
} from "@/lib/db/repositories";
import { generateResponse } from "@/lib/services/ai.service";
import { env } from "@/lib/config/env";

const log = createLogger("bot:message");

/**
 * Resolve the trip for the current chat (client-based or subscriber-based).
 */
async function resolveTripForChat(chatId: string, isGroup: boolean) {
  // 1) Legacy client-based lookup
  const client = isGroup
    ? await clientRepository.findByTelegramGroupId(chatId)
    : await clientRepository.findByTelegramChatId(chatId);

  if (client) {
    const trip = await tripRepository.findByClientId(client.id);
    if (trip) return { trip, language: client.language ?? "en" };
  }

  // 2) Subscriber-based lookup
  const subscriber = await subscriberRepository.findByChatId(chatId);
  if (subscriber) {
    const trip = await tripRepository.findById(subscriber.tripId);
    if (trip) return { trip, language: subscriber.language ?? "en" };
  }

  return null;
}

/**
 * Handle incoming text messages.
 * Loads trip context → calls Claude AI → saves history → replies.
 */
export async function handleMessage(ctx: Context): Promise<void> {
  const chatId = ctx.chat?.id?.toString();
  const userText = ctx.message?.text;

  if (!chatId || !userText) return;

  // Skip commands (already handled)
  if (userText.startsWith("/")) return;

  try {
    // In groups, only respond to @mentions or replies to bot messages
    const isGroup =
      ctx.chat?.type === "group" || ctx.chat?.type === "supergroup";
    if (isGroup) {
      const botInfo = ctx.me;
      const isMentioned = userText.includes(`@${botInfo.username}`);
      const isReply =
        ctx.message?.reply_to_message?.from?.id === botInfo.id;

      if (!isMentioned && !isReply) return;
    }

    // Find trip (client-based or subscriber-based)
    const result = await resolveTripForChat(chatId, isGroup);
    if (!result) {
      await ctx.reply(
        "🔗 I don't recognize you yet. Please use the link from your travel agency to connect.",
      );
      return;
    }

    const { trip } = result;

    // Show typing indicator
    await ctx.replyWithChatAction("typing");

    // Load message history (last 10)
    const history = await messageRepository.findByTripId(trip.id, 10);

    // Generate AI response
    const response = await generateResponse(trip, history, userText);

    // Save user message
    await messageRepository.create({
      tripId: trip.id,
      chatId,
      channel: "telegram",
      role: "user",
      content: userText,
      contentType: "text",
    });

    // Save assistant response
    await messageRepository.create({
      tripId: trip.id,
      chatId,
      channel: "telegram",
      role: "assistant",
      content: response,
      contentType: "text",
    });

    await ctx.reply(response);

    // Notify operator about client's message (fire-and-forget)
    const operatorChatId = env.OPERATOR_TELEGRAM_CHAT_ID;
    if (operatorChatId) {
      const senderName = ctx.from?.first_name
        ? [ctx.from.first_name, ctx.from.last_name].filter(Boolean).join(" ")
        : `chat ${chatId}`;
      const notifyText =
        `💬 <b>Сообщение от клиента</b>\n` +
        `👤 ${senderName}\n` +
        `🗺️ ${trip.departureCity ?? "—"} → ${trip.arrivalCity ?? "—"}\n\n` +
        `<i>${userText.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")}</i>`;
      const { getBot } = await import("@/lib/bot");
      getBot().api.sendMessage(operatorChatId, notifyText, { parse_mode: "HTML" }).catch((err) => {
        log.warn({ err, operatorChatId }, "Failed to notify operator about client message");
      });
    }
  } catch (error) {
    log.error({ error, chatId }, "Failed to handle message");
    await ctx.reply("⚠️ Something went wrong. Please try again.");
  }
}
