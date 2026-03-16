"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import Link from "next/link";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import {
  ArrowLeft,
  Pencil,
  Link as LinkIcon,
  Copy,
  Check,
  Plane,
  Hotel,
  UserCheck,
  Car,
  Shield,
  Phone,
  MessageSquare,
  Bot,
  User,
  MapPin,
  TrainFront,
  Footprints,
  Bus,
  Users,
  Send,
  Headset,
  Loader2,
} from "lucide-react";
import type {
  FlightItem,
  HotelItem,
  GuideItem,
  TransferItem,
  TransferType,
  RouteType,
  InsuranceItem,
  AttractionItem,
} from "@/lib/types/trip-sections";
import { formatDate, formatTime } from "@/lib/utils/date";

interface TripData {
  id: string;
  clientName: string;
  clientPhone: string | null;
  status: "draft" | "active" | "completed";
  managerPhone: string | null;
  inviteToken: string | null;
  notes: string | null;
  flights: FlightItem[];
  hotels: HotelItem[];
  guides: GuideItem[];
  transfers: TransferItem[];
  insurances: InsuranceItem[];
  attractions: AttractionItem[];
}

interface MessageData {
  id: string;
  role: "user" | "assistant" | "operator";
  content: string;
  createdAt: string;
}

interface SubscriberData {
  id: string;
  name: string;
  telegramChatId: string;
  language: string;
  joinedAt: string;
}

const statusMap = {
  draft: {
    label: "Черновик",
    className:
      "bg-amber-100 text-amber-700 border-transparent dark:bg-amber-900/30 dark:text-amber-400",
  },
  active: {
    label: "Активна",
    className:
      "bg-emerald-100 text-emerald-700 border-transparent dark:bg-emerald-900/30 dark:text-emerald-400",
  },
  completed: {
    label: "Завершена",
    className:
      "bg-sky-100 text-sky-700 border-transparent dark:bg-sky-900/30 dark:text-sky-400",
  },
};

function InfoRow({ label, value }: { label: string; value?: string | null }) {
  if (!value) return null;
  return (
    <div className="flex flex-col gap-0.5">
      <span className="text-xs text-muted-foreground">{label}</span>
      <span className="text-sm">{value}</span>
    </div>
  );
}

/** Build a short summary from the first flight (for header subtitle) */
function tripSubtitle(trip: TripData): string {
  const f = trip.flights[0];
  if (!f) return "";
  return `${f.departureCity} → ${f.arrivalCity} • ${f.flightDate || "—"}`;
}

export function TripDetailClient({
  id,
  trip,
  messages: tripMessages,
  subscribers = [],
}: {
  id: string;
  trip: TripData;
  messages: MessageData[];
  subscribers?: SubscriberData[];
}) {
  const [copied, setCopied] = useState(false);
  const botUsername =
    process.env.NEXT_PUBLIC_TELEGRAM_BOT_USERNAME || "TripAssistant123Bot";
  const inviteLink = trip.inviteToken
    ? `https://t.me/${botUsername}?start=${trip.inviteToken}`
    : "";

  async function copyLink() {
    await navigator.clipboard.writeText(inviteLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button
            nativeButton={false}
            variant="ghost"
            size="icon"
            render={<Link href="/admin/trips" />}
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold tracking-tight">
                {trip.clientName}
              </h1>
              <Badge className={statusMap[trip.status].className}>
                {statusMap[trip.status].label}
              </Badge>
            </div>
            <p className="text-muted-foreground">{tripSubtitle(trip)}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Dialog>
            <DialogTrigger render={<Button variant="outline" />}>
              <LinkIcon className="mr-2 h-4 w-4" />
              Deep-link
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Ссылка для Telegram бота</DialogTitle>
                <DialogDescription>
                  Отправьте эту ссылку клиенту и попутчикам — каждый сможет
                  подключиться к боту
                </DialogDescription>
              </DialogHeader>
              <div className="flex gap-2">
                <Input
                  value={inviteLink}
                  readOnly
                  className="font-mono text-sm"
                />
                <Button onClick={copyLink} variant="outline" size="icon">
                  {copied ? (
                    <Check className="h-4 w-4 text-green-600" />
                  ) : (
                    <Copy className="h-4 w-4" />
                  )}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
          <Button
            nativeButton={false}
            render={<Link href={`/admin/trips/${id}/edit`} />}
          >
            <Pencil className="mr-2 h-4 w-4" />
            Редактировать
          </Button>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Left column — Trip details */}
        <div className="space-y-4 lg:col-span-2">
          {/* Flights */}
          {trip.flights.length > 0 && (
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-base">
                  <Plane className="h-4 w-4" /> Рейсы ({trip.flights.length})
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {trip.flights.map((f, i) => {
                  const rType = (f.type ?? "flight") as RouteType;
                  return (
                    <div key={i}>
                      {i > 0 && <Separator className="mb-4" />}
                      <div className="flex items-center gap-2 mb-2">
                        {rType === "train" ? (
                          <TrainFront className="h-3.5 w-3.5 text-muted-foreground" />
                        ) : (
                          <Plane className="h-3.5 w-3.5 text-muted-foreground" />
                        )}
                        <span className="text-xs font-medium uppercase text-muted-foreground">
                          {rType === "train" ? "Поезд" : "Авиарейс"}
                        </span>
                      </div>
                      <div className="grid gap-3 sm:grid-cols-3">
                        {rType === "flight" && (
                          <>
                            <InfoRow
                              label="Номер рейса"
                              value={f.flightNumber}
                            />
                            <InfoRow label="Дата вылета" value={f.flightDate} />
                            <InfoRow label="Гейт" value={f.gate} />
                            <InfoRow
                              label="Город вылета"
                              value={f.departureCity}
                            />
                            <InfoRow
                              label="Аэропорт"
                              value={f.departureAirport}
                            />
                            <InfoRow
                              label="Дата прибытия"
                              value={f.arrivalDate}
                            />
                            <InfoRow
                              label="Город прибытия"
                              value={f.arrivalCity}
                            />
                            <InfoRow
                              label="Аэропорт"
                              value={f.arrivalAirport}
                            />
                          </>
                        )}
                        {rType === "train" && (
                          <>
                            <InfoRow label="Поезд №" value={f.trainNumber} />
                            <InfoRow
                              label="Дата отправления"
                              value={f.flightDate}
                            />
                            <InfoRow label="Класс" value={f.carriageClass} />
                            <InfoRow
                              label="Город отпр."
                              value={f.departureCity}
                            />
                            <InfoRow
                              label="Станция"
                              value={f.departureStation}
                            />
                            <InfoRow
                              label="Дата прибытия"
                              value={f.arrivalDate}
                            />
                            <InfoRow
                              label="Город приб."
                              value={f.arrivalCity}
                            />
                            <InfoRow label="Станция" value={f.arrivalStation} />
                            <InfoRow label="Место" value={f.seat} />
                          </>
                        )}
                      </div>
                      {f.passengers.length > 0 && (
                        <div className="mt-3">
                          <span className="text-xs font-medium text-muted-foreground">
                            Пассажиры:
                          </span>
                          <div className="mt-1 space-y-1">
                            {f.passengers.map((p, pi) => (
                              <div
                                key={pi}
                                className="text-sm flex items-center gap-2"
                              >
                                <span>{p.name}</span>
                                {p.baggage && (
                                  <Badge
                                    variant="outline"
                                    className="text-xs font-normal"
                                  >
                                    {p.baggage}
                                  </Badge>
                                )}
                                {p.ticketPrice && (
                                  <span className="text-xs text-muted-foreground">
                                    {p.ticketPrice}
                                  </span>
                                )}
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </CardContent>
            </Card>
          )}

          {/* Hotels */}
          {trip.hotels.length > 0 && (
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-base">
                  <Hotel className="h-4 w-4" /> Отели ({trip.hotels.length})
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {trip.hotels.map((h, i) => (
                  <div key={i}>
                    {i > 0 && <Separator className="mb-4" />}
                    <div className="grid gap-3 sm:grid-cols-2">
                      <InfoRow label="Название" value={h.hotelName} />
                      <InfoRow label="Телефон" value={h.hotelPhone} />
                      <InfoRow label="Адрес" value={h.hotelAddress} />
                      <InfoRow label="Гость" value={h.guestName} />
                      <InfoRow
                        label="Check-in"
                        value={
                          h.checkinDate
                            ? `${h.checkinDate} ${h.checkinTime}`
                            : h.checkinTime
                        }
                      />
                      <InfoRow
                        label="Check-out"
                        value={
                          h.checkoutDate
                            ? `${h.checkoutDate} ${h.checkoutTime}`
                            : h.checkoutTime
                        }
                      />
                      <InfoRow label="Тип номера" value={h.roomType} />
                      <InfoRow label="Питание" value={h.mealPlan} />
                      <InfoRow label="Бронь №" value={h.confirmationNumber} />
                      <InfoRow label="Цена" value={h.price} />
                      <InfoRow label="PIN" value={h.pin} />
                      <InfoRow label="Отмена" value={h.cancellationPolicy} />
                    </div>
                    {h.specialRequests && (
                      <div className="mt-2">
                        <InfoRow label="Пожелания" value={h.specialRequests} />
                      </div>
                    )}
                    {h.propertyMessages?.length > 0 && (
                      <div className="mt-2 space-y-1">
                        <span className="text-xs text-muted-foreground">
                          Сообщения от отеля
                        </span>
                        {h.propertyMessages.map((msg, mi) => (
                          <p key={mi} className="text-sm whitespace-pre-wrap">
                            {msg}
                          </p>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </CardContent>
            </Card>
          )}

          <div className="grid gap-4 sm:grid-cols-2">
            {/* Guides */}
            {trip.guides.length > 0 && (
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center gap-2 text-base">
                    <UserCheck className="h-4 w-4" /> Гиды
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {trip.guides.map((g, i) => (
                    <div key={i} className="grid gap-2">
                      <InfoRow label="Имя" value={g.guideName} />
                      <InfoRow label="Телефон" value={g.guidePhone} />
                      {i < trip.guides.length - 1 && <Separator />}
                    </div>
                  ))}
                </CardContent>
              </Card>
            )}

            {/* Transfers */}
            {trip.transfers.length > 0 && (
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center gap-2 text-base">
                    <Car className="h-4 w-4" /> Транспорт (
                    {trip.transfers.length})
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {trip.transfers.map((t, i) => {
                    const tType = (t.type ?? "transfer") as TransferType;
                    const TypeIcon =
                      tType === "walking"
                        ? Footprints
                        : tType === "rental"
                          ? Car
                          : Bus;
                    const typeLabel =
                      tType === "walking"
                        ? "Пешком"
                        : tType === "rental"
                          ? "Аренда авто"
                          : "Трансфер";
                    return (
                      <div key={i}>
                        {i > 0 && <Separator className="mb-3" />}
                        <div className="flex items-center gap-2 mb-2">
                          <TypeIcon className="h-3.5 w-3.5 text-muted-foreground" />
                          <span className="text-xs font-medium uppercase text-muted-foreground">
                            {typeLabel}
                          </span>
                        </div>
                        <div className="grid gap-2 sm:grid-cols-2">
                          <InfoRow label="Описание" value={t.transferInfo} />
                          <InfoRow label="Откуда" value={t.fromLocation} />
                          <InfoRow label="Куда" value={t.toLocation} />
                          <InfoRow label="Дата" value={t.date} />
                          <InfoRow label="Время" value={t.time} />
                          <InfoRow label="Цена" value={t.price} />
                          <InfoRow
                            label="Бронь №"
                            value={t.confirmationNumber}
                          />

                          {/* Transfer-specific */}
                          {tType === "transfer" && (
                            <>
                              <InfoRow
                                label="Водитель"
                                value={t.transferDriverPhone}
                              />
                              <InfoRow
                                label="Место встречи"
                                value={t.transferMeetingPoint}
                              />
                            </>
                          )}

                          {/* Rental-specific */}
                          {tType === "rental" && (
                            <>
                              <InfoRow
                                label="Компания"
                                value={t.rentalCompany}
                              />
                              <InfoRow label="Авто" value={t.carModel} />
                              <InfoRow
                                label="Получение"
                                value={t.pickupLocation}
                              />
                              <InfoRow
                                label="Возврат"
                                value={t.dropoffLocation}
                              />
                              <InfoRow
                                label="Дата получения"
                                value={
                                  t.pickupDate
                                    ? `${t.pickupDate} ${t.pickupTime}`
                                    : t.pickupTime
                                }
                              />
                              <InfoRow
                                label="Дата возврата"
                                value={
                                  t.dropoffDate
                                    ? `${t.dropoffDate} ${t.dropoffTime}`
                                    : t.dropoffTime
                                }
                              />
                              <InfoRow
                                label="Тип страховки"
                                value={t.rentalInsuranceType}
                              />
                              <InfoRow
                                label="Телефон страховой"
                                value={t.rentalInsurancePhone}
                              />
                              <InfoRow
                                label="Детали страховки"
                                value={t.rentalInsuranceInfo}
                              />
                            </>
                          )}
                        </div>
                        {t.notes && (
                          <div className="mt-2">
                            <InfoRow label="Заметки" value={t.notes} />
                          </div>
                        )}
                      </div>
                    );
                  })}
                </CardContent>
              </Card>
            )}
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            {/* Insurances */}
            {trip.insurances.length > 0 && (
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center gap-2 text-base">
                    <Shield className="h-4 w-4" /> Страховки
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {trip.insurances.map((ins, i) => (
                    <div key={i} className="grid gap-2">
                      <InfoRow label="Информация" value={ins.insuranceInfo} />
                      <InfoRow label="Телефон" value={ins.insurancePhone} />
                      {i < trip.insurances.length - 1 && <Separator />}
                    </div>
                  ))}
                </CardContent>
              </Card>
            )}

            {/* Contact */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-base">
                  <Phone className="h-4 w-4" /> Контакт менеджера
                </CardTitle>
              </CardHeader>
              <CardContent className="grid gap-3">
                <InfoRow label="Телефон" value={trip.managerPhone} />
              </CardContent>
            </Card>
          </div>

          {/* Attractions */}
          {trip.attractions.length > 0 && (
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-base">
                  <MapPin className="h-4 w-4" /> Достопримечательности (
                  {trip.attractions.length})
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {trip.attractions.map((a, i) => (
                  <div key={i}>
                    {i > 0 && <Separator className="mb-4" />}
                    <div className="grid gap-3 sm:grid-cols-2">
                      <InfoRow label="Название" value={a.name} />
                      <InfoRow label="Место" value={a.location} />
                      <InfoRow label="Дата" value={a.date} />
                      <InfoRow label="Время" value={a.time} />
                      <InfoRow label="Цена" value={a.price} />
                      <InfoRow label="Бронь №" value={a.confirmationNumber} />
                    </div>
                    {a.description && (
                      <div className="mt-2">
                        <InfoRow label="Описание" value={a.description} />
                      </div>
                    )}
                    {a.notes && (
                      <div className="mt-1">
                        <InfoRow label="Заметка" value={a.notes} />
                      </div>
                    )}
                  </div>
                ))}
              </CardContent>
            </Card>
          )}

          {trip.notes && (
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base">Заметки</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">{trip.notes}</p>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Right column — Subscribers + Message history */}
        <div className="space-y-4 lg:col-span-1">
          {/* Subscribers */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-base">
                <Users className="h-4 w-4" />
                Подписчики ({subscribers.length})
              </CardTitle>
              <CardDescription>
                Telegram-пользователи, подключённые к поездке
              </CardDescription>
            </CardHeader>
            <CardContent>
              {subscribers.length === 0 ? (
                <div className="flex flex-col items-center py-4 text-center">
                  <Users className="mb-2 h-8 w-8 text-muted-foreground/50" />
                  <p className="text-sm text-muted-foreground">
                    Нет подписчиков. Отправьте deep-link клиентам.
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {subscribers.map((sub) => (
                    <div
                      key={sub.id}
                      className="flex items-center gap-3 rounded-lg border p-2"
                    >
                      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-blue-100 text-blue-700">
                        <User className="h-4 w-4" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">
                          {sub.name}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {sub.language.toUpperCase()} ·{" "}
                          {new Date(sub.joinedAt).toLocaleDateString("ru-RU")}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Message history + Chat */}
          <ChatWidget tripId={id} initialMessages={tripMessages} />
        </div>
      </div>
    </div>
  );
}

// ─── Chat Widget ────────────────────────────────────────

const MESSAGE_STYLES = {
  user: {
    bg: "bg-blue-100 text-blue-700",
    label: "Клиент",
    Icon: User,
  },
  assistant: {
    bg: "bg-green-100 text-green-700",
    label: "AI",
    Icon: Bot,
  },
  operator: {
    bg: "bg-orange-100 text-orange-700",
    label: "Оператор",
    Icon: Headset,
  },
} as const;

function ChatWidget({
  tripId,
  initialMessages,
}: {
  tripId: string;
  initialMessages: MessageData[];
}) {
  const [messages, setMessages] = useState<MessageData[]>(initialMessages);
  const [draft, setDraft] = useState("");
  const [sending, setSending] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Auto-scroll to bottom when messages change
  const scrollToBottom = useCallback(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, scrollToBottom]);

  // Poll for new messages every 5 seconds
  useEffect(() => {
    const interval = setInterval(async () => {
      try {
        const res = await fetch(`/api/trips/${tripId}/messages?limit=100`);
        if (!res.ok) return;
        const json = await res.json();
        const fetched: MessageData[] = (json.data ?? [])
          .sort(
            (a: MessageData, b: MessageData) =>
              new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime(),
          )
          .map((m: MessageData) => ({
            id: m.id,
            role: m.role,
            content: m.content,
            createdAt: m.createdAt,
          }));
        // Only update if count changed (avoid unnecessary re-renders)
        setMessages((prev) => {
          if (prev.length !== fetched.length) return fetched;
          if (prev[prev.length - 1]?.id !== fetched[fetched.length - 1]?.id)
            return fetched;
          return prev;
        });
      } catch {
        // Silent fail for polling
      }
    }, 5000);
    return () => clearInterval(interval);
  }, [tripId]);

  async function sendMessage() {
    const text = draft.trim();
    if (!text || sending) return;

    setSending(true);
    try {
      const res = await fetch(`/api/trips/${tripId}/messages`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: text }),
      });

      if (res.ok) {
        const json = await res.json();
        const newMsg: MessageData = {
          id: json.data.id,
          role: "operator",
          content: text,
          createdAt: json.data.createdAt,
        };
        setMessages((prev) => [...prev, newMsg]);
        setDraft("");
        // Reset textarea height
        if (textareaRef.current) {
          textareaRef.current.style.height = "auto";
        }
      }
    } catch (err) {
      console.error("Failed to send message:", err);
    } finally {
      setSending(false);
    }
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  }

  function handleInput(e: React.ChangeEvent<HTMLTextAreaElement>) {
    setDraft(e.target.value);
    // Auto-grow textarea
    const el = e.target;
    el.style.height = "auto";
    el.style.height = `${Math.min(el.scrollHeight, 120)}px`;
  }

  return (
    <Card className="flex h-[600px] flex-col">
      <CardHeader className="shrink-0 pb-3">
        <CardTitle className="flex items-center gap-2 text-base">
          <MessageSquare className="h-4 w-4" />
          Чат с клиентом
        </CardTitle>
        <CardDescription>{messages.length} сообщений</CardDescription>
      </CardHeader>

      {/* Scrollable message list */}
      <CardContent className="flex-1 overflow-hidden px-4 pb-0">
        <div
          ref={scrollRef}
          className="flex h-full flex-col gap-3 overflow-y-auto pr-1"
        >
          {messages.length === 0 ? (
            <div className="flex flex-1 flex-col items-center justify-center text-center">
              <MessageSquare className="mb-2 h-8 w-8 text-muted-foreground/50" />
              <p className="text-sm text-muted-foreground">Нет сообщений</p>
            </div>
          ) : (
            messages.map((msg) => {
              const style =
                MESSAGE_STYLES[msg.role] ?? MESSAGE_STYLES.assistant;
              const { Icon } = style;
              return (
                <div key={msg.id} className="flex gap-3">
                  <div
                    className={`mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full ${style.bg}`}
                  >
                    <Icon className="h-3.5 w-3.5" />
                  </div>
                  <div className="flex-1 space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-medium">{style.label}</span>
                      <span className="text-xs text-muted-foreground">
                        {formatTime(msg.createdAt)}
                      </span>
                    </div>
                    <p className="text-sm leading-relaxed text-muted-foreground whitespace-pre-wrap">
                      {msg.content}
                    </p>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </CardContent>

      {/* Input area */}
      <div className="shrink-0 border-t p-4">
        <div className="flex items-end gap-2">
          <textarea
            ref={textareaRef}
            value={draft}
            onChange={handleInput}
            onKeyDown={handleKeyDown}
            placeholder="Сообщение клиенту..."
            rows={1}
            className="flex-1 resize-none rounded-lg border bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            style={{ maxHeight: 120 }}
          />
          <Button
            size="icon"
            onClick={sendMessage}
            disabled={!draft.trim() || sending}
            className="shrink-0"
          >
            {sending ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Send className="h-4 w-4" />
            )}
          </Button>
        </div>
        <p className="mt-1.5 text-xs text-muted-foreground">
          Enter — отправить · Shift+Enter — новая строка
        </p>
      </div>
    </Card>
  );
}
