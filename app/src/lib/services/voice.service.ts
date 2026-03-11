import OpenAI from "openai";
import { createLogger } from "@/lib/logger";

const log = createLogger("voice-service");

let _client: OpenAI | null = null;
function getClient(): OpenAI {
  if (!_client) {
    _client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY! });
  }
  return _client;
}

/**
 * Transcribe a voice message (ogg/opus) to text using Whisper API.
 * @param audioBuffer - Raw audio buffer (ogg format from Telegram)
 * @param language - Optional language hint (ISO 639-1)
 */
export async function transcribeVoice(
  audioBuffer: Buffer,
  language?: string,
): Promise<string> {
  const client = getClient();

  try {
    // Create a File object from buffer for the API
    const file = new File([new Uint8Array(audioBuffer)], "voice.ogg", {
      type: "audio/ogg",
    });

    const transcription = await Promise.race([
      client.audio.transcriptions.create({
        model: "whisper-1",
        file,
        ...(language ? { language } : {}),
      }),
      new Promise<never>((_, reject) =>
        setTimeout(
          () => reject(new Error("Whisper transcription timeout")),
          30_000,
        ),
      ),
    ]);

    log.debug(
      { textLength: transcription.text.length },
      "Voice transcribed successfully",
    );

    return transcription.text;
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    log.error({ error }, "Voice transcription failed");
    throw new Error(`Failed to transcribe voice message: ${message}`);
  }
}
