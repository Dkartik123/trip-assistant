import { TripForm } from "@/components/admin/trip-form";
import { clientRepository } from "@/lib/db/repositories";
import { getCurrentManager } from "@/lib/admin-session";

export default async function NewTripPage() {
  const manager = await getCurrentManager();
  const clients = await clientRepository.findByAgencyId(manager.agencyId);

  return (
    <TripForm
      managerId={manager.id}
      agencyId={manager.agencyId}
      clients={clients.map((c) => ({
        id: c.id,
        name: c.name,
        language: c.language ?? "en",
      }))}
    />
  );
}
