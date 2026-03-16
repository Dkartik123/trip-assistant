"use client";

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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ClientCombobox } from "@/components/admin/client-combobox";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Plane,
  Hotel,
  UserCheck,
  Car,
  Shield,
  ArrowLeft,
  Save,
  Ticket,
} from "lucide-react";
import { AiFillDialog } from "@/components/admin/ai-fill-dialog";
import type {
  FlightItem,
  HotelItem,
  GuideItem,
  TransferItem,
  InsuranceItem,
  AttractionItem,
} from "@/lib/types/trip-sections";

import { useTripForm, type ClientOption } from "./use-trip-form";
import { FlightSection } from "./flight-section";
import { HotelSection } from "./hotel-section";
import { GuideSection } from "./guide-section";
import { TransferSection } from "./transfer-section";
import { InsuranceSection } from "./insurance-section";
import { AttractionSection } from "./attraction-section";
import { NotesSection } from "./notes-section";
import { LANGUAGES } from "@/lib/constants/locale";

// ─── Public interface ────────────────────────────────────

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
    attractions?: AttractionItem[];
    notes?: string;
  };
  isEdit?: boolean;
  tripId?: string;
  managerId: string;
  agencyId: string;
  clients: ClientOption[];
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
  const form = useTripForm({
    initialData,
    isEdit,
    tripId,
    managerId,
    initialClients,
  });

  return (
    <form
      onSubmit={form.handleSubmit}
      className="min-w-0 space-y-4 sm:space-y-6"
    >
      {/* Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3 sm:gap-4">
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="shrink-0"
            onClick={() => form.router.back()}
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
          <AiFillDialog onExtracted={form.applyExtracted} />
          <Button
            type="submit"
            disabled={form.saving}
            className="flex-1 sm:flex-initial"
          >
            <Save className="mr-2 h-4 w-4" />
            {form.saving ? "Сохранение..." : "Сохранить"}
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
            clients={form.clientList}
            value={form.clientId}
            onValueChange={(id) => {
              form.setClientId(id);
              form.setErrors((p) => ({
                ...p,
                clientId: undefined as unknown as string,
              }));
            }}
            onClientCreated={(c) => form.setClientList((prev) => [...prev, c])}
            agencyId={agencyId}
            error={form.errors.clientId}
          />
          <div className="space-y-2">
            <Label htmlFor="status">Статус</Label>
            <Select
              value={form.status}
              onValueChange={(v) => form.setStatus(v ?? "")}
            >
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
            <Label htmlFor="clientLanguage">Язык общения</Label>
            <Select
              value={form.clientLanguage}
              onValueChange={(v) => v && form.setClientLanguage(v)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Выберите язык" />
              </SelectTrigger>
              <SelectContent>
                {LANGUAGES.map((l) => (
                  <SelectItem key={l.value} value={l.value}>
                    {l.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="managerPhone">Телефон менеджера (для AI)</Label>
            <Input
              id="managerPhone"
              placeholder="+7 (999) 123-45-67"
              value={form.managerPhone}
              onChange={(e) => form.setManagerPhone(e.target.value)}
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
          <TabsTrigger
            value="attraction"
            className="gap-1.5 px-2 text-xs sm:gap-2 sm:px-3 sm:text-sm"
          >
            <Ticket className="h-3.5 w-3.5 sm:h-4 sm:w-4" /> Активности
          </TabsTrigger>
        </TabsList>

        <TabsContent value="flight">
          <FlightSection flights={form.flights} setFlights={form.setFlights} />
        </TabsContent>
        <TabsContent value="hotel">
          <HotelSection hotels={form.hotels} setHotels={form.setHotels} />
        </TabsContent>
        <TabsContent value="guide">
          <GuideSection guides={form.guides} setGuides={form.setGuides} />
        </TabsContent>
        <TabsContent value="transfer">
          <TransferSection
            transfers={form.transfers}
            setTransfers={form.setTransfers}
          />
        </TabsContent>
        <TabsContent value="insurance">
          <InsuranceSection
            insurances={form.insurances}
            setInsurances={form.setInsurances}
          />
        </TabsContent>
        <TabsContent value="attraction">
          <AttractionSection
            attractions={form.attractions}
            setAttractions={form.setAttractions}
          />
        </TabsContent>
      </Tabs>

      {/* Notes */}
      <NotesSection
        noteCards={form.noteCards}
        setNoteCards={form.setNoteCards}
      />
    </form>
  );
}
