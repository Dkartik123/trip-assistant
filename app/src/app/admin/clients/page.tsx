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
    firstName: c.firstName,
    lastName: c.lastName,
    phone: c.phone,
    email: c.email,
    country: c.country,
    language: c.language ?? "en",
    locale: c.locale,
    timezone: c.timezone ?? "UTC",
    telegramChatId: c.telegramChatId,
    telegramUsername: c.telegramUsername,
    whatsappPhone: c.whatsappPhone,
    preferredMessenger: c.preferredMessenger,
    clientStatus: c.clientStatus ?? "active",
    source: c.source,
    notes: c.notes,
    preferredContactTime: c.preferredContactTime,
    voiceEnabled: c.voiceEnabled ?? true,
    notificationEnabled: c.notificationEnabled ?? true,
    emergencyContactName: c.emergencyContactName,
    emergencyContactPhone: c.emergencyContactPhone,
    consentMarketing: c.consentMarketing ?? false,
    consentMessaging: c.consentMessaging ?? false,
    consentPrivacy: c.consentPrivacy ?? false,
    tripsCount: tripCountMap.get(c.id) ?? 0,
    lastActivity: null as string | null,
  }));

  return <ClientsListClient clients={serialized} agencyId={manager.agencyId} />;
}
