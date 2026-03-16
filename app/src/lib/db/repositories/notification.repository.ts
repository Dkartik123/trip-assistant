import { eq, and, lte } from "drizzle-orm";
import { db } from "../index";
import { notifications } from "../schema";

export type Notification = typeof notifications.$inferSelect;
export type NewNotification = typeof notifications.$inferInsert;

/**
 * Notification repository — scheduled notification management.
 */
export const notificationRepository = {
  async findPending(beforeDate: Date): Promise<Notification[]> {
    return db.query.notifications.findMany({
      where: and(
        eq(notifications.status, "pending"),
        lte(notifications.scheduledAt, beforeDate),
      ),
      with: {
        trip: {
          with: { client: true },
        },
      },
    });
  },

  async findByTripId(tripId: string): Promise<Notification[]> {
    return db.query.notifications.findMany({
      where: eq(notifications.tripId, tripId),
    });
  },

  async create(data: NewNotification): Promise<Notification> {
    const [created] = await db.insert(notifications).values(data).returning();
    return created;
  },

  async createMany(data: NewNotification[]): Promise<Notification[]> {
    if (data.length === 0) return [];
    return db.insert(notifications).values(data).returning();
  },

  async markSent(id: string): Promise<void> {
    await db
      .update(notifications)
      .set({ status: "sent", sentAt: new Date() })
      .where(eq(notifications.id, id));
  },

  async markFailed(id: string): Promise<void> {
    await db
      .update(notifications)
      .set({ status: "failed" })
      .where(eq(notifications.id, id));
  },

  /**
   * Delete all pending notifications for a trip (used when trip is updated —
   * old notifications are replaced with new ones).
   */
  async deletePendingByTripId(tripId: string): Promise<void> {
    await db
      .delete(notifications)
      .where(
        and(
          eq(notifications.tripId, tripId),
          eq(notifications.status, "pending"),
        ),
      );
  },
};
