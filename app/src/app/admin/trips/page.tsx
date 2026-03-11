import { getCurrentManager } from "@/lib/admin-session";
import { tripRepository } from "@/lib/db/repositories";
import { TripsListClient } from "./trips-list-client";

export default async function TripsListPage() {
  const manager = await getCurrentManager();
  const trips = await tripRepository.findByManagerId(manager.id);

  const serialized = trips.map((t) => ({
    id: t.id,
    clientName:
      (t as unknown as { client: { name: string } }).client?.name ?? "—",
    departureCity: t.departureCity ?? "—",
    arrivalCity: t.arrivalCity ?? "—",
    flightDate: t.flightDate?.toISOString() ?? "",
    flightNumber: t.flightNumber ?? "—",
    hotelName: t.hotelName ?? "—",
    status: t.status as "draft" | "active" | "completed",
    createdAt: t.createdAt.toISOString(),
  }));

  return <TripsListClient trips={serialized} />;
}
