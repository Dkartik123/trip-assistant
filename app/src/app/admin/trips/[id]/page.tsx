import { TripDetailClient } from "@/components/admin/trip-detail";
import {
  tripRepository,
  messageRepository,
  clientRepository,
} from "@/lib/db/repositories";
import { notFound } from "next/navigation";

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

  const client = await clientRepository.findById(trip.clientId);
  const rawMessages = await messageRepository.findByTripId(id, 50);

  const tripData = {
    id: trip.id,
    clientName: client?.name ?? "—",
    clientPhone: client?.phone ?? null,
    status: trip.status as "draft" | "active" | "completed",
    flightDate: trip.flightDate?.toISOString() ?? null,
    flightNumber: trip.flightNumber,
    departureCity: trip.departureCity,
    departureAirport: trip.departureAirport,
    arrivalCity: trip.arrivalCity,
    arrivalAirport: trip.arrivalAirport,
    gate: trip.gate,
    hotelName: trip.hotelName,
    hotelAddress: trip.hotelAddress,
    hotelPhone: trip.hotelPhone,
    checkinTime: trip.checkinTime,
    checkoutTime: trip.checkoutTime,
    guideName: trip.guideName,
    guidePhone: trip.guidePhone,
    transferInfo: trip.transferInfo,
    transferDriverPhone: trip.transferDriverPhone,
    transferMeetingPoint: trip.transferMeetingPoint,
    insuranceInfo: trip.insuranceInfo,
    insurancePhone: trip.insurancePhone,
    managerPhone: trip.managerPhone,
    inviteToken: trip.inviteToken,
    notes: trip.notes,
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

  return <TripDetailClient id={id} trip={tripData} messages={messages} />;
}
