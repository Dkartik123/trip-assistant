import { eq, and, lte, desc, lt } from "drizzle-orm";
import { db } from "../index";
import { messages } from "../schema";

export type Message = typeof messages.$inferSelect;
export type NewMessage = typeof messages.$inferInsert;

/**
 * Message repository — chat history storage.
 */
export const messageRepository = {
  async findByTripId(
    tripId: string,
    limit: number = 10,
  ): Promise<Message[]> {
    return db.query.messages.findMany({
      where: eq(messages.tripId, tripId),
      orderBy: desc(messages.createdAt),
      limit,
    });
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
