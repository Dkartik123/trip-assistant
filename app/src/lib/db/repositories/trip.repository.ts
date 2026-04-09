import { eq, and, gte, lte, desc } from "drizzle-orm";
import { db } from "../index";
import { trips, clients } from "../schema";
import type { Database } from "../index";

export type Trip = typeof trips.$inferSelect;
export type NewTrip = typeof trips.$inferInsert;

/**
 * Trip repository — abstracts all trip-related database operations.
 * Following repository pattern for testability and separation of concerns.
 */
export const tripRepository = {
  async findById(id: string): Promise<Trip | undefined> {
    const result = await db.query.trips.findFirst({
      where: eq(trips.id, id),
    });
    return result;
  },

  async findByInviteToken(token: string): Promise<Trip | undefined> {
    return db.query.trips.findFirst({
      where: eq(trips.inviteToken, token),
    });
  },

  async findByClientId(clientId: string): Promise<Trip | undefined> {
    return db.query.trips.findFirst({
      where: and(eq(trips.clientId, clientId), eq(trips.status, "active")),
      orderBy: desc(trips.flightDate),
    });
  },

  async findByManagerId(managerId: string): Promise<Trip[]> {
    return db.query.trips.findMany({
      where: eq(trips.managerId, managerId),
      orderBy: desc(trips.createdAt),
      with: { client: true },
    });
  },

  async findUpcoming(fromDate: Date, toDate: Date): Promise<Trip[]> {
    return db.query.trips.findMany({
      where: and(
        eq(trips.status, "active"),
        gte(trips.flightDate, fromDate),
        lte(trips.flightDate, toDate),
      ),
      with: { client: true },
    });
  },

  async create(data: NewTrip): Promise<Trip> {
    const [created] = await db.insert(trips).values(data).returning();
    return created;
  },

  async update(id: string, data: Partial<NewTrip>): Promise<Trip> {
    const [updated] = await db
      .update(trips)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(trips.id, id))
      .returning();
    return updated;
  },

  async updateClientMemory(id: string, memory: string): Promise<void> {
    await db
      .update(trips)
      .set({ clientMemory: memory, updatedAt: new Date() })
      .where(eq(trips.id, id));
  },

  async delete(id: string): Promise<void> {
    await db.delete(trips).where(eq(trips.id, id));
  },
};
