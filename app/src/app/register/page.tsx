"use client";

import Link from "next/link";
import { useActionState } from "react";
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
import { Plane, Star, Shield, Zap } from "lucide-react";
import { register, type RegisterState } from "./actions";

export default function RegisterPage() {
  const [state, formAction, isPending] = useActionState<
    RegisterState | undefined,
    FormData
  >(register, undefined);

  return (
    <div className="flex min-h-screen">
      {/* Left branding panel */}
      <div
        className="hidden lg:flex lg:w-1/2 flex-col justify-between p-12 relative overflow-hidden"
        style={{ background: "oklch(0.155 0.06 252)" }}
      >
        {/* Decorative circles */}
        <div
          className="absolute -top-32 -right-32 w-80 h-80 rounded-full opacity-10"
          style={{ background: "oklch(0.65 0.18 252)" }}
        />
        <div
          className="absolute -bottom-20 -left-20 w-64 h-64 rounded-full opacity-10"
          style={{ background: "oklch(0.65 0.18 252)" }}
        />

        {/* Logo */}
        <div className="flex items-center gap-3 relative z-10">
          <div
            className="flex h-10 w-10 items-center justify-center rounded-xl"
            style={{ background: "oklch(0.65 0.18 252 / 0.2)" }}
          >
            <Plane
              className="h-5 w-5"
              style={{ color: "oklch(0.65 0.18 252)" }}
            />
          </div>
          <span
            className="text-lg font-bold"
            style={{ color: "oklch(0.95 0.01 252)" }}
          >
            Trip Assistant
          </span>
        </div>

        {/* Center content */}
        <div className="relative z-10 space-y-6">
          <div className="space-y-2">
            <p
              className="text-4xl font-bold leading-tight"
              style={{ color: "oklch(0.95 0.01 252)" }}
            >
              Начните управлять поездками профессионально
            </p>
            <p className="text-base" style={{ color: "oklch(0.75 0.04 252)" }}>
              Зарегистрируйтесь бесплатно и подключите своё турагентство.
            </p>
          </div>

          <div className="space-y-3">
            {[
              { icon: Zap, text: "Быстрая настройка за 5 минут" },
              { icon: Shield, text: "Безопасное хранение данных клиентов" },
              { icon: Star, text: "AI-ассистент 24/7 для ваших клиентов" },
            ].map(({ icon: Icon, text }) => (
              <div key={text} className="flex items-center gap-3">
                <div
                  className="flex h-6 w-6 items-center justify-center rounded-md shrink-0"
                  style={{ background: "oklch(0.65 0.18 252 / 0.15)" }}
                >
                  <Icon
                    className="h-3.5 w-3.5"
                    style={{ color: "oklch(0.65 0.18 252)" }}
                  />
                </div>
                <span
                  className="text-sm"
                  style={{ color: "oklch(0.80 0.03 252)" }}
                >
                  {text}
                </span>
              </div>
            ))}
          </div>
        </div>

        <p
          className="text-xs relative z-10"
          style={{ color: "oklch(0.55 0.03 252)" }}
        >
          © 2026 Trip Assistant · AI Travel Management
        </p>
      </div>

      {/* Right form panel */}
      <div className="flex flex-1 items-center justify-center bg-background px-6 py-12 overflow-y-auto">
        <div className="w-full max-w-sm">
          {/* Mobile logo */}
          <div className="flex items-center justify-center gap-2 mb-8 lg:hidden">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary">
              <Plane className="h-5 w-5 text-primary-foreground" />
            </div>
            <span className="text-xl font-bold">Trip Assistant</span>
          </div>

          <Card className="border shadow-sm">
            <CardHeader className="pb-4">
              <CardTitle className="text-xl">Создать аккаунт</CardTitle>
              <CardDescription>
                Управление поездками для вашего турагентства
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form action={formAction} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name">
                    Имя <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="name"
                    name="name"
                    type="text"
                    placeholder="Иван Иванов"
                    required
                    autoComplete="name"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">
                    Email <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    placeholder="manager@agency.com"
                    required
                    autoComplete="email"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="password">
                    Пароль <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="password"
                    name="password"
                    type="password"
                    placeholder="Минимум 6 символов"
                    required
                    minLength={6}
                    autoComplete="new-password"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="confirmPassword">
                    Подтвердите пароль{" "}
                    <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="confirmPassword"
                    name="confirmPassword"
                    type="password"
                    placeholder="Повторите пароль"
                    required
                    minLength={6}
                    autoComplete="new-password"
                  />
                </div>

                <Separator />
                <p className="text-xs text-muted-foreground">
                  Необязательные поля
                </p>

                <div className="space-y-2">
                  <Label htmlFor="company">Компания</Label>
                  <Input
                    id="company"
                    name="company"
                    type="text"
                    placeholder="Название турагентства"
                    autoComplete="organization"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="phone">Телефон</Label>
                  <Input
                    id="phone"
                    name="phone"
                    type="tel"
                    placeholder="+372 555 1234"
                    autoComplete="tel"
                  />
                </div>

                {state?.error && (
                  <p className="rounded-md bg-destructive/10 px-3 py-2 text-sm text-destructive">
                    {state.error}
                  </p>
                )}

                <Button type="submit" className="w-full" disabled={isPending}>
                  {isPending ? "Создание аккаунта..." : "Создать аккаунт"}
                </Button>

                <p className="text-center text-sm text-muted-foreground">
                  Уже есть аккаунт?{" "}
                  <Link
                    href="/login"
                    className="text-primary hover:underline font-medium"
                  >
                    Войти
                  </Link>
                </p>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
