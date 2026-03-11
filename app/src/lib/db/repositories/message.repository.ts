import { eq, and, desc, lt, inArray, gte, count } from "drizzle-orm";
import { db } from "../index";
import { messages, trips } from "../schema";

export type Message = typeof messages.$inferSelect;
export type NewMessage = typeof messages.$inferInsert;

/**
 * Message repository — chat history storage.
 */
export const messageRepository = {
  async findByTripId(tripId: string, limit: number = 10): Promise<Message[]> {
    return db.query.messages.findMany({
      where: eq(messages.tripId, tripId),
      orderBy: desc(messages.createdAt),
      limit,
    });
  },

  async findByManagerTrips(managerId: string, limit: number = 100) {
    const managerTrips = await db.query.trips.findMany({
      where: eq(trips.managerId, managerId),
      columns: { id: true },
    });
    const tripIds = managerTrips.map((t) => t.id);
    if (tripIds.length === 0) return [];

    return db.query.messages.findMany({
      where: inArray(messages.tripId, tripIds),
      orderBy: desc(messages.createdAt),
      limit,
      with: { trip: { with: { client: true } } },
    });
  },

  async countTodayByManager(managerId: string): Promise<number> {
    const managerTrips = await db.query.trips.findMany({
      where: eq(trips.managerId, managerId),
      columns: { id: true },
    });
    const tripIds = managerTrips.map((t) => t.id);
    if (tripIds.length === 0) return 0;

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const result = await db
      .select({ value: count() })
      .from(messages)
      .where(
        and(inArray(messages.tripId, tripIds), gte(messages.createdAt, today)),
      );
    return result[0]?.value ?? 0;
  },

  async create(data: NewMessage): Promise<Message> {
    const [created] = await db.insert(messages).values(data).returning();
    return created;
  },

  /**
   * Delete messages older than given date (for auto-cleanup).
   * Used by the 6-month retention cron job.
   */
  async deleteOlderThan(date: Date): Promise<number> {
    const deleted = await db
      .delete(messages)
      .where(lt(messages.createdAt, date))
      .returning();
    return deleted.length;
  },
};
