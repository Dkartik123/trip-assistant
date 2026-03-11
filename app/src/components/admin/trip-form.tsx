"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ClientCombobox } from "@/components/admin/client-combobox";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Plane,
  Hotel,
  UserCheck,
  Car,
  Shield,
  ArrowLeft,
  Save,
  Plus,
  X,
} from "lucide-react";
import { AiFillDialog } from "@/components/admin/ai-fill-dialog";
import type {
  FlightItem,
  HotelItem,
  GuideItem,
  TransferItem,
  InsuranceItem,
  NoteItem,
  ExtractedTripData,
} from "@/lib/types/trip-sections";
import {
  emptyFlight,
  emptyHotel,
  emptyGuide,
  emptyTransfer,
  emptyInsurance,
} from "@/lib/types/trip-sections";

// ─── Interfaces ──────────────────────────────────────────

interface ClientOption {
  id: string;
  name: string;
}

interface TripFormProps {
  initialData?: {
    clientId?: string;
    status?: string;
    managerPhone?: string;
    flights?: FlightItem[];
    hotels?: HotelItem[];
    guides?: GuideItem[];
    transfers?: TransferItem[];
    insurances?: InsuranceItem[];
    notes?: string;
  };
  isEdit?: boolean;
  tripId?: string;
  managerId: string;
  agencyId: string;
  clients: ClientOption[];
}

// ─── Helpers ─────────────────────────────────────────────

function parseNotes(raw: string): NoteItem[] {
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed)) return parsed;
  } catch {
    if (raw.trim()) return [{ title: "", text: raw }];
  }
  return [];
}

function serializeNotes(notes: NoteItem[]): string {
  const filtered = notes.filter((n) => n.title.trim() || n.text.trim());
  if (filtered.length === 0) return "";
  return JSON.stringify(filtered);
}

function hasValues(obj: object): boolean {
  return Object.values(obj).some((v) => typeof v === "string" && v.trim());
}

function updateItem<T>(
  setter: React.Dispatch<React.SetStateAction<T[]>>,
  idx: number,
  field: keyof T,
  value: string,
) {
  setter((prev) => {
    const next = [...prev];
    next[idx] = { ...next[idx], [field]: value } as T;
    return next;
  });
}

// ─── Component ───────────────────────────────────────────

export function TripForm({
  initialData,
  isEdit = false,
  tripId,
  managerId,
  agencyId,
  clients: initialClients,
}: TripFormProps) {
  const router = useRouter();

  // Clients list (can grow via inline creation)
  const [clientList, setClientList] = useState<ClientOption[]>(initialClients);

  // Core form state
  const [clientId, setClientId] = useState(initialData?.clientId ?? "");
  const [status, setStatus] = useState(initialData?.status ?? "draft");
  const [managerPhone, setManagerPhone] = useState(
    initialData?.managerPhone ?? "",
  );

  // Section arrays
  const [flights, setFlights] = useState<FlightItem[]>(
    initialData?.flights ?? [],
  );
  const [hotels, setHotels] = useState<HotelItem[]>(initialData?.hotels ?? []);
  const [guides, setGuides] = useState<GuideItem[]>(initialData?.guides ?? []);
  const [transfers, setTransfers] = useState<TransferItem[]>(
    initialData?.transfers ?? [],
  );
  const [insurances, setInsurances] = useState<InsuranceItem[]>(
    initialData?.insurances ?? [],
  );
  const [noteCards, setNoteCards] = useState<NoteItem[]>(() =>
    parseNotes(initialData?.notes ?? ""),
  );

  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // ─── Global AI fill ──────────────────────────────────

  function applyExtracted(raw: Record<string, unknown>) {
    const data = raw as ExtractedTripData;
    if (data.flights?.length) setFlights(data.flights);
    if (data.hotels?.length) setHotels(data.hotels);
    if (data.guides?.length) setGuides(data.guides);
    if (data.transfers?.length) setTransfers(data.transfers);
    if (data.insurances?.length) setInsurances(data.insurances);
    if (data.managerPhone) setManagerPhone(data.managerPhone);
    setErrors({});
  }

  // ─── Per-card AI fill helpers ────────────────────────

  function applyToCard<T>(
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
        managerPhone: managerPhone || undefined,
        flights: flights.filter((f) => hasValues(f)),
        hotels: hotels.filter((h) => hasValues(h)),
        guides: guides.filter((g) => hasValues(g)),
        transfers: transfers.filter((t) => hasValues(t)),
        insurances: insurances.filter((i) => hasValues(i)),
        notes: serializeNotes(noteCards) || undefined,
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
      toast.success(isEdit ? "Поездка обновлена" : "Поездка создана");
      router.push(`/admin/trips/${savedTrip.id}`);
      router.refresh();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Не удалось сохранить");
    } finally {
      setSaving(false);
    }
  }

  // ─── Render ──────────────────────────────────────────

  return (
    <form onSubmit={handleSubmit} className="min-w-0 space-y-4 sm:space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3 sm:gap-4">
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="shrink-0"
            onClick={() => router.back()}
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-xl font-bold tracking-tight sm:text-2xl">
              {isEdit ? "Редактировать поездку" : "Новая поездка"}
            </h1>
            <p className="text-sm text-muted-foreground">
              {isEdit
                ? "Обновите данные поездки"
                : "Заполните информацию о поездке клиента"}
            </p>
          </div>
        </div>
        <div className="flex w-full gap-2 sm:w-auto">
          <AiFillDialog onExtracted={applyExtracted} />
          <Button
            type="submit"
            disabled={saving}
            className="flex-1 sm:flex-initial"
          >
            <Save className="mr-2 h-4 w-4" />
            {saving ? "Сохранение..." : "Сохранить"}
          </Button>
        </div>
      </div>

      {/* General */}
      <Card>
        <CardHeader>
          <CardTitle>Основное</CardTitle>
          <CardDescription>Клиент и статус поездки</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4 grid-cols-1 sm:grid-cols-2">
          <ClientCombobox
            clients={clientList}
            value={clientId}
            onValueChange={(id) => {
              setClientId(id);
              setErrors((p) => ({
                ...p,
                clientId: undefined as unknown as string,
              }));
            }}
            onClientCreated={(c) => setClientList((prev) => [...prev, c])}
            agencyId={agencyId}
            error={errors.clientId}
          />
          <div className="space-y-2">
            <Label htmlFor="status">Статус</Label>
            <Select value={status} onValueChange={(v) => setStatus(v ?? "")}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="draft">Черновик</SelectItem>
                <SelectItem value="active">Активна</SelectItem>
                <SelectItem value="completed">Завершена</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="managerPhone">Телефон менеджера (для AI)</Label>
            <Input
              id="managerPhone"
              placeholder="+7 (999) 123-45-67"
              value={managerPhone}
              onChange={(e) => setManagerPhone(e.target.value)}
            />
          </div>
        </CardContent>
      </Card>

      {/* Tabs */}
      <Tabs defaultValue="flight" className="min-w-0 flex-col">
        <TabsList className="w-full max-w-full justify-start overflow-x-auto">
          <TabsTrigger
            value="flight"
            className="gap-1.5 px-2 text-xs sm:gap-2 sm:px-3 sm:text-sm"
          >
            <Plane className="h-3.5 w-3.5 sm:h-4 sm:w-4" /> Рейсы
          </TabsTrigger>
          <TabsTrigger
            value="hotel"
            className="gap-1.5 px-2 text-xs sm:gap-2 sm:px-3 sm:text-sm"
          >
            <Hotel className="h-3.5 w-3.5 sm:h-4 sm:w-4" /> Отели
          </TabsTrigger>
          <TabsTrigger
            value="guide"
            className="gap-1.5 px-2 text-xs sm:gap-2 sm:px-3 sm:text-sm"
          >
            <UserCheck className="h-3.5 w-3.5 sm:h-4 sm:w-4" /> Гиды
          </TabsTrigger>
          <TabsTrigger
            value="transfer"
            className="gap-1.5 px-2 text-xs sm:gap-2 sm:px-3 sm:text-sm"
          >
            <Car className="h-3.5 w-3.5 sm:h-4 sm:w-4" /> Трансферы
          </TabsTrigger>
          <TabsTrigger
            value="insurance"
            className="gap-1.5 px-2 text-xs sm:gap-2 sm:px-3 sm:text-sm"
          >
            <Shield className="h-3.5 w-3.5 sm:h-4 sm:w-4" /> Страховки
          </TabsTrigger>
        </TabsList>

        {/* ═══ FLIGHTS ═══ */}
        <TabsContent value="flight">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold">Рейсы</h3>
              <div className="flex gap-2">
                <AiFillDialog
                  category="flight"
                  compact
                  onExtracted={(d) => {
                    const arr = (d as ExtractedTripData).flights;
                    if (arr?.length) setFlights(arr);
                  }}
                />
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() =>
                    setFlights((prev) => [...prev, { ...emptyFlight }])
                  }
                >
                  <Plus className="mr-1.5 h-3.5 w-3.5" /> Добавить
                </Button>
              </div>
            </div>
            {flights.length === 0 ? (
              <Card>
                <CardContent className="flex flex-col items-center justify-center py-8 text-center">
                  <Plane className="mb-2 h-8 w-8 text-muted-foreground" />
                  <p className="text-sm text-muted-foreground">
                    Нет рейсов. Нажмите «Добавить» или используйте AI.
                  </p>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-3">
                {flights.map((flight, idx) => (
                  <Card key={idx}>
                    <CardHeader className="pb-3">
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-base">
                          Рейс {idx + 1}
                        </CardTitle>
                        <div className="flex items-center gap-1">
                          <AiFillDialog
                            category="flight"
                            compact
                            onExtracted={(d) =>
                              applyToCard(setFlights, idx, "flights", d)
                            }
                          />
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            className="h-7 w-7 text-muted-foreground hover:text-destructive"
                            onClick={() =>
                              setFlights((prev) =>
                                prev.filter((_, i) => i !== idx),
                              )
                            }
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
                      <div className="space-y-2">
                        <Label>Дата и время вылета</Label>
                        <Input
                          type="datetime-local"
                          value={flight.flightDate}
                          onChange={(e) =>
                            updateItem(
                              setFlights,
                              idx,
                              "flightDate",
                              e.target.value,
                            )
                          }
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Номер рейса</Label>
                        <Input
                          placeholder="SU2134"
                          value={flight.flightNumber}
                          onChange={(e) =>
                            updateItem(
                              setFlights,
                              idx,
                              "flightNumber",
                              e.target.value,
                            )
                          }
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Гейт</Label>
                        <Input
                          placeholder="A12"
                          value={flight.gate}
                          onChange={(e) =>
                            updateItem(setFlights, idx, "gate", e.target.value)
                          }
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Город вылета</Label>
                        <Input
                          placeholder="Москва"
                          value={flight.departureCity}
                          onChange={(e) =>
                            updateItem(
                              setFlights,
                              idx,
                              "departureCity",
                              e.target.value,
                            )
                          }
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Аэропорт вылета</Label>
                        <Input
                          placeholder="SVO"
                          value={flight.departureAirport}
                          onChange={(e) =>
                            updateItem(
                              setFlights,
                              idx,
                              "departureAirport",
                              e.target.value,
                            )
                          }
                        />
                      </div>
                      <Separator className="col-span-full" />
                      <div className="space-y-2">
                        <Label>Город прибытия</Label>
                        <Input
                          placeholder="Анталья"
                          value={flight.arrivalCity}
                          onChange={(e) =>
                            updateItem(
                              setFlights,
                              idx,
                              "arrivalCity",
                              e.target.value,
                            )
                          }
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Аэропорт прибытия</Label>
                        <Input
                          placeholder="AYT"
                          value={flight.arrivalAirport}
                          onChange={(e) =>
                            updateItem(
                              setFlights,
                              idx,
                              "arrivalAirport",
                              e.target.value,
                            )
                          }
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Дата и время прилёта</Label>
                        <Input
                          type="datetime-local"
                          value={flight.arrivalDate}
                          onChange={(e) =>
                            updateItem(
                              setFlights,
                              idx,
                              "arrivalDate",
                              e.target.value,
                            )
                          }
                        />
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </TabsContent>

        {/* ═══ HOTELS ═══ */}
        <TabsContent value="hotel">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold">Отели</h3>
              <div className="flex gap-2">
                <AiFillDialog
                  category="hotel"
                  compact
                  onExtracted={(d) => {
                    const arr = (d as ExtractedTripData).hotels;
                    if (arr?.length) setHotels(arr);
                  }}
                />
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() =>
                    setHotels((prev) => [...prev, { ...emptyHotel }])
                  }
                >
                  <Plus className="mr-1.5 h-3.5 w-3.5" /> Добавить
                </Button>
              </div>
            </div>
            {hotels.length === 0 ? (
              <Card>
                <CardContent className="flex flex-col items-center justify-center py-8 text-center">
                  <Hotel className="mb-2 h-8 w-8 text-muted-foreground" />
                  <p className="text-sm text-muted-foreground">
                    Нет отелей. Нажмите «Добавить» или используйте AI.
                  </p>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-3">
                {hotels.map((hotel, idx) => (
                  <Card key={idx}>
                    <CardHeader className="pb-3">
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-base">
                          Отель {idx + 1}
                        </CardTitle>
                        <div className="flex items-center gap-1">
                          <AiFillDialog
                            category="hotel"
                            compact
                            onExtracted={(d) =>
                              applyToCard(setHotels, idx, "hotels", d)
                            }
                          />
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            className="h-7 w-7 text-muted-foreground hover:text-destructive"
                            onClick={() =>
                              setHotels((prev) =>
                                prev.filter((_, i) => i !== idx),
                              )
                            }
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="grid gap-4 grid-cols-1 sm:grid-cols-2">
                      <div className="space-y-2">
                        <Label>Название отеля</Label>
                        <Input
                          placeholder="Rixos Premium"
                          value={hotel.hotelName}
                          onChange={(e) =>
                            updateItem(
                              setHotels,
                              idx,
                              "hotelName",
                              e.target.value,
                            )
                          }
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Телефон отеля</Label>
                        <Input
                          placeholder="+90 242 310 41 00"
                          value={hotel.hotelPhone}
                          onChange={(e) =>
                            updateItem(
                              setHotels,
                              idx,
                              "hotelPhone",
                              e.target.value,
                            )
                          }
                        />
                      </div>
                      <div className="space-y-2 sm:col-span-2">
                        <Label>Адрес</Label>
                        <Textarea
                          placeholder="Адрес отеля"
                          value={hotel.hotelAddress}
                          onChange={(e) =>
                            updateItem(
                              setHotels,
                              idx,
                              "hotelAddress",
                              e.target.value,
                            )
                          }
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Check-in</Label>
                        <Input
                          placeholder="14:00"
                          value={hotel.checkinTime}
                          onChange={(e) =>
                            updateItem(
                              setHotels,
                              idx,
                              "checkinTime",
                              e.target.value,
                            )
                          }
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Check-out</Label>
                        <Input
                          placeholder="12:00"
                          value={hotel.checkoutTime}
                          onChange={(e) =>
                            updateItem(
                              setHotels,
                              idx,
                              "checkoutTime",
                              e.target.value,
                            )
                          }
                        />
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </TabsContent>

        {/* ═══ GUIDES ═══ */}
        <TabsContent value="guide">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold">Гиды</h3>
              <div className="flex gap-2">
                <AiFillDialog
                  category="guide"
                  compact
                  onExtracted={(d) => {
                    const arr = (d as ExtractedTripData).guides;
                    if (arr?.length) setGuides(arr);
                  }}
                />
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() =>
                    setGuides((prev) => [...prev, { ...emptyGuide }])
                  }
                >
                  <Plus className="mr-1.5 h-3.5 w-3.5" /> Добавить
                </Button>
              </div>
            </div>
            {guides.length === 0 ? (
              <Card>
                <CardContent className="flex flex-col items-center justify-center py-8 text-center">
                  <UserCheck className="mb-2 h-8 w-8 text-muted-foreground" />
                  <p className="text-sm text-muted-foreground">
                    Нет гидов. Нажмите «Добавить» или используйте AI.
                  </p>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-3">
                {guides.map((guide, idx) => (
                  <Card key={idx}>
                    <CardHeader className="pb-3">
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-base">
                          Гид {idx + 1}
                        </CardTitle>
                        <div className="flex items-center gap-1">
                          <AiFillDialog
                            category="guide"
                            compact
                            onExtracted={(d) =>
                              applyToCard(setGuides, idx, "guides", d)
                            }
                          />
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            className="h-7 w-7 text-muted-foreground hover:text-destructive"
                            onClick={() =>
                              setGuides((prev) =>
                                prev.filter((_, i) => i !== idx),
                              )
                            }
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="grid gap-4 grid-cols-1 sm:grid-cols-2">
                      <div className="space-y-2">
                        <Label>Имя гида</Label>
                        <Input
                          placeholder="Мехмет Йылмаз"
                          value={guide.guideName}
                          onChange={(e) =>
                            updateItem(
                              setGuides,
                              idx,
                              "guideName",
                              e.target.value,
                            )
                          }
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Телефон гида</Label>
                        <Input
                          placeholder="+90 532 123 45 67"
                          value={guide.guidePhone}
                          onChange={(e) =>
                            updateItem(
                              setGuides,
                              idx,
                              "guidePhone",
                              e.target.value,
                            )
                          }
                        />
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </TabsContent>

        {/* ═══ TRANSFERS ═══ */}
        <TabsContent value="transfer">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold">Трансферы</h3>
              <div className="flex gap-2">
                <AiFillDialog
                  category="transfer"
                  compact
                  onExtracted={(d) => {
                    const arr = (d as ExtractedTripData).transfers;
                    if (arr?.length) setTransfers(arr);
                  }}
                />
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() =>
                    setTransfers((prev) => [...prev, { ...emptyTransfer }])
                  }
                >
                  <Plus className="mr-1.5 h-3.5 w-3.5" /> Добавить
                </Button>
              </div>
            </div>
            {transfers.length === 0 ? (
              <Card>
                <CardContent className="flex flex-col items-center justify-center py-8 text-center">
                  <Car className="mb-2 h-8 w-8 text-muted-foreground" />
                  <p className="text-sm text-muted-foreground">
                    Нет трансферов. Нажмите «Добавить» или используйте AI.
                  </p>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-3">
                {transfers.map((transfer, idx) => (
                  <Card key={idx}>
                    <CardHeader className="pb-3">
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-base">
                          Трансфер {idx + 1}
                        </CardTitle>
                        <div className="flex items-center gap-1">
                          <AiFillDialog
                            category="transfer"
                            compact
                            onExtracted={(d) =>
                              applyToCard(setTransfers, idx, "transfers", d)
                            }
                          />
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            className="h-7 w-7 text-muted-foreground hover:text-destructive"
                            onClick={() =>
                              setTransfers((prev) =>
                                prev.filter((_, i) => i !== idx),
                              )
                            }
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="grid gap-4 grid-cols-1 sm:grid-cols-2">
                      <div className="space-y-2 sm:col-span-2">
                        <Label>Описание трансфера</Label>
                        <Textarea
                          placeholder="Индивидуальный трансфер аэропорт — отель"
                          value={transfer.transferInfo}
                          onChange={(e) =>
                            updateItem(
                              setTransfers,
                              idx,
                              "transferInfo",
                              e.target.value,
                            )
                          }
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Телефон водителя</Label>
                        <Input
                          placeholder="+90 532 987 65 43"
                          value={transfer.transferDriverPhone}
                          onChange={(e) =>
                            updateItem(
                              setTransfers,
                              idx,
                              "transferDriverPhone",
                              e.target.value,
                            )
                          }
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Место встречи</Label>
                        <Input
                          placeholder="Выход B, табличка с именем"
                          value={transfer.transferMeetingPoint}
                          onChange={(e) =>
                            updateItem(
                              setTransfers,
                              idx,
                              "transferMeetingPoint",
                              e.target.value,
                            )
                          }
                        />
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </TabsContent>

        {/* ═══ INSURANCES ═══ */}
        <TabsContent value="insurance">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold">Страховки</h3>
              <div className="flex gap-2">
                <AiFillDialog
                  category="insurance"
                  compact
                  onExtracted={(d) => {
                    const arr = (d as ExtractedTripData).insurances;
                    if (arr?.length) setInsurances(arr);
                  }}
                />
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() =>
                    setInsurances((prev) => [...prev, { ...emptyInsurance }])
                  }
                >
                  <Plus className="mr-1.5 h-3.5 w-3.5" /> Добавить
                </Button>
              </div>
            </div>
            {insurances.length === 0 ? (
              <Card>
                <CardContent className="flex flex-col items-center justify-center py-8 text-center">
                  <Shield className="mb-2 h-8 w-8 text-muted-foreground" />
                  <p className="text-sm text-muted-foreground">
                    Нет страховок. Нажмите «Добавить» или используйте AI.
                  </p>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-3">
                {insurances.map((ins, idx) => (
                  <Card key={idx}>
                    <CardHeader className="pb-3">
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-base">
                          Страховка {idx + 1}
                        </CardTitle>
                        <div className="flex items-center gap-1">
                          <AiFillDialog
                            category="insurance"
                            compact
                            onExtracted={(d) =>
                              applyToCard(setInsurances, idx, "insurances", d)
                            }
                          />
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            className="h-7 w-7 text-muted-foreground hover:text-destructive"
                            onClick={() =>
                              setInsurances((prev) =>
                                prev.filter((_, i) => i !== idx),
                              )
                            }
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="grid gap-4 grid-cols-1 sm:grid-cols-2">
                      <div className="space-y-2 sm:col-span-2">
                        <Label>Информация о страховке</Label>
                        <Textarea
                          placeholder="Полис #12345, покрытие до $50,000"
                          value={ins.insuranceInfo}
                          onChange={(e) =>
                            updateItem(
                              setInsurances,
                              idx,
                              "insuranceInfo",
                              e.target.value,
                            )
                          }
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Телефон страховой</Label>
                        <Input
                          placeholder="+7 800 123 45 67"
                          value={ins.insurancePhone}
                          onChange={(e) =>
                            updateItem(
                              setInsurances,
                              idx,
                              "insurancePhone",
                              e.target.value,
                            )
                          }
                        />
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </TabsContent>
      </Tabs>

      {/* Notes */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold">Заметки</h2>
            <p className="text-sm text-muted-foreground">
              Дополнительная информация о поездке
            </p>
          </div>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() =>
              setNoteCards((prev) => [...prev, { title: "", text: "" }])
            }
          >
            <Plus className="mr-1.5 h-3.5 w-3.5" />
            Добавить
          </Button>
        </div>

        {noteCards.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-8 text-center">
              <p className="text-sm text-muted-foreground">
                Нет заметок. Нажмите «Добавить» чтобы создать.
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-3 grid-cols-1 sm:grid-cols-2">
            {noteCards.map((note, idx) => (
              <Card key={idx}>
                <CardHeader className="pb-2">
                  <div className="flex items-start justify-between gap-2">
                    <Input
                      placeholder="Заголовок заметки"
                      value={note.title}
                      className="border-0 p-0 text-sm font-medium shadow-none focus-visible:ring-0"
                      onChange={(e) => {
                        const next = [...noteCards];
                        next[idx] = { ...next[idx], title: e.target.value };
                        setNoteCards(next);
                      }}
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="h-6 w-6 shrink-0 text-muted-foreground hover:text-destructive"
                      onClick={() =>
                        setNoteCards((prev) => prev.filter((_, i) => i !== idx))
                      }
                    >
                      <X className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="pt-0">
                  <Textarea
                    placeholder="Текст заметки..."
                    rows={3}
                    value={note.text}
                    onChange={(e) => {
                      const next = [...noteCards];
                      next[idx] = { ...next[idx], text: e.target.value };
                      setNoteCards(next);
                    }}
                  />
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </form>
  );
}
