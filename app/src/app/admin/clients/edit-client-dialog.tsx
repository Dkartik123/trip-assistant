"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Pencil } from "lucide-react";
import { AiFillDialog } from "@/components/admin/ai-fill-dialog";
import { LANGUAGES, TIMEZONES } from "@/lib/constants/locale";
import type { ClientRow } from "@/lib/types/client";

interface EditClientDialogProps {
  client: ClientRow;
  onSaved: (updated: ClientRow) => void;
}

export function EditClientDialog({ client, onSaved }: EditClientDialogProps) {
  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);

  const [name, setName] = useState(client.name);
  const [firstName, setFirstName] = useState(client.firstName ?? "");
  const [lastName, setLastName] = useState(client.lastName ?? "");
  const [phone, setPhone] = useState(client.phone ?? "");
  const [email, setEmail] = useState(client.email ?? "");
  const [country, setCountry] = useState(client.country ?? "");
  const [language, setLanguage] = useState(client.language);
  const [timezone, setTimezone] = useState(client.timezone);
  const [telegramUsername, setTelegramUsername] = useState(
    client.telegramUsername ?? "",
  );
  const [whatsappPhone, setWhatsappPhone] = useState(
    client.whatsappPhone ?? "",
  );
  const [preferredMessenger, setPreferredMessenger] = useState(
    client.preferredMessenger ?? "_none",
  );
  const [clientStatus, setClientStatus] = useState(client.clientStatus);
  const [source, setSource] = useState(client.source ?? "");
  const [notes, setNotes] = useState(client.notes ?? "");
  const [preferredContactTime, setPreferredContactTime] = useState(
    client.preferredContactTime ?? "",
  );
  const [voiceEnabled, setVoiceEnabled] = useState(
    client.voiceEnabled ? "true" : "false",
  );
  const [notificationEnabled, setNotificationEnabled] = useState(
    client.notificationEnabled ? "true" : "false",
  );
  const [emergencyContactName, setEmergencyContactName] = useState(
    client.emergencyContactName ?? "",
  );
  const [emergencyContactPhone, setEmergencyContactPhone] = useState(
    client.emergencyContactPhone ?? "",
  );
  const [consentMarketing, setConsentMarketing] = useState(
    client.consentMarketing,
  );
  const [consentMessaging, setConsentMessaging] = useState(
    client.consentMessaging,
  );
  const [consentPrivacy, setConsentPrivacy] = useState(client.consentPrivacy);

  function applyExtracted(data: Record<string, unknown>) {
    const s = (v: unknown) => (typeof v === "string" ? v : "");
    if (data.name) setName(s(data.name));
    if (data.firstName) setFirstName(s(data.firstName));
    if (data.lastName) setLastName(s(data.lastName));
    if (data.phone) setPhone(s(data.phone));
    if (data.email) setEmail(s(data.email));
    if (data.country) setCountry(s(data.country));
    if (data.language) setLanguage(s(data.language));
    if (data.timezone) setTimezone(s(data.timezone));
    if (data.telegramUsername) setTelegramUsername(s(data.telegramUsername));
    if (data.whatsappPhone) setWhatsappPhone(s(data.whatsappPhone));
    if (data.preferredMessenger)
      setPreferredMessenger(s(data.preferredMessenger));
    if (data.source) setSource(s(data.source));
    if (data.notes) setNotes(s(data.notes));
    if (data.preferredContactTime)
      setPreferredContactTime(s(data.preferredContactTime));
    if (data.emergencyContactName)
      setEmergencyContactName(s(data.emergencyContactName));
    if (data.emergencyContactPhone)
      setEmergencyContactPhone(s(data.emergencyContactPhone));
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSaving(true);

    const body = {
      name,
      firstName: firstName || null,
      lastName: lastName || null,
      phone: phone || null,
      email: email || null,
      country: country || null,
      language,
      timezone,
      telegramUsername: telegramUsername || null,
      whatsappPhone: whatsappPhone || null,
      preferredMessenger:
        preferredMessenger === "_none" ? null : preferredMessenger,
      clientStatus,
      source: source || null,
      notes: notes || null,
      preferredContactTime: preferredContactTime || null,
      voiceEnabled: voiceEnabled === "true",
      notificationEnabled: notificationEnabled === "true",
      emergencyContactName: emergencyContactName || null,
      emergencyContactPhone: emergencyContactPhone || null,
      consentMarketing,
      consentMessaging,
      consentPrivacy,
    };

    const res = await fetch(`/api/clients/${client.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });

    setSaving(false);

    if (res.ok) {
      const { data } = await res.json();
      onSaved({ ...client, ...data, tripsCount: client.tripsCount });
      setOpen(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger render={<Button variant="ghost" size="sm" />}>
        <Pencil className="h-4 w-4" />
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Редактировать клиента</DialogTitle>
          <DialogDescription>{client.name}</DialogDescription>
        </DialogHeader>

        <form className="space-y-6" onSubmit={handleSubmit}>
          <div className="flex justify-end">
            <AiFillDialog
              onExtracted={applyExtracted}
              endpoint="/api/clients/extract"
              title="AI заполнение клиента"
              description="Вставьте текст с данными клиента (из CRM, переписки, визитки, документа) или загрузите файл — AI автоматически заполнит поля формы."
              placeholder={
                "Вставьте текст с информацией о клиенте:\nимя, телефон, email, мессенджеры и т.д."
              }
            />
          </div>

          {/* Идентификация */}
          <div className="space-y-3">
            <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
              Идентификация
            </h3>
            <div className="space-y-2">
              <Label>Полное имя *</Label>
              <Input
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Имя</Label>
                <Input
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  placeholder="Иван"
                />
              </div>
              <div className="space-y-2">
                <Label>Фамилия</Label>
                <Input
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  placeholder="Петров"
                />
              </div>
            </div>
          </div>

          <Separator />

          {/* Контакты */}
          <div className="space-y-3">
            <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
              Контакты
            </h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Телефон</Label>
                <Input
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+7 999 123 45 67"
                />
              </div>
              <div className="space-y-2">
                <Label>Email</Label>
                <Input
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  type="email"
                  placeholder="client@example.com"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Страна</Label>
              <Input
                value={country}
                onChange={(e) => setCountry(e.target.value)}
                placeholder="Россия"
              />
            </div>
          </div>

          <Separator />

          {/* Язык и регион */}
          <div className="space-y-3">
            <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
              Язык и регион
            </h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Язык общения</Label>
                <Select
                  value={language}
                  onValueChange={(v) => v && setLanguage(v)}
                >
                  <SelectTrigger>
                    <SelectValue />
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
                <Label>Часовой пояс</Label>
                <Select
                  value={timezone}
                  onValueChange={(v) => v && setTimezone(v)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {TIMEZONES.map((tz) => (
                      <SelectItem key={tz.value} value={tz.value}>
                        {tz.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          <Separator />

          {/* Мессенджеры */}
          <div className="space-y-3">
            <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
              Мессенджеры
            </h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Telegram username</Label>
                <Input
                  value={telegramUsername}
                  onChange={(e) => setTelegramUsername(e.target.value)}
                  placeholder="@username"
                />
              </div>
              <div className="space-y-2">
                <Label>WhatsApp телефон</Label>
                <Input
                  value={whatsappPhone}
                  onChange={(e) => setWhatsappPhone(e.target.value)}
                  placeholder="+79991234567"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Предпочтительный канал</Label>
              <Select
                value={preferredMessenger}
                onValueChange={(v) => setPreferredMessenger(v ?? "_none")}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Не выбрано" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="_none">Не выбрано</SelectItem>
                  <SelectItem value="telegram">Telegram</SelectItem>
                  <SelectItem value="whatsapp">WhatsApp</SelectItem>
                  <SelectItem value="sms">SMS</SelectItem>
                  <SelectItem value="email">Email</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <Separator />

          {/* Бизнес */}
          <div className="space-y-3">
            <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
              Бизнес
            </h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Статус клиента</Label>
                <Select
                  value={clientStatus}
                  onValueChange={(v) => v && setClientStatus(v)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="active">Активен</SelectItem>
                    <SelectItem value="archived">Архив</SelectItem>
                    <SelectItem value="blocked">Заблокирован</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Источник</Label>
                <Input
                  value={source}
                  onChange={(e) => setSource(e.target.value)}
                  placeholder="Реферал, сайт..."
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Заметки</Label>
              <Textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="VIP клиент, предпочтения..."
                rows={3}
              />
            </div>
          </div>

          <Separator />

          {/* AI / уведомления */}
          <div className="space-y-3">
            <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
              AI и уведомления
            </h3>
            <div className="space-y-2">
              <Label>Предпочтительное время для связи</Label>
              <Input
                value={preferredContactTime}
                onChange={(e) => setPreferredContactTime(e.target.value)}
                placeholder="10:00 – 20:00"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Голосовые сообщения</Label>
                <Select
                  value={voiceEnabled}
                  onValueChange={(v) => v && setVoiceEnabled(v)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="true">Включены</SelectItem>
                    <SelectItem value="false">Отключены</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Уведомления</Label>
                <Select
                  value={notificationEnabled}
                  onValueChange={(v) => v && setNotificationEnabled(v)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="true">Включены</SelectItem>
                    <SelectItem value="false">Отключены</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          <Separator />

          {/* Экстренный контакт */}
          <div className="space-y-3">
            <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
              Экстренный контакт
            </h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Имя</Label>
                <Input
                  value={emergencyContactName}
                  onChange={(e) => setEmergencyContactName(e.target.value)}
                  placeholder="Мария Петрова"
                />
              </div>
              <div className="space-y-2">
                <Label>Телефон</Label>
                <Input
                  value={emergencyContactPhone}
                  onChange={(e) => setEmergencyContactPhone(e.target.value)}
                  placeholder="+7 999 000 00 00"
                />
              </div>
            </div>
          </div>

          <Separator />

          {/* Согласия */}
          <div className="space-y-3">
            <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
              Согласия
            </h3>
            <div className="space-y-2">
              {[
                {
                  label: "Маркетинговые рассылки",
                  checked: consentMarketing,
                  onChange: setConsentMarketing,
                },
                {
                  label: "Сообщения в мессенджерах",
                  checked: consentMessaging,
                  onChange: setConsentMessaging,
                },
                {
                  label: "Обработка персональных данных",
                  checked: consentPrivacy,
                  onChange: setConsentPrivacy,
                },
              ].map(({ label, checked, onChange }) => (
                <label
                  key={label}
                  className="flex items-center gap-2 cursor-pointer"
                >
                  <input
                    type="checkbox"
                    checked={checked}
                    onChange={(e) => onChange(e.target.checked)}
                    className="h-4 w-4 rounded border-input"
                  />
                  <span className="text-sm">{label}</span>
                </label>
              ))}
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
            >
              Отмена
            </Button>
            <Button type="submit" disabled={saving}>
              {saving ? "Сохранение..." : "Сохранить"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
