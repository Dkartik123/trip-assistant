"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
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
} from "lucide-react";

interface TripFormData {
  clientId: string;
  status: string;
  flightDate: string;
  flightNumber: string;
  departureCity: string;
  departureAirport: string;
  arrivalCity: string;
  arrivalAirport: string;
  gate: string;
  hotelName: string;
  hotelAddress: string;
  hotelPhone: string;
  checkinTime: string;
  checkoutTime: string;
  guideName: string;
  guidePhone: string;
  transferInfo: string;
  transferDriverPhone: string;
  transferMeetingPoint: string;
  insuranceInfo: string;
  insurancePhone: string;
  managerPhone: string;
  notes: string;
}

const emptyForm: TripFormData = {
  clientId: "",
  status: "draft",
  flightDate: "",
  flightNumber: "",
  departureCity: "",
  departureAirport: "",
  arrivalCity: "",
  arrivalAirport: "",
  gate: "",
  hotelName: "",
  hotelAddress: "",
  hotelPhone: "",
  checkinTime: "",
  checkoutTime: "",
  guideName: "",
  guidePhone: "",
  transferInfo: "",
  transferDriverPhone: "",
  transferMeetingPoint: "",
  insuranceInfo: "",
  insurancePhone: "",
  managerPhone: "",
  notes: "",
};

export function TripForm({
  initialData,
  isEdit = false,
}: {
  initialData?: Partial<TripFormData>;
  isEdit?: boolean;
}) {
  const router = useRouter();
  const [form, setForm] = useState<TripFormData>({
    ...emptyForm,
    ...initialData,
  });
  const [saving, setSaving] = useState(false);

  function update(field: keyof TripFormData, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    try {
      // TODO: POST/PUT to API
      await new Promise((r) => setTimeout(r, 500));
      router.push("/admin/trips");
    } finally {
      setSaving(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={() => router.back()}
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">
              {isEdit ? "Редактировать поездку" : "Новая поездка"}
            </h1>
            <p className="text-muted-foreground">
              {isEdit
                ? "Обновите данные поездки"
                : "Заполните информацию о поездке клиента"}
            </p>
          </div>
        </div>
        <Button type="submit" disabled={saving}>
          <Save className="mr-2 h-4 w-4" />
          {saving ? "Сохранение..." : "Сохранить"}
        </Button>
      </div>

      {/* General */}
      <Card>
        <CardHeader>
          <CardTitle>Основное</CardTitle>
          <CardDescription>Клиент и статус поездки</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="clientId">Клиент</Label>
            <Select value={form.clientId} onValueChange={(v) => update("clientId", v ?? "")}>
              <SelectTrigger>
                <SelectValue placeholder="Выберите клиента" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="1">Иван Петров</SelectItem>
                <SelectItem value="2">Анна Сидорова</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="status">Статус</Label>
            <Select value={form.status} onValueChange={(v) => update("status", v ?? "")}>
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
              value={form.managerPhone}
              onChange={(e) => update("managerPhone", e.target.value)}
            />
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="flight" className="w-full">
        <TabsList className="w-full justify-start">
          <TabsTrigger value="flight" className="gap-2">
            <Plane className="h-4 w-4" /> Рейс
          </TabsTrigger>
          <TabsTrigger value="hotel" className="gap-2">
            <Hotel className="h-4 w-4" /> Отель
          </TabsTrigger>
          <TabsTrigger value="guide" className="gap-2">
            <UserCheck className="h-4 w-4" /> Гид
          </TabsTrigger>
          <TabsTrigger value="transfer" className="gap-2">
            <Car className="h-4 w-4" /> Трансфер
          </TabsTrigger>
          <TabsTrigger value="insurance" className="gap-2">
            <Shield className="h-4 w-4" /> Страховка
          </TabsTrigger>
        </TabsList>

        <TabsContent value="flight">
          <Card>
            <CardHeader>
              <CardTitle>Информация о рейсе</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              <div className="space-y-2">
                <Label>Дата и время вылета</Label>
                <Input
                  type="datetime-local"
                  value={form.flightDate}
                  onChange={(e) => update("flightDate", e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label>Номер рейса</Label>
                <Input
                  placeholder="SU2134"
                  value={form.flightNumber}
                  onChange={(e) => update("flightNumber", e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label>Гейт</Label>
                <Input
                  placeholder="A12"
                  value={form.gate}
                  onChange={(e) => update("gate", e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label>Город вылета</Label>
                <Input
                  placeholder="Москва"
                  value={form.departureCity}
                  onChange={(e) => update("departureCity", e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label>Аэропорт вылета</Label>
                <Input
                  placeholder="SVO"
                  value={form.departureAirport}
                  onChange={(e) => update("departureAirport", e.target.value)}
                />
              </div>
              <Separator className="sm:col-span-2 lg:col-span-3" />
              <div className="space-y-2">
                <Label>Город прибытия</Label>
                <Input
                  placeholder="Анталья"
                  value={form.arrivalCity}
                  onChange={(e) => update("arrivalCity", e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label>Аэропорт прибытия</Label>
                <Input
                  placeholder="AYT"
                  value={form.arrivalAirport}
                  onChange={(e) => update("arrivalAirport", e.target.value)}
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="hotel">
          <Card>
            <CardHeader>
              <CardTitle>Информация об отеле</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label>Название отеля</Label>
                <Input
                  placeholder="Rixos Premium"
                  value={form.hotelName}
                  onChange={(e) => update("hotelName", e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label>Телефон отеля</Label>
                <Input
                  placeholder="+90 242 310 41 00"
                  value={form.hotelPhone}
                  onChange={(e) => update("hotelPhone", e.target.value)}
                />
              </div>
              <div className="space-y-2 sm:col-span-2">
                <Label>Адрес</Label>
                <Textarea
                  placeholder="Адрес отеля"
                  value={form.hotelAddress}
                  onChange={(e) => update("hotelAddress", e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label>Check-in</Label>
                <Input
                  placeholder="14:00"
                  value={form.checkinTime}
                  onChange={(e) => update("checkinTime", e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label>Check-out</Label>
                <Input
                  placeholder="12:00"
                  value={form.checkoutTime}
                  onChange={(e) => update("checkoutTime", e.target.value)}
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="guide">
          <Card>
            <CardHeader>
              <CardTitle>Информация о гиде</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label>Имя гида</Label>
                <Input
                  placeholder="Мехмет Йылмаз"
                  value={form.guideName}
                  onChange={(e) => update("guideName", e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label>Телефон гида</Label>
                <Input
                  placeholder="+90 532 123 45 67"
                  value={form.guidePhone}
                  onChange={(e) => update("guidePhone", e.target.value)}
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="transfer">
          <Card>
            <CardHeader>
              <CardTitle>Информация о трансфере</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2 sm:col-span-2">
                <Label>Описание трансфера</Label>
                <Textarea
                  placeholder="Индивидуальный трансфер аэропорт — отель"
                  value={form.transferInfo}
                  onChange={(e) => update("transferInfo", e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label>Телефон водителя</Label>
                <Input
                  placeholder="+90 532 987 65 43"
                  value={form.transferDriverPhone}
                  onChange={(e) => update("transferDriverPhone", e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label>Место встречи</Label>
                <Input
                  placeholder="Выход B, табличка с именем"
                  value={form.transferMeetingPoint}
                  onChange={(e) => update("transferMeetingPoint", e.target.value)}
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="insurance">
          <Card>
            <CardHeader>
              <CardTitle>Страховка</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2 sm:col-span-2">
                <Label>Информация о страховке</Label>
                <Textarea
                  placeholder="Полис #12345, покрытие до $50,000"
                  value={form.insuranceInfo}
                  onChange={(e) => update("insuranceInfo", e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label>Телефон страховой</Label>
                <Input
                  placeholder="+7 800 123 45 67"
                  value={form.insurancePhone}
                  onChange={(e) => update("insurancePhone", e.target.value)}
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Notes */}
      <Card>
        <CardHeader>
          <CardTitle>Заметки</CardTitle>
          <CardDescription>
            Дополнительная информация о поездке
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Textarea
            placeholder="Любые заметки: предпочтения клиента, особые пожелания..."
            rows={4}
            value={form.notes}
            onChange={(e) => update("notes", e.target.value)}
          />
        </CardContent>
      </Card>
    </form>
  );
}
