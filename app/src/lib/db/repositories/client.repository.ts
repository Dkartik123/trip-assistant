import { eq, or, desc } from "drizzle-orm";
import { db } from "../index";
import { clients } from "../schema";

export type Client = typeof clients.$inferSelect;
export type NewClient = typeof clients.$inferInsert;

/**
 * Client repository — abstracts all client-related database operations.
 */
export const clientRepository = {
  async findById(id: string): Promise<Client | undefined> {
    return db.query.clients.findFirst({
      where: eq(clients.id, id),
    });
  },

  async findByTelegramChatId(chatId: string): Promise<Client | undefined> {
    return db.query.clients.findFirst({
      where: eq(clients.telegramChatId, chatId),
    });
  },

  async findByTelegramGroupId(groupId: string): Promise<Client | undefined> {
    return db.query.clients.findFirst({
      where: eq(clients.telegramGroupId, groupId),
    });
  },

  async findByWhatsappPhone(phone: string): Promise<Client | undefined> {
    return db.query.clients.findFirst({
      where: eq(clients.whatsappPhone, phone),
    });
  },

  /**
   * Find client by any messenger identifier.
   */
  async findByMessenger(
    chatId: string,
    channel: "telegram" | "whatsapp",
  ): Promise<Client | undefined> {
    if (channel === "telegram") {
      return db.query.clients.findFirst({
        where: or(
          eq(clients.telegramChatId, chatId),
          eq(clients.telegramGroupId, chatId),
        ),
      });
    }
    return db.query.clients.findFirst({
      where: eq(clients.whatsappPhone, chatId),
    });
  },

  async create(data: NewClient): Promise<Client> {
    const [created] = await db.insert(clients).values(data).returning();
    return created;
  },

  async findByAgencyId(agencyId: string): Promise<Client[]> {
    return db.query.clients.findMany({
      where: eq(clients.agencyId, agencyId),
      orderBy: desc(clients.createdAt),
    });
  },

  async update(id: string, data: Partial<NewClient>): Promise<Client> {
    const [updated] = await db
      .update(clients)
      .set(data)
      .where(eq(clients.id, id))
      .returning();
    return updated;
  },

  async linkTelegramChat(clientId: string, chatId: string): Promise<Client> {
    return this.update(clientId, { telegramChatId: chatId });
  },

  async linkTelegramGroup(clientId: string, groupId: string): Promise<Client> {
    return this.update(clientId, { telegramGroupId: groupId });
  },
};
