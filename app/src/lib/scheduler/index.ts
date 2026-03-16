import cron from "node-cron";
import { createLogger } from "@/lib/logger";
import { notificationRepository } from "@/lib/db/repositories";
import { getBot } from "@/lib/bot";

const log = createLogger("scheduler");

/**
 * Initialize all cron jobs.
 * Called once at app startup from instrumentation.ts.
 */
export function initScheduler() {
  // ─── Send pending notifications every 5 minutes ────────
  cron.schedule("*/5 * * * *", async () => {
    try {
      const now = new Date();
      const pending = await notificationRepository.findPending(now);

      if (pending.length === 0) return;

      log.info({ count: pending.length }, "Processing pending notifications");

      const bot = getBot();

      for (const notification of pending) {
        try {
          // Get trip with client data
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const trip = (notification as any).trip;
          const client = trip?.client;

          if (!client?.telegramChatId && !client?.telegramGroupId) {
            log.warn(
              { notificationId: notification.id },
              "No Telegram chat linked, skipping",
            );
            await notificationRepository.markFailed(notification.id);
            continue;
          }

          const chatId = client.telegramChatId || client.telegramGroupId;

          const message =
            notification.content ||
            buildNotificationMessage(notification.type, trip);

          await bot.api.sendMessage(chatId, message);
          await notificationRepository.markSent(notification.id);

          log.info(
            { notificationId: notification.id, type: notification.type },
            "Notification sent",
          );
        } catch (err) {
          log.error(
            { error: err, notificationId: notification.id },
            "Failed to send notification",
          );
          await notificationRepository.markFailed(notification.id);
        }
      }
    } catch (error) {
      log.error({ error }, "Notification scheduler error");
    }
  });

  // ─── Cleanup old messages (daily at 3am) ───────────────
  cron.schedule("0 3 * * *", async () => {
    try {
      const sixMonthsAgo = new Date();
      sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

      const { messageRepository } = await import("@/lib/db/repositories");
      const deleted = await messageRepository.deleteOlderThan(sixMonthsAgo);

      if (deleted > 0) {
        log.info({ deleted }, "Old messages cleaned up");
      }
    } catch (error) {
      log.error({ error }, "Message cleanup error");
    }
  });

  log.info("Scheduler initialized");
}

/**
 * Build notification text based on type and trip data.
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function buildNotificationMessage(type: string, trip: any): string {
  switch (type) {
    case "24h_before":
      return [
        "✈️ Your flight is in 24 hours!",
        "",
        `Flight: ${trip.flightNumber || "N/A"}`,
        `Route: ${trip.departureCity || "?"} → ${trip.arrivalCity || "?"}`,
        `Date: ${trip.flightDate ? new Date(trip.flightDate).toLocaleDateString("en-GB") : "N/A"}`,
        "",
        "📋 Checklist:",
        "✅ Passport",
        "✅ Boarding pass / online check-in",
        "✅ Travel insurance",
        "✅ Hotel voucher",
      ].join("\n");

    case "3h_before":
      return [
        "✈️ Your flight is in 3 hours!",
        "",
        `Flight: ${trip.flightNumber || "N/A"}`,
        trip.gate ? `Gate: ${trip.gate}` : "",
        `Airport: ${trip.departureAirport || "N/A"}`,
        "",
        "🕐 Time to head to the airport!",
      ]
        .filter(Boolean)
        .join("\n");

    case "arrival":
      return [
        `🌍 Welcome to ${trip.arrivalCity || "your destination"}!`,
        "",
        trip.hotelName ? `🏨 Hotel: ${trip.hotelName}` : "",
        trip.hotelAddress ? `📍 ${trip.hotelAddress}` : "",
        trip.transferInfo ? `🚗 Transfer: ${trip.transferInfo}` : "",
        trip.transferDriverPhone
          ? `📞 Driver: ${trip.transferDriverPhone}`
          : "",
        trip.transferMeetingPoint
          ? `📍 Meeting point: ${trip.transferMeetingPoint}`
          : "",
      ]
        .filter(Boolean)
        .join("\n");

    default:
      return "📢 You have a notification about your trip.";
  }
}
