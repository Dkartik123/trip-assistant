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
import { Plus, Search, Users, MessageSquare, Send } from "lucide-react";

interface Client {
  id: string;
  name: string;
  phone: string | null;
  email: string | null;
  telegramChatId: string | null;
  whatsappPhone: string | null;
  language: string;
  tripsCount: number;
  lastActivity: string | null;
}

// TODO: Replace with real API call
const mockClients: Client[] = [
  {
    id: "1",
    name: "Иван Петров",
    phone: "+7 999 123 45 67",
    email: "ivan@example.com",
    telegramChatId: "123456789",
    whatsappPhone: null,
    language: "ru",
    tripsCount: 2,
    lastActivity: "2026-03-14T09:15:00Z",
  },
  {
    id: "2",
    name: "Анна Сидорова",
    phone: "+372 555 98 76",
    email: "anna@example.com",
    telegramChatId: null,
    whatsappPhone: "+372 555 98 76",
    language: "et",
    tripsCount: 1,
    lastActivity: null,
  },
  {
    id: "3",
    name: "Михаил Козлов",
    phone: "+7 916 333 22 11",
    email: null,
    telegramChatId: "987654321",
    whatsappPhone: null,
    language: "ru",
    tripsCount: 3,
    lastActivity: "2026-03-10T14:22:00Z",
  },
];

function formatDate(dateStr: string | null) {
  if (!dateStr) return "—";
  return new Date(dateStr).toLocaleDateString("ru-RU", {
    day: "numeric",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default function ClientsPage() {
  const [search, setSearch] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);

  const filtered = mockClients.filter(
    (c) =>
      !search ||
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.email?.toLowerCase().includes(search.toLowerCase()) ||
      c.phone?.includes(search),
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Клиенты</h1>
          <p className="text-muted-foreground">
            Список клиентов турагентства
          </p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
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
            <form
              className="space-y-4"
              onSubmit={(e) => {
                e.preventDefault();
                setDialogOpen(false);
              }}
            >
              <div className="space-y-2">
                <Label>Имя</Label>
                <Input placeholder="Имя Фамилия" required />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Телефон</Label>
                  <Input placeholder="+7 999 123 45 67" />
                </div>
                <div className="space-y-2">
                  <Label>Email</Label>
                  <Input type="email" placeholder="client@example.com" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Язык</Label>
                  <Select defaultValue="ru">
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="ru">Русский</SelectItem>
                      <SelectItem value="en">English</SelectItem>
                      <SelectItem value="et">Eesti</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Часовой пояс</Label>
                  <Select defaultValue="Europe/Moscow">
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Europe/Moscow">Москва</SelectItem>
                      <SelectItem value="Europe/Tallinn">Таллинн</SelectItem>
                      <SelectItem value="UTC">UTC</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setDialogOpen(false)}
                >
                  Отмена
                </Button>
                <Button type="submit">Создать</Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
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
                <TableHead>Поездок</TableHead>
                <TableHead>Последняя активность</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="py-12 text-center">
                    <Users className="mx-auto mb-4 h-12 w-12 text-muted-foreground/50" />
                    <p className="text-muted-foreground">
                      Клиенты не найдены
                    </p>
                  </TableCell>
                </TableRow>
              ) : (
                filtered.map((client) => (
                  <TableRow key={client.id}>
                    <TableCell className="font-medium">
                      {client.name}
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
                      <div className="flex gap-1">
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
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className="text-xs">
                        {client.language.toUpperCase()}
                      </Badge>
                    </TableCell>
                    <TableCell>{client.tripsCount}</TableCell>
                    <TableCell className="text-muted-foreground text-sm">
                      {formatDate(client.lastActivity)}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
