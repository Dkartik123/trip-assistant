# 🗺️ Trip Assistant — Roadmap

> Отмечай `[x]` когда задача выполнена.

---

## Этап 1 — MVP

### 1.1 Инфраструктура

- [x] Инициализация Next.js + TypeScript проекта
- [x] Docker + docker-compose (app + PostgreSQL)
- [x] docker-compose.dev.yml (только PostgreSQL для локальной разработки)
- [x] Dockerfile (multi-stage build, standalone output)
- [x] .env.example с описанием всех переменных
- [x] Zod-валидация environment variables (fail fast)
- [x] Pino structured logging (pretty dev / JSON prod)
- [x] GitHub Actions CI/CD (lint → test → build → deploy)
- [ ] Настроить Sentry SDK (`@sentry/nextjs` init)
- [ ] Настроить Uptime Kuma на VPS
- [ ] Купить домен + настроить DNS
- [ ] Настроить Nginx reverse proxy + SSL (Let's Encrypt)
- [ ] Первый деплой на Hetzner VPS

### 1.2 База данных

- [x] Drizzle ORM schema (agencies, managers, clients, trips, notifications, messages)
- [x] Enums (trip_status, notification_type, message_channel, etc.)
- [x] Индексы (client_id, flight_date, scheduled_at)
- [x] Relations (drizzle relational queries)
- [x] drizzle.config.ts
- [x] Первая миграция (`npm run db:generate`)
- [x] Применить миграцию (`npm run db:migrate`)
- [x] Seed-данные для разработки (тестовое агентство + менеджер + клиент + поездка)

### 1.3 REST API

- [x] `GET /api/health` — healthcheck (DB connectivity)
- [x] `POST /api/trips` — создать поездку (Zod-валидация)
- [x] `GET /api/trips` — список поездок по managerId
- [x] `GET /api/trips/:id` — детали поездки
- [x] `PUT /api/trips/:id` — обновить поездку
- [x] `DELETE /api/trips/:id` — удалить поездку
- [x] `POST /api/trips/:id/invite` — сгенерировать deep-link
- [x] `GET /api/trips/:id/messages` — история сообщений
- [x] Auth middleware (NextAuth v5 Credentials + JWT + Edge middleware)
- [x] `POST /api/clients` — создать клиента
- [x] `GET /api/clients` — список клиентов
- [x] Error response стандартизация (единый формат ошибок)

### 1.4 Telegram Bot

- [x] grammY инициализация (webhook mode)
- [x] `/start TOKEN` — привязка chat_id к клиенту
- [x] Text message handler → AI → сохранение истории
- [x] Voice handler → Whisper → AI → ответ
- [x] Group support (@mention / reply)
- [x] Rate limiter (10 msg/min, in-memory)
- [x] `/help` — список команд
- [x] Webhook endpoint `POST /api/webhook/telegram`
- [x] Зарегистрировать бота в @BotFather (@TripAssistant123Bot)
- [ ] Установить webhook URL (`bot.api.setWebhook(...)`) — при деплое
- [x] `/trip` — полная сводка поездки
- [x] `/flight` — данные рейса
- [x] `/hotel` — данные отеля
- [x] `/guide` — контакт гида
- [x] `/docs` — отправка файлов через Telegram Files API
- [x] Inline-кнопки (quick actions: рейс, отель, гид, документы, поддержка)
- [x] Push-уведомление клиенту при изменении поездки менеджером (diff по секциям)
- [x] `/support` — переключение на живого оператора
- [x] `/ai` — возврат к AI-ассистенту
- [x] Меню команд в Telegram (`bot.api.setMyCommands`)
- [x] Мульти-подписчики на поездку (`trip_subscribers` таблица)
- [x] Двусторонний чат оператор ↔ клиент (admin UI + Telegram)

### 1.5 AI-сервис (Google Gemini)

- [x] Gemini 2.0 Flash — основная модель
- [x] Gemini 2.0 Flash-Lite — fallback
- [x] System prompt с данными поездки
- [x] Контекст: последние 10 сообщений из истории
- [x] Fallback на номер менеджера если AI не может ответить
- [x] Auto-detect языка по тексту клиента
- [ ] Prompt engineering: улучшить system prompt на реальных вопросах
- [ ] Добавить общие знания (потеря багажа, болезнь, задержка рейса)
- [ ] Тестирование на русском, английском, эстонском

### 1.6 Голосовые сообщения (Whisper)

- [x] OpenAI Whisper API интеграция
- [x] Скачивание ogg из Telegram → Whisper → текст
- [x] Передача распознанного текста в AI
- [x] Обработка ошибок (пустая транскрипция, таймаут)
- [x] Поддержка длинных голосовых (>60 сек)

### 1.7 Система уведомлений

- [x] node-cron scheduler (каждые 5 мин)
- [x] Авто-создание уведомлений при создании поездки
- [x] Типы: 24h до, 3h до, по прибытии
- [x] Шаблоны уведомлений (текст)
- [x] Cleanup старых сообщений (6 месяцев, cron daily)
- [ ] Пересчёт времени в timezone клиента
- [x] Уведомление при изменении поездки менеджером (diff по секциям + перевод)
- [ ] Тестирование: создать поездку с flight_date через 1 час → проверить уведомление

### 1.8 WhatsApp

- [x] Webhook endpoint `POST /api/webhook/whatsapp`
- [ ] Twilio / 360dialog аккаунт + номер
- [ ] Полный message handler (текст → AI, голос → Whisper → AI)
- [ ] Привязка клиента через whatsapp_phone
- [ ] Отправка уведомлений через WhatsApp API
- [ ] Тестирование: сквозной flow (создать поездку → WhatsApp → вопрос → ответ)

### 1.9 Admin UI (Next.js)

- [x] Layout: sidebar + header (shadcn/ui + Tailwind)
- [x] Страница: список поездок (таблица с поиском/фильтром)
- [x] Страница: создание поездки (форма с табами)
- [x] Страница: редактирование поездки
- [x] Страница: просмотр истории сообщений клиента
- [x] Страница: генерация deep-link (копировать / отправить)
- [x] Страница: логин менеджера
- [x] Dashboard: статистика + быстрые действия
- [x] Страница: клиенты (таблица + добавление)
- [x] Страница: настройки (бот, AI, WhatsApp, безопасность)
- [x] Подключить Admin UI к реальным API (убрать mock данные)
- [x] Чат-виджет оператора (real-time polling, отправка сообщений в Telegram)

### 1.10 Тесты

- [x] Vitest конфигурация
- [x] AI service unit test (мок Gemini API)
- [x] Trip service unit test
- [ ] Notification service unit test
- [ ] API route integration tests (testcontainers)
- [x] Bot handler unit tests (мок grammY context)
- [ ] E2E: создать поездку → подключиться → задать вопрос → получить ответ

### 1.11 Качество кода

- [x] ESLint настроен
- [x] Prettier настроен
- [x] TypeScript 0 ошибок (`tsc --noEmit`)
- [x] Husky + lint-staged (pre-commit hooks)
- [x] Commitlint (conventional commits)

---

## Этап 2 — Пилот

- [ ] Найти 1–2 турагентства для пилота
- [ ] Создать реальные поездки в системе
- [ ] Собрать реальные вопросы туристов (логирование)
- [ ] Анализ: какие вопросы AI отвечает плохо
- [ ] Улучшить system prompt на основе реальных данных
- [ ] Добавить FAQ-базу (частые вопросы → быстрые ответы без AI)
- [ ] Собрать метрики: время ответа, % AI fallback, удовлетворённость
- [ ] Фидбек от менеджеров: что не хватает в admin UI
- [ ] Фидбек от туристов: что не хватает в боте
- [ ] Багфиксы по результатам пилота

---

## Этап 3 — Продукт

- [ ] Мультитенантность (несколько агентств, изоляция данных)
- [ ] Регистрация агентства (self-service)
- [ ] Подписка / биллинг (Stripe)
- [ ] Расширенный admin UI: аналитика, графики, экспорт
- [ ] Мультиязычность UI (i18n: RU, EN, ET)
- [ ] Шаблоны уведомлений на нескольких языках
- [ ] API rate limiting (по агентству)
- [ ] Документация API (Swagger / OpenAPI)
- [ ] Landing page (маркетинг)
- [ ] Онбординг для новых агентств

---

## Этап 4 — Масштабирование

- [ ] Интеграция с CRM (Bitrix24, AmoCRM)
- [ ] Интеграция с GDS (Amadeus, Sabre)
- [ ] Интеграция с OTA (Booking.com, Expedia)
- [ ] Upsell во время поездки (экскурсии, аренда авто, рестораны)
- [ ] Push-уведомления о задержках рейсов (FlightAware API)
- [ ] AI-рекомендации на основе погоды и локации
- [ ] Мобильное приложение (или Telegram Mini App)
- [ ] Партнёрская программа для агентств
- [ ] SOC 2 / GDPR compliance
- [ ] Горизонтальное масштабирование (Kubernetes)

---

_Последнее обновление: March 12, 2026_
