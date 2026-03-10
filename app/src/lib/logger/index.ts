import pino from "pino";

const isDev = process.env.NODE_ENV !== "production";

export const logger = pino({
  level: process.env.LOG_LEVEL || (isDev ? "debug" : "info"),
  transport: isDev
    ? {
        target: "pino-pretty",
        options: {
          colorize: true,
          translateTime: "HH:MM:ss",
          ignore: "pid,hostname",
        },
      }
    : undefined,
  // Production: JSON logs (structured, machine-readable)
  ...(isDev ? {} : { timestamp: pino.stdTimeFunctions.isoTime }),
});

/**
 * Create a child logger with a specific context name.
 * Usage: `const log = createLogger("bot");`
 */
export function createLogger(context: string) {
  return logger.child({ context });
}
