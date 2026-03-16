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
import { Plus } from "lucide-react";
import { AiFillDialog } from "@/components/admin/ai-fill-dialog";
import { LANGUAGES, TIMEZONES } from "@/lib/constants/locale";

interface CreateClientDialogProps {
  agencyId: string;
  onCreated: () => void;
}

export function CreateClientDialog({
  agencyId,
  onCreated,
}: CreateClientDialogProps) {
  const [open, setOpen] = useState(false);

  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [language, setLanguage] = useState("ru");
  const [timezone, setTimezone] = useState("Europe/Moscow");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [country, setCountry] = useState("");
  const [telegramUsername, setTelegramUsername] = useState("");
  const [whatsappPhone, setWhatsappPhone] = useState("");
  const [preferredMessenger, setPreferredMessenger] = useState("_none");
  const [source, setSource] = useState("");
  const [notes, setNotes] = useState("");

  function resetForm() {
    setName("");
    setPhone("");
    setEmail("");
    setLanguage("ru");
    setTimezone("Europe/Moscow");
    setFirstName("");
    setLastName("");
    setCountry("");
    setTelegramUsername("");
    setWhatsappPhone("");
    setPreferredMessenger("_none");
    setSource("");
    setNotes("");
  }

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
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const res = await fetch("/api/clients", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        agencyId,
        name,
        firstName: firstName || undefined,
        lastName: lastName || undefined,
        phone: phone || undefined,
        email: email || undefined,
        country: country || undefined,
        language,
        timezone,
        telegramUsername: telegramUsername || undefined,
        whatsappPhone: whatsappPhone || undefined,
        preferredMessenger:
          preferredMessenger === "_none" ? undefined : preferredMessenger,
        source: source || undefined,
        notes: notes || undefined,
      }),
    });
    if (res.ok) {
      setOpen(false);
      resetForm();
      onCreated();
    }
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(v) => {
        setOpen(v);
        if (!v) resetForm();
      }}
    >
      <DialogTrigger render={<Button />}>
        <Plus className="mr-2 h-4 w-4" />
        Новый клиент
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Новый клиент</DialogTitle>
          <DialogDescription>
            Добавьте информацию о новом клиенте
          </DialogDescription>
        </DialogHeader>
        <form className="space-y-4" onSubmit={handleSubmit}>
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
          <div className="space-y-2">
            <Label>Полное имя *</Label>
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Имя Фамилия"
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

          <Separator />

          {/* Контакты */}
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

          <Separator />

          {/* Мессенджеры */}
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

          <Separator />

          {/* Язык и регион */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Язык</Label>
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

          <Separator />

          {/* Доп. информация */}
          <div className="grid grid-cols-2 gap-4">
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

          <div className="flex justify-end gap-2 pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
            >
              Отмена
            </Button>
            <Button type="submit">Создать</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
