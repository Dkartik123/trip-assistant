"use client";

import { useState } from "react";
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
} from "lucide-react";

interface TripData {
  id: string;
  clientName: string;
  clientPhone: string | null;
  status: "draft" | "active" | "completed";
  flightDate: string | null;
  flightNumber: string | null;
  departureCity: string | null;
  departureAirport: string | null;
  arrivalCity: string | null;
  arrivalAirport: string | null;
  gate: string | null;
  hotelName: string | null;
  hotelAddress: string | null;
  hotelPhone: string | null;
  checkinTime: string | null;
  checkoutTime: string | null;
  guideName: string | null;
  guidePhone: string | null;
  transferInfo: string | null;
  transferDriverPhone: string | null;
  transferMeetingPoint: string | null;
  insuranceInfo: string | null;
  insurancePhone: string | null;
  managerPhone: string | null;
  inviteToken: string | null;
  notes: string | null;
}

interface MessageData {
  id: string;
  role: "user" | "assistant";
  content: string;
  createdAt: string;
}

const statusMap = {
  draft: { label: "Черновик", variant: "secondary" as const },
  active: { label: "Активна", variant: "default" as const },
  completed: { label: "Завершена", variant: "outline" as const },
};

function formatDate(dateStr: string | null) {
  if (!dateStr) return "—";
  return new Date(dateStr).toLocaleDateString("ru-RU", {
    day: "numeric",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function formatTime(dateStr: string) {
  return new Date(dateStr).toLocaleTimeString("ru-RU", {
    hour: "2-digit",
    minute: "2-digit",
  });
}

function InfoRow({ label, value }: { label: string; value?: string | null }) {
  if (!value) return null;
  return (
    <div className="flex flex-col gap-0.5">
      <span className="text-xs text-muted-foreground">{label}</span>
      <span className="text-sm">{value}</span>
    </div>
  );
}

export function TripDetailClient({
  id,
  trip,
  messages: tripMessages,
}: {
  id: string;
  trip: TripData;
  messages: MessageData[];
}) {
  const [copied, setCopied] = useState(false);
  const botUsername = "trip_assistant_bot"; // TODO: From env
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
              <Badge variant={statusMap[trip.status].variant}>
                {statusMap[trip.status].label}
              </Badge>
            </div>
            <p className="text-muted-foreground">
              {trip.departureCity} → {trip.arrivalCity} •{" "}
              {formatDate(trip.flightDate)}
            </p>
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
                  Отправьте эту ссылку клиенту для подключения к боту
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
          {/* Flight */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-base">
                <Plane className="h-4 w-4" /> Рейс
              </CardTitle>
            </CardHeader>
            <CardContent className="grid gap-3 sm:grid-cols-3">
              <InfoRow label="Номер рейса" value={trip.flightNumber} />
              <InfoRow
                label="Дата и время"
                value={formatDate(trip.flightDate)}
              />
              <InfoRow label="Гейт" value={trip.gate} />
              <InfoRow label="Город вылета" value={trip.departureCity} />
              <InfoRow label="Аэропорт" value={trip.departureAirport} />
              <Separator className="sm:col-span-3" />
              <InfoRow label="Город прибытия" value={trip.arrivalCity} />
              <InfoRow label="Аэропорт" value={trip.arrivalAirport} />
            </CardContent>
          </Card>

          {/* Hotel */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-base">
                <Hotel className="h-4 w-4" /> Отель
              </CardTitle>
            </CardHeader>
            <CardContent className="grid gap-3 sm:grid-cols-2">
              <InfoRow label="Название" value={trip.hotelName} />
              <InfoRow label="Телефон" value={trip.hotelPhone} />
              <InfoRow label="Адрес" value={trip.hotelAddress} />
              <div className="flex gap-6">
                <InfoRow label="Check-in" value={trip.checkinTime} />
                <InfoRow label="Check-out" value={trip.checkoutTime} />
              </div>
            </CardContent>
          </Card>

          <div className="grid gap-4 sm:grid-cols-2">
            {/* Guide */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-base">
                  <UserCheck className="h-4 w-4" /> Гид
                </CardTitle>
              </CardHeader>
              <CardContent className="grid gap-3">
                <InfoRow label="Имя" value={trip.guideName} />
                <InfoRow label="Телефон" value={trip.guidePhone} />
              </CardContent>
            </Card>

            {/* Transfer */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-base">
                  <Car className="h-4 w-4" /> Трансфер
                </CardTitle>
              </CardHeader>
              <CardContent className="grid gap-3">
                <InfoRow label="Описание" value={trip.transferInfo} />
                <InfoRow label="Водитель" value={trip.transferDriverPhone} />
                <InfoRow
                  label="Место встречи"
                  value={trip.transferMeetingPoint}
                />
              </CardContent>
            </Card>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            {/* Insurance */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-base">
                  <Shield className="h-4 w-4" /> Страховка
                </CardTitle>
              </CardHeader>
              <CardContent className="grid gap-3">
                <InfoRow label="Информация" value={trip.insuranceInfo} />
                <InfoRow label="Телефон" value={trip.insurancePhone} />
              </CardContent>
            </Card>

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

        {/* Right column — Message history */}
        <div className="lg:col-span-1">
          <Card className="h-full">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <MessageSquare className="h-4 w-4" />
                История сообщений
              </CardTitle>
              <CardDescription>{tripMessages.length} сообщений</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {tripMessages.length === 0 ? (
                  <div className="flex flex-col items-center py-8 text-center">
                    <MessageSquare className="mb-2 h-8 w-8 text-muted-foreground/50" />
                    <p className="text-sm text-muted-foreground">
                      Нет сообщений
                    </p>
                  </div>
                ) : (
                  tripMessages.map((msg) => (
                    <div key={msg.id} className="flex gap-3">
                      <div
                        className={`mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full ${
                          msg.role === "user"
                            ? "bg-blue-100 text-blue-700"
                            : "bg-green-100 text-green-700"
                        }`}
                      >
                        {msg.role === "user" ? (
                          <User className="h-3.5 w-3.5" />
                        ) : (
                          <Bot className="h-3.5 w-3.5" />
                        )}
                      </div>
                      <div className="flex-1 space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-medium">
                            {msg.role === "user" ? "Клиент" : "AI"}
                          </span>
                          <span className="text-xs text-muted-foreground">
                            {formatTime(msg.createdAt)}
                          </span>
                        </div>
                        <p className="text-sm leading-relaxed text-muted-foreground">
                          {msg.content}
                        </p>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
