import { TripForm } from "@/components/admin/trip-form";

// TODO: Fetch trip data from API using params.id
export default async function EditTripPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  // Mock data — replace with API fetch
  const tripData = {
    clientId: "1",
    status: "active",
    flightDate: "2026-03-15T10:30",
    flightNumber: "SU2134",
    departureCity: "Москва",
    departureAirport: "SVO",
    arrivalCity: "Анталья",
    arrivalAirport: "AYT",
    gate: "A23",
    hotelName: "Rixos Premium",
    hotelAddress: "Ileribasi Mevkii, Antalya",
    hotelPhone: "+90 242 310 41 00",
    checkinTime: "14:00",
    checkoutTime: "12:00",
    guideName: "Мехмет Йылмаз",
    guidePhone: "+90 532 123 45 67",
    transferInfo: "Индивидуальный трансфер",
    transferDriverPhone: "+90 532 987 65 43",
    transferMeetingPoint: "Выход B",
    insuranceInfo: "Полис #12345",
    insurancePhone: "+7 800 123 45 67",
    managerPhone: "+372 555 1234",
    notes: `Trip ID: ${id}`,
  };

  return <TripForm initialData={tripData} isEdit />;
}
