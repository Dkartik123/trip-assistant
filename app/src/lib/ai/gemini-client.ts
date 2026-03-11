import { GoogleGenAI } from "@google/genai";

let _client: GoogleGenAI | null = null;

/**
 * Singleton Gemini AI client.
 */
export function getGeminiClient(): GoogleGenAI {
  if (!_client) {
    _client = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY! });
  }
  return _client;
}
