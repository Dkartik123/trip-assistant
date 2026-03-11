"use client";

import { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import {
  Plus,
  Search,
  Users,
  MessageSquare,
  Send,
  Pencil,
} from "lucide-react";

// ─── Types ────────────────────────────────────────────────

interface ClientRow {
  id: string;
  name: string;
  firstName: string | null;
  lastName: string | null;
  phone: string | null;
  email: string | null;
  country: string | null;
  language: string;
  locale: string | null;
  timezone: string;
  telegramChatId: string | null;
  telegramUsername: string | null;
  whatsappPhone: string | null;
  preferredMessenger: string | null;
  clientStatus: string;
  source: string | null;
  notes: string | null;
  preferredContactTime: string | null;
  voiceEnabled: boolean;
  notificationEnabled: boolean;
  emergencyContactName: string | null;
  emergencyContactPhone: string | null;
  consentMarketing: boolean;
  consentMessaging: boolean;
  consentPrivacy: boolean;
  tripsCount: number;
  lastActivity: string | null;
}

// ─── Constants ────────────────────────────────────────────

const LANGUAGES = [
  { value: "ru", label: "Русский" },
  { value: "en", label: "English" },
  { value: "et", label: "Eesti" },
  { value: "de", label: "Deutsch" },
  { value: "fi", label: "Suomi" },
  { value: "lv", label: "Latviešu" },
  { value: "lt", label: "Lietuvių" },
];

const TIMEZONES = [
  { value: "Europe/Moscow", label: "Москва (UTC+3)" },
  { value: "Europe/Tallinn", label: "Таллинн (UTC+2/+3)" },
  { value: "Europe/Riga", label: "Рига (UTC+2/+3)" },
  { value: "Europe/Helsinki", label: "Хельсинки (UTC+2/+3)" },
  { value: "Europe/London", label: "Лондон (UTC+0/+1)" },
  { value: "Europe/Berlin", label: "Берлин (UTC+1/+2)" },
  { value: "Asia/Dubai", label: "Дубай (UTC+4)" },
  { value: "UTC", label: "UTC" },
];

const CLIENT_STATUS_LABELS: Record<
  string,
  {
    label: string;
    variant: "default" | "secondary" | "destructive" | "outline";
  }
> = {
  active: { label: "Активен", variant: "default" },
  archived: { label: "Архив", variant: "secondary" },
  blocked: { label: "Заблокирован", variant: "destructive" },
};

function formatDate(dateStr: string | null) {
  if (!dateStr) return "—";
  return new Date(dateStr).toLocaleDateString("ru-RU", {
    day: "numeric",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });
}

// ─── Edit Dialog ─────────────────────────────────────────

function EditClientDialog({
  client,
  onSaved,
}: {
  client: ClientRow;
  onSaved: (updated: ClientRow) => void;
}) {
  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);

  // Controlled state for all Select fields
  const [language, setLanguage] = useState(client.language);
  const [timezone, setTimezone] = useState(client.timezone);
  const [preferredMessenger, setPreferredMessenger] = useState(
    client.preferredMessenger ?? "_none",
  );
  const [clientStatus, setClientStatus] = useState(client.clientStatus);
  const [voiceEnabled, setVoiceEnabled] = useState(
    client.voiceEnabled ? "true" : "false",
  );
  const [notificationEnabled, setNotificationEnabled] = useState(
    client.notificationEnabled ? "true" : "false",
  );

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSaving(true);
    const form = new FormData(e.currentTarget);

    const body = {
      name: form.get("name") as string,
      firstName: (form.get("firstName") as string) || null,
      lastName: (form.get("lastName") as string) || null,
      phone: (form.get("phone") as string) || null,
      email: (form.get("email") as string) || null,
      country: (form.get("country") as string) || null,
      language,
      timezone,
      telegramUsername: (form.get("telegramUsername") as string) || null,
      whatsappPhone: (form.get("whatsappPhone") as string) || null,
      preferredMessenger:
        preferredMessenger === "_none" ? null : preferredMessenger,
      clientStatus,
      source: (form.get("source") as string) || null,
      notes: (form.get("notes") as string) || null,
      preferredContactTime:
        (form.get("preferredContactTime") as string) || null,
      voiceEnabled: voiceEnabled === "true",
      notificationEnabled: notificationEnabled === "true",
      emergencyContactName:
        (form.get("emergencyContactName") as string) || null,
      emergencyContactPhone:
        (form.get("emergencyContactPhone") as string) || null,
      consentMarketing: form.get("consentMarketing") === "on",
      consentMessaging: form.get("consentMessaging") === "on",
      consentPrivacy: form.get("consentPrivacy") === "on",
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
          {/* Идентификация */}
          <div className="space-y-3">
            <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
              Идентификация
            </h3>
            <div className="space-y-2">
              <Label>Полное имя *</Label>
              <Input name="name" defaultValue={client.name} required />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Имя</Label>
                <Input
                  name="firstName"
                  defaultValue={client.firstName ?? ""}
                  placeholder="Иван"
                />
              </div>
              <div className="space-y-2">
                <Label>Фамилия</Label>
                <Input
                  name="lastName"
                  defaultValue={client.lastName ?? ""}
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
                  name="phone"
                  defaultValue={client.phone ?? ""}
                  placeholder="+7 999 123 45 67"
                />
              </div>
              <div className="space-y-2">
                <Label>Email</Label>
                <Input
                  name="email"
                  type="email"
                  defaultValue={client.email ?? ""}
                  placeholder="client@example.com"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Страна</Label>
              <Input
                name="country"
                defaultValue={client.country ?? ""}
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
                <Select value={language} onValueChange={(v) => v && setLanguage(v)}>
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
                <Select value={timezone} onValueChange={(v) => v && setTimezone(v)}>
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
                  name="telegramUsername"
                  defaultValue={client.telegramUsername ?? ""}
                  placeholder="@username"
                />
              </div>
              <div className="space-y-2">
                <Label>WhatsApp телефон</Label>
                <Input
                  name="whatsappPhone"
                  defaultValue={client.whatsappPhone ?? ""}
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
                <Select value={clientStatus} onValueChange={(v) => v && setClientStatus(v)}>
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
                  name="source"
                  defaultValue={client.source ?? ""}
                  placeholder="Реферал, сайт..."
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Заметки</Label>
              <Textarea
                name="notes"
                defaultValue={client.notes ?? ""}
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
                name="preferredContactTime"
                defaultValue={client.preferredContactTime ?? ""}
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
                  name="emergencyContactName"
                  defaultValue={client.emergencyContactName ?? ""}
                  placeholder="Мария Петрова"
                />
              </div>
              <div className="space-y-2">
                <Label>Телефон</Label>
                <Input
                  name="emergencyContactPhone"
                  defaultValue={client.emergencyContactPhone ?? ""}
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
                  name: "consentMarketing",
                  label: "Маркетинговые рассылки",
                  checked: client.consentMarketing,
                },
                {
                  name: "consentMessaging",
                  label: "Сообщения в мессенджерах",
                  checked: client.consentMessaging,
                },
                {
                  name: "consentPrivacy",
                  label: "Обработка персональных данных",
                  checked: client.consentPrivacy,
                },
              ].map(({ name, label, checked }) => (
                <label
                  key={name}
                  className="flex items-center gap-2 cursor-pointer"
                >
                  <input
                    type="checkbox"
                    name={name}
                    defaultChecked={checked}
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

// ─── Create Dialog ────────────────────────────────────────

function CreateClientDialog({
  agencyId,
  onCreated,
}: {
  agencyId: string;
  onCreated: () => void;
}) {
  const [open, setOpen] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    const res = await fetch("/api/clients", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        agencyId,
        name: form.get("name"),
        phone: form.get("phone") || undefined,
        email: form.get("email") || undefined,
        language: form.get("language") ?? "ru",
        timezone: form.get("timezone") ?? "Europe/Moscow",
      }),
    });
    if (res.ok) {
      setOpen(false);
      onCreated();
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger render={<Button />}>
        <Plus className="mr-2 h-4 w-4" />
        Новый клиент
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Новый клиент</DialogTitle>
          <DialogDescription>
            Добавьте информацию о новом клиенте
          </DialogDescription>
        </DialogHeader>
        <form className="space-y-4" onSubmit={handleSubmit}>
          <div className="space-y-2">
            <Label>Имя</Label>
            <Input name="name" placeholder="Имя Фамилия" required />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Телефон</Label>
              <Input name="phone" placeholder="+7 999 123 45 67" />
            </div>
            <div className="space-y-2">
              <Label>Email</Label>
              <Input
                name="email"
                type="email"
                placeholder="client@example.com"
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Язык</Label>
              <Select name="language" defaultValue="ru">
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
              <Select name="timezone" defaultValue="Europe/Moscow">
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

// ─── Main Component ───────────────────────────────────────

export function ClientsListClient({
  clients: initialClients,
  agencyId,
}: {
  clients: ClientRow[];
  agencyId: string;
}) {
  const [clients, setClients] = useState<ClientRow[]>(initialClients);
  const [search, setSearch] = useState("");

  const filtered = clients.filter(
    (c) =>
      !search ||
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.email?.toLowerCase().includes(search.toLowerCase()) ||
      c.phone?.includes(search),
  );

  function handleClientUpdated(updated: ClientRow) {
    setClients((prev) =>
      prev.map((c) => (c.id === updated.id ? updated : c)),
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Клиенты</h1>
          <p className="text-muted-foreground">Список клиентов турагентства</p>
        </div>
        <CreateClientDialog
          agencyId={agencyId}
          onCreated={() => window.location.reload()}
        />
      </div>

      {/* Search */}
      <Card>
        <CardContent className="pt-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Поиск по имени, email, телефону..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10"
            />
          </div>
        </CardContent>
      </Card>

      {/* Table */}
      <Card>
        <CardHeader>
          <CardTitle>Список клиентов</CardTitle>
          <CardDescription>Всего: {filtered.length} клиентов</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Имя</TableHead>
                <TableHead>Контакты</TableHead>
                <TableHead>Каналы</TableHead>
                <TableHead>Язык</TableHead>
                <TableHead>Статус</TableHead>
                <TableHead>Поездок</TableHead>
                <TableHead>Последняя активность</TableHead>
                <TableHead className="w-10" />
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className="py-12 text-center">
                    <Users className="mx-auto mb-4 h-12 w-12 text-muted-foreground/50" />
                    <p className="text-muted-foreground">Клиенты не найдены</p>
                  </TableCell>
                </TableRow>
              ) : (
                filtered.map((client) => {
                  const statusCfg =
                    CLIENT_STATUS_LABELS[client.clientStatus] ??
                    CLIENT_STATUS_LABELS.active;
                  return (
                    <TableRow key={client.id}>
                      <TableCell className="font-medium">
                        <div>{client.name}</div>
                        {client.notes && (
                          <div className="text-xs text-muted-foreground truncate max-w-[160px]">
                            {client.notes}
                          </div>
                        )}
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">
                          {client.phone && <div>{client.phone}</div>}
                          {client.email && (
                            <div className="text-muted-foreground">
                              {client.email}
                            </div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-1 flex-wrap">
                          {client.telegramChatId && (
                            <Badge variant="secondary" className="text-xs">
                              <Send className="mr-1 h-3 w-3" />
                              TG
                            </Badge>
                          )}
                          {client.whatsappPhone && (
                            <Badge variant="outline" className="text-xs">
                              <MessageSquare className="mr-1 h-3 w-3" />
                              WA
                            </Badge>
                          )}
                          {client.preferredMessenger && (
                            <Badge variant="outline" className="text-xs capitalize">
                              ★ {client.preferredMessenger}
                            </Badge>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className="text-xs">
                          {LANGUAGES.find((l) => l.value === client.language)
                            ?.label ?? client.language.toUpperCase()}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant={statusCfg.variant}
                          className="text-xs"
                        >
                          {statusCfg.label}
                        </Badge>
                      </TableCell>
                      <TableCell>{client.tripsCount}</TableCell>
                      <TableCell className="text-muted-foreground text-sm">
                        {formatDate(client.lastActivity)}
                      </TableCell>
                      <TableCell>
                        <EditClientDialog
                          client={client}
                          onSaved={handleClientUpdated}
                        />
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
