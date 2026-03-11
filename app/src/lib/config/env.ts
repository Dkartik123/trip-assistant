import { z } from "zod";

/**
 * Server-side environment variables schema.
 * Validated at app startup — fail fast if misconfigured.
 */
const envSchema = z.object({
  // Database
  DATABASE_URL: z.string().url(),

  // Next.js
  NEXT_PUBLIC_APP_URL: z.string().url().default("http://localhost:3000"),
  NEXTAUTH_URL: z.string().url().default("http://localhost:3000"),
  NEXTAUTH_SECRET: z.string().min(16),

  // Telegram
  TELEGRAM_BOT_TOKEN: z.string().min(1),
  TELEGRAM_WEBHOOK_SECRET: z.string().min(8).default("default-webhook-secret"),

  // AI
  GEMINI_API_KEY: z.string().startsWith("AIza"),
  OPENAI_API_KEY: z.string().startsWith("sk-"),

  // WhatsApp (optional in MVP)
  TWILIO_ACCOUNT_SID: z.string().optional().default(""),
  TWILIO_AUTH_TOKEN: z.string().optional().default(""),
  TWILIO_WHATSAPP_FROM: z.string().optional().default(""),

  // Sentry (optional)
  SENTRY_DSN: z.string().optional().default(""),

  // App
  NODE_ENV: z
    .enum(["development", "production", "test"])
    .default("development"),
  LOG_LEVEL: z
    .enum(["fatal", "error", "warn", "info", "debug", "trace"])
    .default("info"),
});

export type Env = z.infer<typeof envSchema>;

/**
 * Validated environment. Import this instead of using `process.env` directly.
 * Throws at startup if any required variable is missing or invalid.
 */
function validateEnv(): Env {
  const parsed = envSchema.safeParse(process.env);

  if (!parsed.success) {
    console.error(
      "❌ Invalid environment variables:",
      JSON.stringify(parsed.error.flatten().fieldErrors, null, 2),
    );
    throw new Error("Invalid environment variables");
  }

  return parsed.data;
}

export const env = validateEnv();
