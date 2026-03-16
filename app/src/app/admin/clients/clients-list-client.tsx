"use client";

import { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
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
import { Search, Users, MessageSquare, Send } from "lucide-react";
import { LANGUAGES } from "@/lib/constants/locale";
import { CLIENT_STATUS_LABELS } from "@/lib/constants/client";
import { formatDate } from "@/lib/utils/date";
import type { ClientRow } from "@/lib/types/client";
import { EditClientDialog } from "./edit-client-dialog";
import { CreateClientDialog } from "./create-client-dialog";

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
    setClients((prev) => prev.map((c) => (c.id === updated.id ? updated : c)));
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
                            <Badge
                              variant="outline"
                              className="text-xs capitalize"
                            >
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
                        <Badge variant={statusCfg.variant} className="text-xs">
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
