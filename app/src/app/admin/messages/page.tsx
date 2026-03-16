import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  MessageSquare,
  User,
  Bot,
  Headset,
  Plane,
  ArrowRight,
} from "lucide-react";
import { getCurrentManager } from "@/lib/admin-session";
import { messageRepository } from "@/lib/db/repositories";

function formatTime(dateStr: Date) {
  return new Date(dateStr).toLocaleString("ru-RU", {
    day: "numeric",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });
}

interface MessageWithTrip {
  id: string;
  role: "user" | "assistant" | "operator";
  content: string;
  createdAt: Date;
  trip: {
    id: string;
    departureCity: string | null;
    arrivalCity: string | null;
    client: { name: string };
  };
}

export default async function MessagesPage() {
  const manager = await getCurrentManager();
  const rawMessages = await messageRepository.findByManagerTrips(
    manager.id,
    100,
  );
  const msgs = rawMessages as unknown as MessageWithTrip[];

  // Group messages by tripId
  const grouped = new Map<
    string,
    {
      tripId: string;
      clientName: string;
      route: string;
      messages: MessageWithTrip[];
    }
  >();
  for (const msg of msgs) {
    const tripId = msg.trip.id;
    if (!grouped.has(tripId)) {
      grouped.set(tripId, {
        tripId,
        clientName: msg.trip.client?.name ?? "—",
        route: `${msg.trip.departureCity ?? "—"} → ${msg.trip.arrivalCity ?? "—"}`,
        messages: [],
      });
    }
    grouped.get(tripId)!.messages.push(msg);
  }

  // Sort messages within each group by time asc
  const conversations = Array.from(grouped.values()).map((conv) => ({
    ...conv,
    messages: conv.messages.sort(
      (a, b) =>
        new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime(),
    ),
  }));

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Сообщения</h1>
        <p className="text-muted-foreground">
          Переписки клиентов с AI-ассистентом и оператором
        </p>
      </div>

      {conversations.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-16">
            <MessageSquare className="mb-4 h-12 w-12 text-muted-foreground/50" />
            <p className="text-muted-foreground">Нет сообщений</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {conversations.map((conv) => (
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
                  <div className="flex items-center gap-2">
                    <Badge variant="secondary">
                      {conv.messages.length} сообщений
                    </Badge>
                    <Link
                      href={`/admin/trips/${conv.tripId}`}
                      className="inline-flex items-center gap-1 rounded-md bg-primary px-3 py-1.5 text-xs font-medium text-primary-foreground hover:bg-primary/90 transition-colors"
                    >
                      Открыть чат
                      <ArrowRight className="h-3 w-3" />
                    </Link>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {conv.messages.slice(-10).map((msg) => (
                    <div key={msg.id} className="flex gap-3">
                      <div
                        className={`mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full ${
                          msg.role === "user"
                            ? "bg-blue-100 text-blue-700"
                            : msg.role === "operator"
                              ? "bg-orange-100 text-orange-700"
                              : "bg-green-100 text-green-700"
                        }`}
                      >
                        {msg.role === "user" ? (
                          <User className="h-3 w-3" />
                        ) : msg.role === "operator" ? (
                          <Headset className="h-3 w-3" />
                        ) : (
                          <Bot className="h-3 w-3" />
                        )}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-medium">
                            {msg.role === "user"
                              ? "Клиент"
                              : msg.role === "operator"
                                ? "Оператор"
                                : "AI"}
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
                  {conv.messages.length > 10 && (
                    <Link
                      href={`/admin/trips/${conv.tripId}`}
                      className="block text-center text-xs text-muted-foreground hover:text-foreground transition-colors"
                    >
                      … ещё {conv.messages.length - 10} сообщений →
                    </Link>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
