import { TripDetailClient } from "@/components/admin/trip-detail";
import {
  tripRepository,
  messageRepository,
  clientRepository,
  subscriberRepository,
} from "@/lib/db/repositories";
import {
  buildGoogleCalendarUrl,
  canGenerateWalletPasses,
} from "@/lib/services/trip-export.service";
import { notFound } from "next/navigation";
import type {
  FlightItem,
  HotelItem,
  GuideItem,
  TransferItem,
  InsuranceItem,
  AttractionItem,
} from "@/lib/types/trip-sections";

export default async function TripDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const trip = await tripRepository.findById(id);

  if (!trip) {
    notFound();
  }

  const [client, rawMessages, subscribers] = await Promise.all([
    clientRepository.findById(trip.clientId),
    messageRepository.findByTripId(id, 50),
    subscriberRepository.findByTripId(id),
  ]);

  const tripData = {
    id: trip.id,
    clientName: client?.name ?? "—",
    clientPhone: client?.phone ?? null,
    status: trip.status as "draft" | "active" | "completed",
    managerPhone: trip.managerPhone,
    inviteToken: trip.inviteToken,
    notes: trip.notes,
    flights: (trip.flights as FlightItem[] | null) ?? [],
    hotels: (trip.hotels as HotelItem[] | null) ?? [],
    guides: (trip.guides as GuideItem[] | null) ?? [],
    transfers: (trip.transfers as TransferItem[] | null) ?? [],
    insurances: (trip.insurances as InsuranceItem[] | null) ?? [],
    attractions: (trip.attractions as AttractionItem[] | null) ?? [],
  };

  const messages = rawMessages
    .sort(
      (a, b) =>
        new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime(),
    )
    .map((m) => ({
      id: m.id,
      role: m.role as "user" | "assistant",
      content: m.content,
      createdAt: m.createdAt.toISOString(),
    }));

  const subscriberData = subscribers.map((s) => ({
    id: s.id,
    name: s.name ?? "Unknown",
    telegramChatId: s.telegramChatId,
    language: s.language ?? "en",
    joinedAt: s.joinedAt.toISOString(),
  }));

  return (
    <TripDetailClient
      id={id}
      trip={tripData}
      messages={messages}
      subscribers={subscriberData}
      googleCalendarUrl={buildGoogleCalendarUrl(trip, client?.name)}
      walletEnabled={canGenerateWalletPasses()}
    />
  );
}
