import { Context } from "grammy";
import { createLogger } from "@/lib/logger";
import {
  clientRepository,
  tripRepository,
  messageRepository,
  subscriberRepository,
} from "@/lib/db/repositories";

const log = createLogger("bot:support");

/**
 * In-memory set of chatIds currently in "support mode".
 * When in support mode, user messages are NOT auto-replied by AI;
 * they are saved as regular messages for the operator to see in admin panel.
 */
const supportModeChats = new Set<string>();

/** Check if a chat is in support mode */
export function isInSupportMode(chatId: string): boolean {
  return supportModeChats.has(chatId);
}

/**
 * Resolve trip for a chat (same logic as other handlers).
 */
async function resolveTripForChat(chatId: string, isGroup: boolean) {
  const client = isGroup
    ? await clientRepository.findByTelegramGroupId(chatId)
    : await clientRepository.findByTelegramChatId(chatId);

  if (client) {
    const trip = await tripRepository.findByClientId(client.id);
    if (trip) return { trip, language: client.language ?? "en" };
  }

  const subscriber = await subscriberRepository.findByChatId(chatId);
  if (subscriber) {
    const trip = await tripRepository.findById(subscriber.tripId);
    if (trip) return { trip, language: subscriber.language ?? "en" };
  }

  return null;
}

/**
 * /support — Switch to human operator mode.
 * Messages will no longer be answered by AI; operator will respond from admin panel.
 */
export async function handleSupportCommand(ctx: Context): Promise<void> {
  const chatId = ctx.chat?.id?.toString();
  if (!chatId) return;

  try {
    const isGroup = ctx.chat?.type === "group" || ctx.chat?.type === "supergroup";
    const result = await resolveTripForChat(chatId, isGroup);

    if (!result) {
      await ctx.reply(
        "🔗 I don't recognize you yet. Please use the link from your travel agency to connect.",
      );
      return;
    }

    supportModeChats.add(chatId);

    // Save a system message so operator sees the support request
    await messageRepository.create({
      tripId: result.trip.id,
      chatId,
      channel: "telegram",
      role: "user",
      content: "🆘 Клиент запросил связь с оператором",
      contentType: "text",
    });

    await ctx.reply(
      "👤 Вы переключены на оператора.\n\n" +
        "Ваши сообщения будут переданы менеджеру. " +
        "Оператор ответит вам в ближайшее время.\n\n" +
        "Чтобы вернуться к AI-помощнику, отправьте /ai",
    );

    log.info({ chatId, tripId: result.trip.id }, "Client entered support mode");
  } catch (error) {
    log.error({ error, chatId }, "Failed to handle /support");
    await ctx.reply("⚠️ Something went wrong. Please try again.");
  }
}

/**
 * /ai — Switch back to AI assistant mode.
 */
export async function handleAiCommand(ctx: Context): Promise<void> {
  const chatId = ctx.chat?.id?.toString();
  if (!chatId) return;

  const wasInSupport = supportModeChats.delete(chatId);

  if (wasInSupport) {
    await ctx.reply(
      "🤖 Вы вернулись к AI-ассистенту.\n\n" +
        "Задавайте вопросы о вашей поездке, и я помогу!",
    );
    log.info({ chatId }, "Client returned to AI mode");
  } else {
    await ctx.reply(
      "🤖 Вы уже общаетесь с AI-ассистентом.\n\n" +
        "Если нужен оператор, отправьте /support",
    );
  }
}

/**
 * Handle a user message while in support mode.
 * Saves message to DB (for operator to see) but does NOT generate AI response.
 */
export async function handleSupportMessage(ctx: Context): Promise<void> {
  const chatId = ctx.chat?.id?.toString();
  const userText = ctx.message?.text;
  if (!chatId || !userText) return;

  try {
    const isGroup = ctx.chat?.type === "group" || ctx.chat?.type === "supergroup";
    const result = await resolveTripForChat(chatId, isGroup);
    if (!result) return;

    // Save user message for operator to see in admin panel
    await messageRepository.create({
      tripId: result.trip.id,
      chatId,
      channel: "telegram",
      role: "user",
      content: userText,
      contentType: "text",
    });

    log.debug({ chatId, tripId: result.trip.id }, "Support mode message saved");
  } catch (error) {
    log.error({ error, chatId }, "Failed to save support message");
  }
}
