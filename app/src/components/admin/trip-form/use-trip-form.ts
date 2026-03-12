"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import type {
  FlightItem,
  HotelItem,
  GuideItem,
  TransferItem,
  InsuranceItem,
  AttractionItem,
  PassengerItem,
  NoteItem,
  ExtractedTripData,
} from "@/lib/types/trip-sections";
import {
  emptyFlight,
} from "@/lib/types/trip-sections";
import { parseNotes, serializeNotes } from "@/lib/utils/notes";
import { hasValues } from "@/lib/utils/form-helpers";

// ─── Interfaces ──────────────────────────────────────────

export interface ClientOption {
  id: string;
  name: string;
  language: string;
}

export interface TripFormInitialData {
  clientId?: string;
  status?: string;
  managerPhone?: string;
  flights?: FlightItem[];
  hotels?: HotelItem[];
  guides?: GuideItem[];
  transfers?: TransferItem[];
  insurances?: InsuranceItem[];
  attractions?: AttractionItem[];
  notes?: string;
}

/** Stable reference for "apply AI data to a single card" */
export function applyToCard<T>(
  setter: React.Dispatch<React.SetStateAction<T[]>>,
  idx: number,
  arrayKey: keyof ExtractedTripData,
  raw: Record<string, unknown>,
) {
  const items = raw[arrayKey];
  if (Array.isArray(items) && items.length > 0) {
    setter((prev) => {
      const next = [...prev];
      next[idx] = { ...next[idx], ...items[0] } as T;
      return next;
    });
  }
}

// ─── Smart merge helpers ─────────────────────────────────

function dedupPax(
  existing: PassengerItem[],
  incoming: PassengerItem[],
): PassengerItem[] {
  const names = new Set(existing.map((p) => p.name.trim().toLowerCase()));
  return incoming.filter(
    (p) => p.name.trim() && !names.has(p.name.trim().toLowerCase()),
  );
}

export function mergeIncomingFlights(
  prev: FlightItem[],
  incoming: FlightItem[],
): FlightItem[] {
  const hasInfo = (f: FlightItem) =>
    f.flightNumber || f.trainNumber || f.departureCity || f.arrivalCity;

  const hasPax = (f: FlightItem) =>
    (f.passengers ?? []).some((p) => p.name.trim());

  const dataFlights = incoming.filter(hasInfo);
  const paxOnly = incoming.filter((f) => !hasInfo(f));
  const extraPax = paxOnly.flatMap((f) => f.passengers ?? []);

  let result = [...prev];

  // 1. Spread loose passengers into every existing flight (deduplicated)
  if (extraPax.length > 0) {
    if (result.length > 0) {
      result = result.map((f) => {
        const fresh = dedupPax(f.passengers ?? [], extraPax);
        if (fresh.length === 0) return f;
        return { ...f, passengers: [...(f.passengers ?? []), ...fresh] };
      });
    } else {
      result.push({ ...emptyFlight, passengers: extraPax });
    }
  }

  // 2. Merge flights that carry route/schedule info
  for (const df of dataFlights) {
    // a) Try exact flightNumber match
    let matchIdx = df.flightNumber
      ? result.findIndex(
          (f) =>
            f.flightNumber &&
            f.flightNumber.toLowerCase() === df.flightNumber.toLowerCase(),
        )
      : -1;

    // b) No match? Fall back to a "skeleton" flight — has passengers but no
    //    route info — so the two halves (pax + details) get combined.
    if (matchIdx < 0) {
      matchIdx = result.findIndex((f) => !hasInfo(f) && hasPax(f));
    }

    if (matchIdx >= 0) {
      const existing = result[matchIdx];
      const merged: FlightItem = { ...existing };
      for (const key of Object.keys(df) as (keyof FlightItem)[]) {
        if (key === "passengers") continue;
        if (df[key] && !existing[key]) {
          (merged as unknown as Record<string, unknown>)[key] = df[key];
        }
      }
      merged.passengers = [
        ...(existing.passengers ?? []),
        ...dedupPax(existing.passengers ?? [], df.passengers ?? []),
      ];
      result[matchIdx] = merged;
    } else {
      result.push(df);
    }
  }

  return result;
}

// ─── Hook ────────────────────────────────────────────────

export function useTripForm(opts: {
  initialData?: TripFormInitialData;
  isEdit: boolean;
  tripId?: string;
  managerId: string;
  initialClients: ClientOption[];
}) {
  const { initialData, isEdit, tripId, managerId, initialClients } = opts;
  const router = useRouter();

  // ─── localStorage cache key ──────────────────────────
  const cacheKey = isEdit
    ? `trip-form-edit-${tripId}`
    : "trip-form-new";

  /** Read cached form data (only on first render) */
  function readCache(): Partial<TripFormInitialData> | null {
    try {
      const raw = localStorage.getItem(cacheKey);
      if (!raw) return null;
      return JSON.parse(raw);
    } catch {
      return null;
    }
  }

  /** Merge: use cache if available, else initialData */
  function init<T>(cacheVal: T | undefined, serverVal: T | undefined, fallback: T): T {
    return cacheVal !== undefined ? cacheVal : (serverVal !== undefined ? serverVal : fallback);
  }

  // On first render, check if there's a cached version newer than server data
  const cached = useRef<Partial<TripFormInitialData> | null>(null);
  if (cached.current === null) {
    cached.current = readCache() ?? {};
  }
  const c = cached.current;
  const hasCache = c && Object.keys(c).length > 0;

  // Clients list (can grow via inline creation)
  const [clientList, setClientList] = useState<ClientOption[]>(initialClients);

  // Core form state — prefer cache over server data
  const [clientId, setClientId] = useState(
    init(c.clientId, initialData?.clientId, ""),
  );
  const [status, setStatus] = useState(
    init(c.status, initialData?.status, "draft"),
  );
  const [managerPhone, setManagerPhone] = useState(
    init(c.managerPhone, initialData?.managerPhone, ""),
  );

  // Client language — resolved from selected client
  const selectedClient = clientList.find((cl) => cl.id === clientId);
  const [clientLanguage, setClientLanguage] = useState(
    selectedClient?.language ?? "en",
  );
  // Track original language to know if it was changed
  const originalLanguageRef = useRef(clientLanguage);

  // Sync language when client selection changes
  useEffect(() => {
    const cl = clientList.find((c) => c.id === clientId);
    if (cl) {
      setClientLanguage(cl.language);
      originalLanguageRef.current = cl.language;
    }
  }, [clientId, clientList]);

  // Section arrays
  const [flights, setFlights] = useState<FlightItem[]>(
    init(c.flights, initialData?.flights, []),
  );
  const [hotels, setHotels] = useState<HotelItem[]>(
    init(c.hotels, initialData?.hotels, []),
  );
  const [guides, setGuides] = useState<GuideItem[]>(
    init(c.guides, initialData?.guides, []),
  );
  const [transfers, setTransfers] = useState<TransferItem[]>(
    init(c.transfers, initialData?.transfers, []),
  );
  const [insurances, setInsurances] = useState<InsuranceItem[]>(
    init(c.insurances, initialData?.insurances, []),
  );
  const [attractions, setAttractions] = useState<AttractionItem[]>(
    init(c.attractions, initialData?.attractions, []),
  );
  const [noteCards, setNoteCards] = useState<NoteItem[]>(() =>
    parseNotes(init(c.notes, initialData?.notes, "")),
  );

  // Show "restored from cache" toast once
  const [cacheRestored, setCacheRestored] = useState(false);
  useEffect(() => {
    if (hasCache && !cacheRestored) {
      setCacheRestored(true);
      toast.info("Восстановлены несохранённые изменения", { duration: 3000 });
    }
  }, [hasCache, cacheRestored]);

  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // ─── Auto-save to localStorage (debounced) ───────────

  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const saveToCache = useCallback(() => {
    const snapshot: TripFormInitialData = {
      clientId,
      status,
      managerPhone,
      flights,
      hotels,
      guides,
      transfers,
      insurances,
      attractions,
      notes: serializeNotes(noteCards),
    };
    try {
      localStorage.setItem(cacheKey, JSON.stringify(snapshot));
    } catch { /* ignore quota errors */ }
  }, [clientId, status, managerPhone, flights, hotels, guides, transfers, insurances, attractions, noteCards, cacheKey]);

  // Debounce: save 500ms after last change
  useEffect(() => {
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(saveToCache, 500);
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [saveToCache]);

  /** Clear cache (called after successful save) */
  function clearCache() {
    try { localStorage.removeItem(cacheKey); } catch { /* noop */ }
  }

  // ─── Global AI fill ──────────────────────────────────

  function applyExtracted(raw: Record<string, unknown>) {
    const data = raw as ExtractedTripData;
    if (data.flights?.length)
      setFlights((prev) => mergeIncomingFlights(prev, data.flights!));
    if (data.hotels?.length)
      setHotels((prev) => [...prev, ...data.hotels!]);
    if (data.guides?.length)
      setGuides((prev) => [...prev, ...data.guides!]);
    if (data.transfers?.length)
      setTransfers((prev) => [...prev, ...data.transfers!]);
    if (data.insurances?.length)
      setInsurances((prev) => [...prev, ...data.insurances!]);
    if (data.attractions?.length)
      setAttractions((prev) => [...prev, ...data.attractions!]);
    if (data.managerPhone && !managerPhone) setManagerPhone(data.managerPhone);
    setErrors({});
  }

  // ─── Validation & Submit ─────────────────────────────

  function validate(): boolean {
    const newErrors: Record<string, string> = {};
    if (!clientId) newErrors.clientId = "Выберите клиента";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!validate()) {
      toast.error("Исправьте ошибки в форме");
      return;
    }
    setSaving(true);
    try {
      const payload = {
        clientId,
        managerId,
        status: status as "draft" | "active" | "completed",
        managerPhone: managerPhone || null,
        flights: flights.filter((f) => hasValues(f)),
        hotels: hotels.filter((h) => hasValues(h)),
        guides: guides.filter((g) => hasValues(g)),
        transfers: transfers.filter((t) => hasValues(t)),
        insurances: insurances.filter((i) => hasValues(i)),
        attractions: attractions.filter((a) => hasValues(a)),
        notes: serializeNotes(noteCards) || null,
      };

      const url = isEdit ? `/api/trips/${tripId}` : "/api/trips";
      const method = isEdit ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const body = await res.json().catch(() => null);
        throw new Error(body?.error ?? `Ошибка ${res.status}`);
      }

      const { data: savedTrip } = await res.json();

      // Update client language if changed
      if (clientId && clientLanguage !== originalLanguageRef.current) {
        await fetch(`/api/clients/${clientId}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ language: clientLanguage }),
        }).catch(() => {/* non-critical */});
      }

      clearCache();
      toast.success(isEdit ? "Поездка обновлена" : "Поездка создана");
      router.push(`/admin/trips/${savedTrip.id}`);
      router.refresh();
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "Не удалось сохранить",
      );
    } finally {
      setSaving(false);
    }
  }

  return {
    // State
    clientList,
    setClientList,
    clientId,
    setClientId,
    status,
    setStatus,
    managerPhone,
    setManagerPhone,
    clientLanguage,
    setClientLanguage,
    flights,
    setFlights,
    hotels,
    setHotels,
    guides,
    setGuides,
    transfers,
    setTransfers,
    insurances,
    setInsurances,
    attractions,
    setAttractions,
    noteCards,
    setNoteCards,
    saving,
    errors,
    setErrors,
    // Actions
    applyExtracted,
    handleSubmit,
    clearCache,
    router,
  };
}
