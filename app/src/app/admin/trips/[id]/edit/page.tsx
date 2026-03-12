import { TripForm } from "@/components/admin/trip-form";
import { tripRepository, clientRepository } from "@/lib/db/repositories";
import { getCurrentManager } from "@/lib/admin-session";
import { notFound } from "next/navigation";
import type {
  FlightItem,
  HotelItem,
  GuideItem,
  TransferItem,
  InsuranceItem,
  AttractionItem,
} from "@/lib/types/trip-sections";

export default async function EditTripPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const [trip, manager] = await Promise.all([
    tripRepository.findById(id),
    getCurrentManager(),
  ]);

  if (!trip) {
    notFound();
  }

  const clients = await clientRepository.findByAgencyId(manager.agencyId);

  const tripData = {
    clientId: trip.clientId,
    status: trip.status,
    managerPhone: trip.managerPhone ?? "",
    flights: (trip.flights as FlightItem[] | null) ?? [],
    hotels: (trip.hotels as HotelItem[] | null) ?? [],
    guides: (trip.guides as GuideItem[] | null) ?? [],
    transfers: (trip.transfers as TransferItem[] | null) ?? [],
    insurances: (trip.insurances as InsuranceItem[] | null) ?? [],
    attractions: (trip.attractions as AttractionItem[] | null) ?? [],
    notes: trip.notes ?? "",
  };

  return (
    <TripForm
      initialData={tripData}
      isEdit
      tripId={id}
      managerId={manager.id}
      agencyId={manager.agencyId}
      clients={clients.map((c) => ({ id: c.id, name: c.name, language: c.language ?? "en" }))}
    />
  );
}
