import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Plane,
  Users,
  MessageSquare,
  Bell,
  Plus,
  UserPlus,
  LinkIcon,
} from "lucide-react";
import { getCurrentManager } from "@/lib/admin-session";
import {
  tripRepository,
  clientRepository,
  notificationRepository,
  messageRepository,
} from "@/lib/db/repositories";
import Link from "next/link";

function formatDate(dateStr: Date | null) {
  if (!dateStr) return "—";
  return new Date(dateStr).toLocaleDateString("ru-RU", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

const statusMap: Record<
  string,
  { label: string; variant: "default" | "secondary" | "outline" }
> = {
  draft: { label: "Черновик", variant: "secondary" },
  active: { label: "Активна", variant: "default" },
  completed: { label: "Завершена", variant: "outline" },
};

export default async function AdminDashboardPage() {
  const manager = await getCurrentManager();
  const trips = await tripRepository.findByManagerId(manager.id);
  const clients = await clientRepository.findByAgencyId(manager.agencyId);
  const now = new Date();
  const oneWeekLater = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
  const pendingNotifications =
    await notificationRepository.findPending(oneWeekLater);
  const messagesToday = await messageRepository.countTodayByManager(manager.id);

  const activeTrips = trips.filter((t) => t.status === "active");
  const recentTrips = trips.slice(0, 5);

  const stats = [
    {
      title: "Активные поездки",
      value: String(activeTrips.length),
      description: "текущих поездок",
      icon: Plane,
      color: "text-blue-600",
      bg: "bg-blue-50",
    },
    {
      title: "Клиенты",
      value: String(clients.length),
      description: "всего клиентов",
      icon: Users,
      color: "text-green-600",
      bg: "bg-green-50",
    },
    {
      title: "Сообщений сегодня",
      value: String(messagesToday),
      description: "вопросов обработано",
      icon: MessageSquare,
      color: "text-purple-600",
      bg: "bg-purple-50",
    },
    {
      title: "Уведомления",
      value: String(pendingNotifications.length),
      description: "ожидают отправки",
      icon: Bell,
      color: "text-orange-600",
      bg: "bg-orange-50",
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground">
          Обзор турагентства — {manager.agency.name}
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <Card key={stat.title}>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {stat.title}
              </CardTitle>
              <div className={`rounded-lg p-2 ${stat.bg}`}>
                <stat.icon className={`h-4 w-4 ${stat.color}`} />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
              <p className="text-xs text-muted-foreground">
                {stat.description}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Recent Trips */}
      <Card>
        <CardHeader>
          <CardTitle>Последние поездки</CardTitle>
          <CardDescription>
            Недавно созданные и обновлённые поездки
          </CardDescription>
        </CardHeader>
        <CardContent>
          {recentTrips.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <Plane className="mb-4 h-12 w-12 text-muted-foreground/50" />
              <p className="text-muted-foreground">Нет поездок</p>
            </div>
          ) : (
            <div className="space-y-3">
              {recentTrips.map((trip) => {
                const client = (trip as unknown as { client: { name: string } })
                  .client;
                return (
                  <Link
                    key={trip.id}
                    href={`/admin/trips/${trip.id}`}
                    className="flex items-center justify-between rounded-lg border p-3 transition-colors hover:bg-muted/50"
                  >
                    <div className="flex items-center gap-3">
                      <Plane className="h-4 w-4 text-muted-foreground" />
                      <div>
                        <p className="font-medium">{client?.name ?? "—"}</p>
                        <p className="text-sm text-muted-foreground">
                          {trip.departureCity ?? "—"} →{" "}
                          {trip.arrivalCity ?? "—"}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-sm text-muted-foreground">
                        {formatDate(trip.flightDate)}
                      </span>
                      <Badge
                        variant={statusMap[trip.status]?.variant ?? "outline"}
                      >
                        {statusMap[trip.status]?.label ?? trip.status}
                      </Badge>
                    </div>
                  </Link>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <Link href="/admin/trips/new">
          <Card className="cursor-pointer transition-shadow hover:shadow-md h-full">
            <CardHeader>
              <div className="flex items-center gap-2">
                <Plus className="h-4 w-4 text-blue-600" />
                <CardTitle className="text-base">Создать поездку</CardTitle>
              </div>
              <CardDescription>
                Добавить новую поездку для клиента
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Badge>Быстрое действие</Badge>
            </CardContent>
          </Card>
        </Link>
        <Link href="/admin/clients">
          <Card className="cursor-pointer transition-shadow hover:shadow-md h-full">
            <CardHeader>
              <div className="flex items-center gap-2">
                <UserPlus className="h-4 w-4 text-green-600" />
                <CardTitle className="text-base">Добавить клиента</CardTitle>
              </div>
              <CardDescription>Зарегистрировать нового клиента</CardDescription>
            </CardHeader>
            <CardContent>
              <Badge variant="secondary">Быстрое действие</Badge>
            </CardContent>
          </Card>
        </Link>
        <Link href="/admin/trips">
          <Card className="cursor-pointer transition-shadow hover:shadow-md h-full">
            <CardHeader>
              <div className="flex items-center gap-2">
                <LinkIcon className="h-4 w-4 text-purple-600" />
                <CardTitle className="text-base">
                  Сгенерировать ссылку
                </CardTitle>
              </div>
              <CardDescription>
                Создать deep-link для Telegram бота
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Badge variant="outline">Быстрое действие</Badge>
            </CardContent>
          </Card>
        </Link>
      </div>
    </div>
  );
}
