import { getCurrentManager } from "@/lib/admin-session";
import { clientRepository } from "@/lib/db/repositories";
import { db } from "@/lib/db";
import { trips } from "@/lib/db/schema";
import { eq, count } from "drizzle-orm";
import { ClientsListClient } from "./clients-list-client";

export default async function ClientsPage() {
  const manager = await getCurrentManager();
  const clients = await clientRepository.findByAgencyId(manager.agencyId);

  // Count trips per client
  const tripCounts = await db
    .select({ clientId: trips.clientId, count: count() })
    .from(trips)
    .where(eq(trips.managerId, manager.id))
    .groupBy(trips.clientId);

  const tripCountMap = new Map(tripCounts.map((r) => [r.clientId, r.count]));

  const serialized = clients.map((c) => ({
    id: c.id,
    name: c.name,
    phone: c.phone,
    email: c.email,
    telegramChatId: c.telegramChatId,
    whatsappPhone: c.whatsappPhone,
    language: c.language ?? "en",
    tripsCount: tripCountMap.get(c.id) ?? 0,
    lastActivity: null as string | null,
  }));

  return <ClientsListClient clients={serialized} agencyId={manager.agencyId} />;
}
