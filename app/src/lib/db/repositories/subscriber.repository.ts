import { eq, and } from "drizzle-orm";
import { db } from "../index";
import { tripSubscribers } from "../schema";

export type TripSubscriber = typeof tripSubscribers.$inferSelect;
export type NewTripSubscriber = typeof tripSubscribers.$inferInsert;

/**
 * Trip subscriber repository — manages Telegram users subscribed to a trip.
 * Multiple users can follow a single trip and receive updates/use bot commands.
 */
export const subscriberRepository = {
  /** Find all subscribers for a trip */
  async findByTripId(tripId: string): Promise<TripSubscriber[]> {
    return db.query.tripSubscribers.findMany({
      where: eq(tripSubscribers.tripId, tripId),
    });
  },

  /** Find a subscriber by their Telegram chat ID (across all trips) */
  async findByChatId(chatId: string): Promise<TripSubscriber | undefined> {
    return db.query.tripSubscribers.findFirst({
      where: eq(tripSubscribers.telegramChatId, chatId),
    });
  },

  /** Find a specific subscriber for a trip + chat combination */
  async findByTripAndChat(
    tripId: string,
    chatId: string,
  ): Promise<TripSubscriber | undefined> {
    return db.query.tripSubscribers.findFirst({
      where: and(
        eq(tripSubscribers.tripId, tripId),
        eq(tripSubscribers.telegramChatId, chatId),
      ),
    });
  },

  /** Add a subscriber (idempotent — returns existing if already subscribed) */
  async subscribe(data: {
    tripId: string;
    telegramChatId: string;
    name?: string;
    language?: string;
  }): Promise<TripSubscriber> {
    // Check if already subscribed
    const existing = await this.findByTripAndChat(
      data.tripId,
      data.telegramChatId,
    );
    if (existing) {
      // Update name if changed
      if (data.name && data.name !== existing.name) {
        return this.update(existing.id, { name: data.name });
      }
      return existing;
    }

    const [created] = await db
      .insert(tripSubscribers)
      .values({
        tripId: data.tripId,
        telegramChatId: data.telegramChatId,
        name: data.name ?? null,
        language: data.language ?? "en",
      })
      .returning();
    return created;
  },

  /** Remove a subscriber */
  async unsubscribe(tripId: string, chatId: string): Promise<void> {
    await db
      .delete(tripSubscribers)
      .where(
        and(
          eq(tripSubscribers.tripId, tripId),
          eq(tripSubscribers.telegramChatId, chatId),
        ),
      );
  },

  /** Update subscriber fields */
  async update(
    id: string,
    data: Partial<Pick<TripSubscriber, "name" | "language">>,
  ): Promise<TripSubscriber> {
    const [updated] = await db
      .update(tripSubscribers)
      .set(data)
      .where(eq(tripSubscribers.id, id))
      .returning();
    return updated;
  },

  /** Delete all subscribers for a trip */
  async deleteByTripId(tripId: string): Promise<void> {
    await db.delete(tripSubscribers).where(eq(tripSubscribers.tripId, tripId));
  },
};
