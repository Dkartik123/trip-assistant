import crypto from "crypto";
import { createLogger } from "@/lib/logger";
import {
  tripRepository,
  clientRepository,
  notificationRepository,
  type Trip,
  type NewTrip,
} from "@/lib/db/repositories";

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

  async updateTrip(
    id: string,
    data: Partial<NewTrip>,
  ): Promise<Trip> {
    const oldTrip = await tripRepository.findById(id);
    const trip = await tripRepository.update(id, data);

    log.info({ tripId: id }, "Trip updated");

    // Reschedule notifications if flight date changed
    if (data.flightDate && oldTrip?.flightDate !== data.flightDate) {
      await notificationRepository.deletePendingByTripId(id);
      await this.scheduleNotifications(trip);
    }

    return trip;
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

  async getActiveTripForClient(
    clientId: string,
  ): Promise<Trip | undefined> {
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
