import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Plane, Users, MessageSquare, Bell } from "lucide-react";

// TODO: Replace with real data fetching from API
const stats = [
  {
    title: "Активные поездки",
    value: "—",
    description: "текущих поездок",
    icon: Plane,
    color: "text-blue-600",
    bg: "bg-blue-50",
  },
  {
    title: "Клиенты",
    value: "—",
    description: "всего клиентов",
    icon: Users,
    color: "text-green-600",
    bg: "bg-green-50",
  },
  {
    title: "Сообщений сегодня",
    value: "—",
    description: "вопросов обработано",
    icon: MessageSquare,
    color: "text-purple-600",
    bg: "bg-purple-50",
  },
  {
    title: "Уведомления",
    value: "—",
    description: "ожидают отправки",
    icon: Bell,
    color: "text-orange-600",
    bg: "bg-orange-50",
  },
];

export default function AdminDashboardPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground">
          Обзор турагентства
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
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <Plane className="mb-4 h-12 w-12 text-muted-foreground/50" />
            <p className="text-muted-foreground">
              Подключите базу данных для отображения поездок
            </p>
            <p className="text-sm text-muted-foreground/70">
              Запустите <code className="rounded bg-muted px-1.5 py-0.5 text-xs">docker compose -f docker-compose.dev.yml up</code> и выполните миграцию
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <Card className="cursor-pointer transition-shadow hover:shadow-md">
          <CardHeader>
            <CardTitle className="text-base">Создать поездку</CardTitle>
            <CardDescription>
              Добавить новую поездку для клиента
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Badge>Быстрое действие</Badge>
          </CardContent>
        </Card>
        <Card className="cursor-pointer transition-shadow hover:shadow-md">
          <CardHeader>
            <CardTitle className="text-base">Добавить клиента</CardTitle>
            <CardDescription>
              Зарегистрировать нового клиента
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Badge variant="secondary">Быстрое действие</Badge>
          </CardContent>
        </Card>
        <Card className="cursor-pointer transition-shadow hover:shadow-md">
          <CardHeader>
            <CardTitle className="text-base">Сгенерировать ссылку</CardTitle>
            <CardDescription>
              Создать deep-link для Telegram бота
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Badge variant="outline">Быстрое действие</Badge>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
