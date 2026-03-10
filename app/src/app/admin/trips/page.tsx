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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Plus, Search, Plane, Eye, Pencil, Link as LinkIcon } from "lucide-react";

type TripStatus = "draft" | "active" | "completed";

interface Trip {
  id: string;
  clientName: string;
  departureCity: string;
  arrivalCity: string;
  flightDate: string;
  flightNumber: string;
  hotelName: string;
  status: TripStatus;
  createdAt: string;
}

// TODO: Replace with real API call
const mockTrips: Trip[] = [
  {
    id: "1",
    clientName: "Иван Петров",
    departureCity: "Москва",
    arrivalCity: "Анталья",
    flightDate: "2026-03-15T10:30:00Z",
    flightNumber: "SU2134",
    hotelName: "Rixos Premium",
    status: "active",
    createdAt: "2026-03-01T12:00:00Z",
  },
  {
    id: "2",
    clientName: "Анна Сидорова",
    departureCity: "Таллинн",
    arrivalCity: "Барселона",
    flightDate: "2026-03-20T08:00:00Z",
    flightNumber: "BT311",
    hotelName: "Hotel Arts Barcelona",
    status: "draft",
    createdAt: "2026-03-05T09:00:00Z",
  },
  {
    id: "3",
    clientName: "Михаил Козлов",
    departureCity: "Санкт-Петербург",
    arrivalCity: "Дубай",
    flightDate: "2026-02-28T14:00:00Z",
    flightNumber: "FZ968",
    hotelName: "Atlantis The Palm",
    status: "completed",
    createdAt: "2026-02-15T15:00:00Z",
  },
];

const statusMap: Record<TripStatus, { label: string; variant: "default" | "secondary" | "outline" }> = {
  draft: { label: "Черновик", variant: "secondary" },
  active: { label: "Активна", variant: "default" },
  completed: { label: "Завершена", variant: "outline" },
};

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString("ru-RU", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export default function TripsListPage() {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");

  const filtered = mockTrips.filter((trip) => {
    const matchesSearch =
      !search ||
      trip.clientName.toLowerCase().includes(search.toLowerCase()) ||
      trip.arrivalCity.toLowerCase().includes(search.toLowerCase()) ||
      trip.flightNumber.toLowerCase().includes(search.toLowerCase());
    const matchesStatus =
      statusFilter === "all" || trip.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Поездки</h1>
          <p className="text-muted-foreground">
            Управление поездками клиентов
          </p>
        </div>
        <Button render={<Link href="/admin/trips/new" />}>
          <Plus className="mr-2 h-4 w-4" />
          Новая поездка
        </Button>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col gap-4 sm:flex-row">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Поиск по клиенту, городу, рейсу..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={statusFilter} onValueChange={(v) => setStatusFilter(v ?? "all")}>
              <SelectTrigger className="w-full sm:w-[180px]">
                <SelectValue placeholder="Статус" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Все статусы</SelectItem>
                <SelectItem value="draft">Черновик</SelectItem>
                <SelectItem value="active">Активна</SelectItem>
                <SelectItem value="completed">Завершена</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Table */}
      <Card>
        <CardHeader>
          <CardTitle>Список поездок</CardTitle>
          <CardDescription>
            Всего: {filtered.length} поездок
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Клиент</TableHead>
                <TableHead>Маршрут</TableHead>
                <TableHead>Рейс</TableHead>
                <TableHead>Дата</TableHead>
                <TableHead>Отель</TableHead>
                <TableHead>Статус</TableHead>
                <TableHead className="text-right">Действия</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-12">
                    <Plane className="mx-auto mb-4 h-12 w-12 text-muted-foreground/50" />
                    <p className="text-muted-foreground">Поездки не найдены</p>
                  </TableCell>
                </TableRow>
              ) : (
                filtered.map((trip) => (
                  <TableRow key={trip.id}>
                    <TableCell className="font-medium">
                      {trip.clientName}
                    </TableCell>
                    <TableCell>
                      {trip.departureCity} → {trip.arrivalCity}
                    </TableCell>
                    <TableCell className="font-mono text-sm">
                      {trip.flightNumber}
                    </TableCell>
                    <TableCell>{formatDate(trip.flightDate)}</TableCell>
                    <TableCell className="max-w-[150px] truncate">
                      {trip.hotelName}
                    </TableCell>
                    <TableCell>
                      <Badge variant={statusMap[trip.status].variant}>
                        {statusMap[trip.status].label}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-1">
                        <Button variant="ghost" size="icon" render={<Link href={`/admin/trips/${trip.id}`} />}>
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon" render={<Link href={`/admin/trips/${trip.id}/edit`} />}>
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon">
                          <LinkIcon className="h-4 w-4" />
                        </Button>
                      </div>
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
