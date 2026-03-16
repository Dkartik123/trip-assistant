import crypto from "crypto";
import { createLogger } from "@/lib/logger";
import {
  tripRepository,
  clientRepository,
  notificationRepository,
  subscriberRepository,
  type Trip,
  type NewTrip,
} from "@/lib/db/repositories";
import { tripMessageService, translateParts } from "./trip-message.service";

const log = createLogger("trip-service");

/**
 * Generate a unique invite token for deep-link.
 */
function generateInviteToken(): string {
  return crypto.randomBytes(32).toString("hex");
}

/**
 * Trip service — business logic layer.
 * Follows single-responsibility: only trip lifecycle operations.
 */
export const tripService = {
  async createTrip(data: Omit<NewTrip, "inviteToken">): Promise<Trip> {
    const inviteToken = generateInviteToken();
    const trip = await tripRepository.create({
      ...data,
      inviteToken,
    });

    log.info({ tripId: trip.id }, "Trip created");

    // Schedule notifications if flight date is set
    if (trip.flightDate) {
      await this.scheduleNotifications(trip);
    }

    return trip;
  },

  async updateTrip(id: string, data: Partial<NewTrip>): Promise<Trip> {
    const oldTrip = await tripRepository.findById(id);
    const trip = await tripRepository.update(id, data);

    log.info({ tripId: id }, "Trip updated");

    // Reschedule notifications if flight date changed
    if (data.flightDate && oldTrip?.flightDate !== data.flightDate) {
      await notificationRepository.deletePendingByTripId(id);
      await this.scheduleNotifications(trip);
    }

    // Push only changed sections to Telegram (fire-and-forget)
    if (oldTrip) {
      this.notifyTelegramClient(oldTrip, trip).catch((err) =>
        log.warn({ err, tripId: id }, "Failed to push trip update to Telegram"),
      );
    }

    return trip;
  },

  /**
   * Send only the changed sections to ALL trip subscribers' Telegram chats.
   * Each subscriber gets the message translated to their language.
   * Also sends to the primary client's chat for backward compatibility.
   */
  async notifyTelegramClient(oldTrip: Trip, newTrip: Trip): Promise<void> {
    // Build diff message — only changed sections
    const parts = tripMessageService.formatChangedSections(oldTrip, newTrip);
    if (!parts) {
      log.debug(
        { tripId: newTrip.id },
        "No section changes detected, skipping notification",
      );
      return;
    }

    // Dynamically import bot to avoid circular dependency
    const { getBot } = await import("@/lib/bot");
    const bot = getBot();

    // Collect all chat IDs to notify (subscribers + legacy client chat)
    const subscribers = await subscriberRepository.findByTripId(newTrip.id);
    const notifiedChatIds = new Set<string>();

    // 1) Notify all subscribers (each in their language)
    for (const sub of subscribers) {
      if (notifiedChatIds.has(sub.telegramChatId)) continue;
      notifiedChatIds.add(sub.telegramChatId);

      try {
        const translated = await translateParts(parts, sub.language);
        for (const part of translated) {
          await bot.api.sendMessage(sub.telegramChatId, part, {
            parse_mode: "HTML",
          });
        }
      } catch (err) {
        log.warn(
          { err, chatId: sub.telegramChatId },
          "Failed to notify subscriber",
        );
      }
    }

    // 2) Fallback: notify primary client if not already reached via subscribers
    const client = await clientRepository.findById(newTrip.clientId);
    if (client) {
      const chatId = client.telegramChatId || client.telegramGroupId;
      if (chatId && !notifiedChatIds.has(chatId)) {
        try {
          const translated = await translateParts(parts, client.language);
          for (const part of translated) {
            await bot.api.sendMessage(chatId, part, { parse_mode: "HTML" });
          }
          notifiedChatIds.add(chatId);
        } catch (err) {
          log.warn({ err, chatId }, "Failed to notify primary client");
        }
      }
    }

    if (notifiedChatIds.size > 0) {
      log.info(
        { tripId: newTrip.id, recipientCount: notifiedChatIds.size },
        "Pushed trip changes to Telegram subscribers",
      );
    }
  },

  async activateTrip(id: string): Promise<Trip> {
    return tripRepository.update(id, { status: "active" });
  },

  async completeTrip(id: string): Promise<Trip> {
    return tripRepository.update(id, { status: "completed" });
  },

  async getByInviteToken(token: string): Promise<Trip | undefined> {
    return tripRepository.findByInviteToken(token);
  },

  async getActiveTripForClient(clientId: string): Promise<Trip | undefined> {
    return tripRepository.findByClientId(clientId);
  },

  /**
   * Generate Telegram deep-link for this trip.
   */
  getDeepLink(trip: Trip, botUsername: string): string {
    return `https://t.me/${botUsername}?start=${trip.inviteToken}`;
  },

  /**
   * Schedule standard notifications for a trip.
   * Called on trip create/update.
   */
  async scheduleNotifications(trip: Trip): Promise<void> {
    if (!trip.flightDate) return;

    const flightDate = new Date(trip.flightDate);
    const now = new Date();

    const notifs: Array<{
      type: "24h_before" | "3h_before" | "arrival";
      scheduledAt: Date;
    }> = [];

    // 24h before flight
    const h24 = new Date(flightDate.getTime() - 24 * 60 * 60 * 1000);
    if (h24 > now) {
      notifs.push({ type: "24h_before", scheduledAt: h24 });
    }

    // 3h before flight
    const h3 = new Date(flightDate.getTime() - 3 * 60 * 60 * 1000);
    if (h3 > now) {
      notifs.push({ type: "3h_before", scheduledAt: h3 });
    }

    // Estimated arrival (~3h after departure for short-haul)
    const arrival = new Date(flightDate.getTime() + 3 * 60 * 60 * 1000);
    if (arrival > now) {
      notifs.push({ type: "arrival", scheduledAt: arrival });
    }

    if (notifs.length > 0) {
      await notificationRepository.createMany(
        notifs.map((n) => ({
          tripId: trip.id,
          type: n.type,
          scheduledAt: n.scheduledAt,
          status: "pending" as const,
        })),
      );

      log.info(
        { tripId: trip.id, count: notifs.length },
        "Notifications scheduled",
      );
    }
  },
};
