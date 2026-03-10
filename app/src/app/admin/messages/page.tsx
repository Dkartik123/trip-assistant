"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { MessageSquare, User, Bot, Plane } from "lucide-react";

// TODO: Replace with real API call — fetch recent messages across all trips
const mockConversations = [
  {
    tripId: "1",
    clientName: "Иван Петров",
    route: "Москва → Анталья",
    messages: [
      {
        id: "1",
        role: "user" as const,
        content: "Привет! Подскажите, во сколько регистрация на рейс?",
        createdAt: "2026-03-14T08:00:00Z",
      },
      {
        id: "2",
        role: "assistant" as const,
        content: "Здравствуйте, Иван! Ваш рейс SU2134 вылетает 15 марта в 10:30...",
        createdAt: "2026-03-14T08:00:05Z",
      },
    ],
  },
  {
    tripId: "3",
    clientName: "Михаил Козлов",
    route: "Санкт-Петербург → Дубай",
    messages: [
      {
        id: "5",
        role: "user" as const,
        content: "Какая погода сейчас в Дубае?",
        createdAt: "2026-03-10T14:20:00Z",
      },
      {
        id: "6",
        role: "assistant" as const,
        content: "В Дубае сейчас тёплая погода, около +28°C. Рекомендую взять лёгкую одежду и солнцезащитный крем.",
        createdAt: "2026-03-10T14:20:04Z",
      },
    ],
  },
];

function formatTime(dateStr: string) {
  return new Date(dateStr).toLocaleString("ru-RU", {
    day: "numeric",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default function MessagesPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Сообщения</h1>
        <p className="text-muted-foreground">
          Переписки клиентов с AI-ассистентом
        </p>
      </div>

      {mockConversations.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-16">
            <MessageSquare className="mb-4 h-12 w-12 text-muted-foreground/50" />
            <p className="text-muted-foreground">Нет сообщений</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {mockConversations.map((conv) => (
            <Card key={conv.tripId}>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2 text-base">
                    {conv.clientName}
                    <Badge variant="outline" className="font-normal">
                      <Plane className="mr-1 h-3 w-3" />
                      {conv.route}
                    </Badge>
                  </CardTitle>
                  <Badge variant="secondary">
                    {conv.messages.length} сообщений
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {conv.messages.map((msg) => (
                    <div key={msg.id} className="flex gap-3">
                      <div
                        className={`mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full ${
                          msg.role === "user"
                            ? "bg-blue-100 text-blue-700"
                            : "bg-green-100 text-green-700"
                        }`}
                      >
                        {msg.role === "user" ? (
                          <User className="h-3 w-3" />
                        ) : (
                          <Bot className="h-3 w-3" />
                        )}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-medium">
                            {msg.role === "user" ? "Клиент" : "AI"}
                          </span>
                          <span className="text-xs text-muted-foreground">
                            {formatTime(msg.createdAt)}
                          </span>
                        </div>
                        <p className="text-sm text-muted-foreground">
                          {msg.content}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
