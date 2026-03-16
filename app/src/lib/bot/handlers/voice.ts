import { Context } from "grammy";
import { createLogger } from "@/lib/logger";
import {
  clientRepository,
  tripRepository,
  messageRepository,
  subscriberRepository,
} from "@/lib/db/repositories";
import { generateResponse } from "@/lib/services/ai.service";
import { transcribeVoice } from "@/lib/services/voice.service";

const log = createLogger("bot:voice");

/**
 * Handle incoming voice messages.
 * Downloads ogg → Whisper transcription → Claude AI → reply.
 */
export async function handleVoice(ctx: Context): Promise<void> {
  const chatId = ctx.chat?.id?.toString();
  const voice = ctx.message?.voice;

  if (!chatId || !voice) return;

  // Reject voice messages longer than 60 seconds
  if (voice.duration > 60) {
    await ctx.reply(
      "🎤 Voice message is too long (max 60 seconds). Please send a shorter message or type your question.",
    );
    return;
  }

  try {
    const isGroup =
      ctx.chat?.type === "group" || ctx.chat?.type === "supergroup";

    // Resolve trip: client-based or subscriber-based
    let trip;
    let language = "en";

    const client = isGroup
      ? await clientRepository.findByTelegramGroupId(chatId)
      : await clientRepository.findByTelegramChatId(chatId);

    if (client) {
      trip = await tripRepository.findByClientId(client.id);
      language = client.language ?? "en";
    }

    if (!trip) {
      const subscriber = await subscriberRepository.findByChatId(chatId);
      if (subscriber) {
        trip = await tripRepository.findById(subscriber.tripId);
        language = subscriber.language ?? "en";
      }
    }

    if (!trip) {
      await ctx.reply(
        "🔗 I don't recognize you yet. Please use the link from your travel agency to connect.",
      );
      return;
    }

    // Show typing indicator
    await ctx.replyWithChatAction("typing");

    // Download voice file from Telegram
    const file = await ctx.getFile();
    const fileUrl = `https://api.telegram.org/file/bot${process.env.TELEGRAM_BOT_TOKEN}/${file.file_path}`;
    const response = await fetch(fileUrl);
    const audioBuffer = Buffer.from(await response.arrayBuffer());

    // Transcribe with Whisper
    const transcribedText = await transcribeVoice(audioBuffer, language);

    if (!transcribedText.trim()) {
      await ctx.reply("🎤 I couldn't understand the voice message. Try again?");
      return;
    }

    // Load message history
    const history = await messageRepository.findByTripId(trip.id, 10);

    // Generate AI response
    const aiResponse = await generateResponse(trip, history, transcribedText);

    // Save messages
    await messageRepository.create({
      tripId: trip.id,
      chatId,
      channel: "telegram",
      role: "user",
      content: transcribedText,
      contentType: "voice",
    });

    await messageRepository.create({
      tripId: trip.id,
      chatId,
      channel: "telegram",
      role: "assistant",
      content: aiResponse,
      contentType: "text",
    });

    // Reply with transcription context + answer
    // Escape transcribed text to avoid breaking HTML parse_mode
    const safeTranscription = transcribedText
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;");
    await ctx.reply(`🎤 "${safeTranscription}"\n\n${aiResponse}`, { parse_mode: "HTML" });
  } catch (error) {
    log.error({ error, chatId }, "Failed to handle voice message");
    await ctx.reply("⚠️ Could not process voice message. Try typing instead.");
  }
}
