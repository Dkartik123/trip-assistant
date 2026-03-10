# Plan: Travel Assistant MVP (Telegram Bot)

**TL;DR** — Строим Telegram-бота на Node.js/TypeScript, который работает как AI-ассистент для туристов. Менеджер турагентства создаёт поездку через простой UI в Next.js, клиент подключается через Telegram deep-link (постоянный токен). Бот работает через webhook, поддерживает текст и голосовые сообщения (Whisper), использует Claude AI (с auto-detect языка). Групповые туры — через Telegram Group. WhatsApp подключается параллельно с MVP. Деплой на VPS (Hetzner) через GitHub Actions.

**Стек:** Next.js (App Router) + TypeScript, PostgreSQL + Drizzle ORM, Next.js API Routes (REST API), grammY (Telegram webhook), Claude AI (Anthropic) + Whisper (voice), NextAuth/Clerk, Sentry, node-cron, Zod, Vitest, Docker, Nginx.

## Architectural Decisions (20 вопросов)

| # | Вопрос | Решение |
|---|--------|---------|
| 1 | Bot mode | **Webhook** (HTTPS endpoint) |
| 2 | Admin UI | **UI в Next.js** с MVP |
| 3 | Multi-tenant | **1 агентство** (пилот для себя), multi-tenancy позже |
| 4 | Trip update | **Push-уведомление** клиенту при изменении поездки |
| 5 | Documents | **Файлы через Telegram** (bot отправляет файлы напрямую) |
| 6 | Auth manager | **NextAuth / Clerk** |
| 7 | Language | **AI auto-detect** языка по тексту сообщения |
| 8 | CI/CD | **GitHub Actions** → push в main → деплой на VPS |
| 9 | Trip token | **Permanent** (chat_id привязывается раз и навсегда) |
| 10 | Multi-trip | **1 активная поездка** на клиента в MVP |
| 11 | Monitoring | **Sentry** (ошибки бота + API) |
| 12 | Timezones | **Client TZ** (timezone где клиент сейчас находится) |
| 13 | AI fallback | **Отправить номер менеджера** если AI не может ответить |
| 14 | Rate limit | **In-memory** (10 сообщений/мин на клиента) |
| 15 | DB backup | **Без бэкапов** в MVP (Hetzner snapshot руками) |
| 16 | WhatsApp | **Telegram + WhatsApp с МВП** (параллельно через Twilio/360dialog) |
| 17 | Group trip | **Telegram Group** (бот добавляется в группу семьи/туристов) |
| 18 | Media input | **Текст + голосовые** сообщения (Whisper ASR) |
| 19 | Billing | **Бесплатно** в пилоте, монетизация позже |
| 20 | History | **6 месяцев** хранения переписки, потом auto-delete |

---

## Steps

### 1. Инициализация проекта

- Создать Node.js проект с TypeScript (`tsconfig.json`, `package.json`)
- Настроить ESLint + Prettier
- Настроить структуру папок:
  ```
  src/
    bot/          — Telegram bot handlers
    api/          — REST API для менеджеров
    services/     — бизнес-логика (trip, notification, ai)
    db/           — миграции, модели, репозитории
    scheduler/    — cron-задачи для уведомлений
    utils/        — хелперы
  ```
- Зависимости: `next`, `react`, `react-dom`, `grammy`, `@anthropic-ai/sdk`, `openai` (Whisper), `pg`, `drizzle-orm`, `node-cron`, `zod`, `pino`, `@sentry/nextjs`, `next-auth`, `twilio` (WhatsApp)

---

### 2. База данных (PostgreSQL + Drizzle ORM)

Создать миграции для таблиц:

- **`agencies`** — id, name, api_key
- **`managers`** — id, agency_id, name, email, password_hash
- **`clients`** — id, agency_id, name, phone, email, telegram_chat_id, telegram_group_id, whatsapp_phone, timezone, language
- **`trips`** — id, client_id, manager_id, status (draft/active/completed), flight_date, flight_number, departure_city, departure_airport, arrival_city, arrival_airport, gate, hotel_name, hotel_address, hotel_phone, checkin_time, checkout_time, guide_name, guide_phone, transfer_info, transfer_driver_phone, transfer_meeting_point, insurance_info, insurance_phone, manager_phone, notes, created_at, updated_at
- **`notifications`** — id, trip_id, type (24h_before/3h_before/arrival/custom), scheduled_at, sent_at, status
- **`messages`** — id, trip_id, chat_id, channel (telegram/whatsapp), role (user/assistant), content, content_type (text/voice), created_at

Индексы на `trips.client_id`, `trips.flight_date`, `notifications.scheduled_at`.

Auto-delete: задача cron удаляет сообщения старше 6 месяцев после завершения поездки.

---

### 3. Admin UI + REST API (Next.js App Router + NextAuth/Clerk)

Админ-панель менеджера — простой Next.js UI (список поездок, форма создания/редактирования, просмотр истории сообщений).

Автентификация через **NextAuth / Clerk** (email+password). API-рауты защищены session middleware.

Эндпоинты реализуются через `app/api/` route handlers в Next.js App Router:

- `POST /api/auth/login` — вход менеджера
- `POST /api/trips` — создать поездку
- `GET /api/trips` — список поездок
- `GET /api/trips/:id` — детали поездки
- `PUT /api/trips/:id` — обновить поездку
- `DELETE /api/trips/:id` — удалить поездку
- `POST /api/trips/:id/invite` — сгенерировать Telegram deep-link для клиента
- `GET /api/trips/:id/messages` — история сообщений клиента (все каналы)
- `POST /api/webhook/telegram` — webhook endpoint для Telegram
- `POST /api/webhook/whatsapp` — webhook endpoint для WhatsApp

Валидация через Zod-схемы.

---

### 4. Telegram Bot (grammY, Webhook)

grammY настроен на **webhook**: `POST /api/webhook/telegram` принимает обновления от Telegram и обрабатывает синхронно. SSL-сертификат через Let's Encrypt с первого дня.

**Deep-link:** клиент переходит по ссылке `t.me/bot_name?start=TRIP_TOKEN`. Токен перманентный — `chat_id` привязывается один раз и не меняется.

**Команда `/start TRIP_TOKEN`:**
- Валидировать токен
- Привязать `telegram_chat_id` к клиенту
- Отправить приветствие с кратким описанием поездки

**Обработка текстовых сообщений:**
- In-memory rate limit: не более 10 сообщений/мин на `chat_id`
- Загрузить данные поездки из БД
- Передать в AI-сервис для генерации ответа
- Сохранить сообщение и ответ в `messages`

**Голосовые сообщения:**
- Получить `voice.file_id` из Telegram
- Скачать ogg-файл, отправить в **OpenAI Whisper API** (`whisper-1`)
- Полученный текст передать в AI-сервис как обычное сообщение

**Групповые туры (Telegram Group):**
- Менеджер добавляет бота в групповой чат (семья, тургруппа)
- Бот отвечает на @меншны или реплаи на свои сообщения
- `telegram_group_id` хранится в `clients`

**Команды:**
- `/trip` — краткая информация о поездке
- `/flight` — данные рейса
- `/hotel` — данные отеля
- `/guide` — контакт гида
- `/docs` — бот отправляет файл через Telegram Files API
- `/help` — список команд

---

### 5. AI-сервис (Claude)

**Модели:**
- `claude-haiku-4-5` — основная модель для 90% вопросов (FAQ: рейс, отель, гид). $1/$5 за 1M токенов.
- `claude-sonnet-4-6` — fallback для сложных вопросов (потеря багажа, болезнь, нестандартные ситуации). $3/$15 за 1M токенов.
- `whisper-1` (OpenAI) — распознавание голосовых сообщений в текст.

**System prompt содержит:**
- Роль: "Ты — персональный travel-ассистент"
- Полные данные поездки из БД в структурированном виде
- Правила: отвечать только про поездку, быть дружелюбным и кратким
- Общие знания: действия при потере багажа, болезни, задержке рейса
- Язык: **auto-detect** по языку сообщения клиента (шаблоны уведомлений хранятся в form статически)

**Контекст:** последние 10 сообщений из истории + данные поездки.

**Fallback:** если AI не может ответить — бот отправляет `manager_phone` из данных поездки.

---

### 6. Система уведомлений (Scheduler)

`node-cron` задача каждые 5 минут:
- Найти поездки с `flight_date` в нужном окне (время хранится в UTC, пересчёт в **client timezone**)
- Проверить, не отправлено ли уже уведомление
- Отправить через Telegram Bot API и/или WhatsApp API

**Типы уведомлений:**

- **За 24 часа:** напоминание о рейсе, чек-лист (паспорт, билеты, онлайн-регистрация)
- **За 3 часа:** время рейса, gate (если есть), аэропорт
- **По прибытии:** приветствие в городе, маршрут до отеля, контакт трансфера
- **При изменении поездки менеджером:** push-уведомление с деталью что изменилось

Записи в `notifications` создаются при создании/обновлении поездки. Время хранится в UTC, расчёт "когда отправлять" выполняется с учётом `client.timezone`.

---

### 7. WhatsApp Integration (Twilio / 360dialog)

- Webhook: `POST /api/webhook/whatsapp` принимает сообщения из WhatsApp Business API
- Общий **message handler** для обоих каналов (текст → AI, голос → Whisper → AI)
- `channel` поле в `messages` отслеживает откуда пришло сообщение
- Привязка клиента через `whatsapp_phone`

---

### 8. Docker + Деплой (VPS Hetzner)

- `Dockerfile` для Next.js приложения
- `docker-compose.yml`: app + PostgreSQL
- `.env`: `DATABASE_URL`, `TELEGRAM_BOT_TOKEN`, `ANTHROPIC_API_KEY`, `OPENAI_API_KEY`, `NEXTAUTH_SECRET`, `SENTRY_DSN`, `TWILIO_ACCOUNT_SID`, `TWILIO_AUTH_TOKEN`
- Деплой на Hetzner VPS через **GitHub Actions** (пуш в `main` → SSH + docker compose up)
- Nginx reverse proxy для Next.js + webhook endpoints
- SSL через Let's Encrypt (certbot) — **обязательно с первого дня** для Telegram webhook

---

### 9. Мониторинг и логирование

- **Sentry** (`@sentry/nextjs`) — ошибки бота, API routes, серверных акций
- `pino` для структурированного логирования
- Health-check эндпоинт `GET /api/health`
- Uptime Kuma на том же VPS для мониторинга аптайма

---

## Verification

- **Unit-тесты (Vitest):** AI-сервис (мок Claude API), сервис поездок, Zod-валидация
- **Integration-тесты:** API endpoints с тестовой PostgreSQL (testcontainers)
- **E2E тест бота:** отправить `/start` с тестовым токеном, проверить ответ
- **Ручная проверка:** создать поездку через API → подключиться в Telegram → задать вопросы → проверить уведомления

---

## Decisions

| Решение | Обоснование |
|---|---|
| **grammY** вместо node-telegram-bot-api | Лучше типизация, активное сообщество, поддержка webhooks и group chats |
| **Drizzle ORM** вместо Prisma | Легче, ближе к SQL, лучше производительность |
| **Next.js API Routes** вместо Fastify/Express | Единый проект для API + admin UI + webhook endpoints |
| **Permanent deep-link** | Токен не сгорает, `chat_id` привязывается раз и навсегда |
| **Whisper ASR** для голосовых | Клиенты могут отправлять голосовые сообщения — распознаётся автоматически |
| **Telegram Group** для групп | Бот добавляется в групповой чат, отвечает на @упоминания |
| **WhatsApp с MVP** | Общий message handler, один AI-сервис для обоих каналов |
| **GitHub Actions CI/CD** | Push в main → автодеплой на VPS |
| **Sentry** | Мониторинг ошибок Next.js + бота в продакшене |
| **Монолит** на MVP | Next.js приложение = API + Bot + Scheduler + Admin UI — проще деплоить |

---

## Roadmap

| Этап | Что делаем |
|---|---|
| **1 — MVP** | Telegram бот (webhook) + WhatsApp, admin UI в Next.js, база поездок, голос (Whisper), авто-уведомления |
| **2 — Пилот** | Тест с 1–2 турагентствами (бесплатно), сбор реальных вопросов, улучшение ответов |
| **3 — Продукт** | Мультитенантность, подписка для агентств, расширенный admin UI |
| **4 — Масштаб** | Интеграция с CRM, GDS, OTA; upsell экскурсий/авто во время поездки |
