"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Settings, Bot, Globe, Shield } from "lucide-react";

export default function SettingsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Настройки</h1>
        <p className="text-muted-foreground">
          Конфигурация приложения
        </p>
      </div>

      {/* Telegram Bot */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bot className="h-5 w-5" />
            Telegram Bot
          </CardTitle>
          <CardDescription>
            Настройки Telegram бота для взаимодействия с клиентами
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>Bot Token</Label>
            <Input
              type="password"
              placeholder="123456789:ABCdefGHIjklMNOpqrsTUVwxyz"
              disabled
            />
            <p className="text-xs text-muted-foreground">
              Настраивается через переменную окружения TELEGRAM_BOT_TOKEN
            </p>
          </div>
          <div className="space-y-2">
            <Label>Webhook URL</Label>
            <div className="flex gap-2">
              <Input
                value="https://your-domain.com/api/webhook/telegram"
                readOnly
                className="font-mono text-sm"
              />
              <Button variant="outline">Обновить</Button>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-sm">Статус:</span>
            <Badge variant="secondary">Не подключен</Badge>
          </div>
        </CardContent>
      </Card>

      {/* AI */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            AI-модели
          </CardTitle>
          <CardDescription>
            Конфигурация Claude моделей
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label>Основная модель</Label>
              <Input value="claude-haiku-4-5-20251001" readOnly className="font-mono text-sm" />
              <p className="text-xs text-muted-foreground">
                Быстрые ответы, низкая стоимость
              </p>
            </div>
            <div className="space-y-2">
              <Label>Fallback модель</Label>
              <Input value="claude-sonnet-4-6-20250514" readOnly className="font-mono text-sm" />
              <p className="text-xs text-muted-foreground">
                Используется при ошибках основной
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* WhatsApp */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Globe className="h-5 w-5" />
            WhatsApp
          </CardTitle>
          <CardDescription>
            Интеграция с WhatsApp через Twilio
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-2">
            <span className="text-sm">Статус:</span>
            <Badge variant="outline">Не настроен</Badge>
          </div>
          <p className="mt-2 text-sm text-muted-foreground">
            Для подключения WhatsApp настройте TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN и TWILIO_WHATSAPP_NUMBER в переменных окружения.
          </p>
        </CardContent>
      </Card>

      {/* Security */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Безопасность
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>Сменить пароль</Label>
            <div className="grid gap-4 sm:grid-cols-3">
              <Input type="password" placeholder="Текущий пароль" />
              <Input type="password" placeholder="Новый пароль" />
              <Input type="password" placeholder="Подтверждение" />
            </div>
          </div>
          <Separator />
          <Button variant="outline">Сохранить пароль</Button>
        </CardContent>
      </Card>
    </div>
  );
}
