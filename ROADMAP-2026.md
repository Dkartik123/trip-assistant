# 🗺️ Trip Assistant — Roadmap 2026

> Стратегический план развития продукта на 2026 год.
> Включает: продукт, маркетинг, MCP-интеграции, соцсети, B2B продажи.

---

## Текущее состояние (март 2026)

**Что готово (MVP ~85%):**
- Telegram бот (webhook, AI-ответы, голосовые, группы, inline-кнопки)
- Admin UI (Next.js, shadcn/ui) — поездки, клиенты, сообщения, настройки
- AI (Gemini 2.0 Flash + Flash-Lite fallback)
- Whisper (голосовые сообщения)
- Система уведомлений (node-cron, авто-создание, шаблоны)
- Двусторонний чат оператор ↔ клиент
- Auth (NextAuth v5, JWT, Credentials)
- Docker, CI/CD (GitHub Actions)

**Что не готово:**
- Деплой на VPS (Nginx, SSL, домен)
- WhatsApp интеграция (только webhook endpoint)
- Sentry, Uptime Kuma
- Тесты (покрытие ~30%)
- Prompt engineering на реальных данных

---

## Q1 2026 (январь — март): Запуск и первый клиент

### Продукт

- [ ] **Финализация MVP**
  - [ ] Деплой на Hetzner VPS (Nginx + SSL + домен)
  - [ ] Настроить Sentry SDK
  - [ ] Настроить Uptime Kuma
  - [ ] Установить Telegram webhook URL
  - [ ] Timezone-поддержка в уведомлениях
  - [ ] Prompt engineering: тестирование на RU, EN, ET
  - [ ] Добавить общие знания в промпт (багаж, болезнь, задержки)

- [ ] **Тестирование**
  - [ ] Integration tests (API routes + testcontainers)
  - [ ] E2E: полный flow (создание поездки → Telegram → вопрос → ответ)
  - [ ] Notification service unit tests
  - [ ] Нагрузочное тестирование бота (50 concurrent users)

- [ ] **Инфраструктура**
  - [ ] Автоматический DB backup (pg_dump → S3/Hetzner Storage)
  - [ ] Alerting: Sentry → Telegram канал для разработчика
  - [ ] Health dashboard (uptime, response time, error rate)

### Маркетинг (подготовка)

- [ ] Купить домен `tripassistant.io` (или `.ee` / `.travel`)
- [ ] Создать Landing Page (Next.js, статический)
  - Hero: "AI-ассистент для ваших туристов"
  - Демо-видео (screen recording бота)
  - 3 ключевых преимущества
  - Форма "Запросить демо"
  - Pricing (Coming Soon)
- [ ] Подготовить pitch deck (10 слайдов) для B2B встреч
- [ ] Записать демо-видео (2 мин, поездка от создания до ответа бота)

### Соцсети (запуск каналов)

- [ ] Создать бизнес-аккаунты:
  - LinkedIn Company Page
  - Instagram `@tripassistant`
  - Telegram канал `@tripassistant_updates`
  - YouTube канал (для демо и туториалов)
- [ ] Контент-план на Q2 (2 поста/неделю)
- [ ] Подготовить 10 постов-заготовок:
  - Проблема: "Туристы не читают email"
  - Решение: "AI-ассистент в мессенджере"
  - Кейс: работа бота (скриншоты)
  - Behind the scenes: tech stack
  - Инсайты из туриндустрии

---

## Q2 2026 (апрель — июнь): Пилот + MCP + B2B

### Продукт

- [ ] **WhatsApp Integration (полная)**
  - [ ] Twilio / 360dialog аккаунт + бизнес-номер
  - [ ] Message handler (текст → AI, голос → Whisper → AI)
  - [ ] Привязка клиента через whatsapp_phone
  - [ ] Отправка уведомлений через WhatsApp API
  - [ ] E2E тест WhatsApp flow

- [ ] **MCP (Model Context Protocol) — Phase 1**
  - [ ] MCP Server для Trip Assistant
    - Tool: `get_trip_details` — получить полные данные поездки
    - Tool: `search_trips` — поиск поездок по клиенту/дате/статусу
    - Tool: `get_client_history` — история сообщений клиента
    - Tool: `create_trip` — создание поездки из внешнего AI-агента
    - Tool: `update_trip` — обновление данных поездки
    - Tool: `send_notification` — отправка уведомления клиенту
    - Resource: `trip://{id}` — данные поездки как MCP resource
    - Resource: `client://{id}` — данные клиента как MCP resource
  - [ ] MCP Auth (API key per agency)
  - [ ] Документация MCP endpoints

- [ ] **MCP Client — интеграции с внешними сервисами**
  - [ ] MCP Client для FlightAware (статус рейса в реальном времени)
  - [ ] MCP Client для OpenWeather (погода в городе назначения)
  - [ ] MCP Client для Google Maps (маршруты, POI рядом с отелем)

- [ ] **AI улучшения**
  - [ ] RAG: FAQ-база (частые вопросы → быстрые ответы без AI)
  - [ ] Multi-model routing (простые вопросы → Flash-Lite, сложные → Flash)
  - [ ] AI quality metrics (% правильных ответов, fallback rate)
  - [ ] Feedback loop: кнопки 👍/👎 после ответа бота

- [ ] **Admin UI v2**
  - [ ] Dashboard: аналитика (кол-во вопросов, popular topics, response time)
  - [ ] Bulk import поездок (CSV / Excel)
  - [ ] Шаблоны поездок (повторяющиеся туры)
  - [ ] Activity log (кто что менял)

### Пилот

- [ ] Найти 2–3 турагентства в Эстонии для бесплатного пилота
  - Целевые: малые/средние агентства, 50–500 клиентов/год
  - Каналы поиска: LinkedIn, личные контакты, турвыставки
- [ ] Онбординг пилотных агентств (создать поездки, обучить менеджеров)
- [ ] Собирать реальные вопросы туристов (логирование + аналитика)
- [ ] Еженедельный feedback call с менеджерами пилотных агентств
- [ ] Улучшать промпт на основе реальных данных
- [ ] Документировать метрики:
  - Время ответа AI
  - % AI fallback на менеджера
  - Количество вопросов на поездку
  - Удовлетворённость туристов (NPS)

### Маркетинг

- [ ] **Content Marketing**
  - [ ] Блог на сайте (SEO):
    - "Как AI меняет работу турагентств"
    - "5 вопросов, которые каждый турист задаёт менеджеру"
    - "Кейс: как бот экономит 10 часов в неделю"
  - [ ] Guest posts на travel-industry блогах
  - [ ] Email newsletter (monthly, для подписчиков landing page)

- [ ] **PR и медиа**
  - [ ] Пресс-релиз о запуске пилота
  - [ ] Статья на vc.ru / Habr / Medium
  - [ ] Подкаст-интервью (travel tech, SaaS)

### Соцсети

- [ ] **LinkedIn** (основной B2B канал)
  - 3 поста/неделю: продукт, кейсы, индустрия
  - Founder's personal brand (посты от имени основателя)
  - LinkedIn Ads: таргетинг на travel agency directors/managers
  - Вступить в LinkedIn-группы турагентств

- [ ] **Instagram**
  - Reels: короткие демо бота (15–30 сек)
  - Stories: behind the scenes, обновления продукта
  - Карусели: "До/После" (с ботом vs без бота)

- [ ] **Telegram канал**
  - Changelog + feature updates
  - Tips для турагентств
  - Мини-опросы аудитории

- [ ] **YouTube**
  - Туториал: "Как создать поездку за 2 минуты"
  - Демо: полный клиентский flow
  - Вебинар: "AI в туриндустрии 2026"

### B2B Продажи (первые шаги)

- [ ] Определить ICP (Ideal Customer Profile):
  - Турагентства 5–50 сотрудников
  - 200–2000 клиентов/год
  - Используют WhatsApp/Telegram для общения с клиентами
  - Эстония, Латвия, Литва, Финляндия (начальный рынок)
- [ ] Создать CRM (HubSpot Free / Notion) для tracking лидов
- [ ] Собрать базу турагентств (50–100 контактов):
  - LinkedIn Sales Navigator
  - Google Maps (поиск по городам)
  - Каталоги турагентств (ETTA, ALTA)
- [ ] Cold outreach:
  - LinkedIn InMail (персонализированные сообщения)
  - Email (3-step sequence: проблема → решение → демо)
  - Целевая конверсия: 5–10% на демо

---

## Q3 2026 (июль — сентябрь): Монетизация + масштабирование

### Продукт

- [ ] **Мультитенантность**
  - [ ] Изоляция данных по агентствам
  - [ ] Self-service регистрация агентства
  - [ ] Роли: owner, admin, manager (RBAC)
  - [ ] Onboarding wizard (пошаговая настройка)

- [ ] **Billing (Stripe)**
  - [ ] Тарифные планы:
    - **Starter** — €49/мес (до 50 поездок, 1 менеджер, Telegram)
    - **Professional** — €99/мес (до 200 поездок, 5 менеджеров, Telegram + WhatsApp)
    - **Business** — €199/мес (unlimited поездки, 20 менеджеров, все каналы, приоритетная поддержка)
    - **Enterprise** — Custom (API, интеграции, SLA)
  - [ ] Stripe Checkout + Customer Portal
  - [ ] Trial: 14 дней бесплатно (полный функционал)
  - [ ] Billing dashboard в Admin UI
  - [ ] Usage tracking (поездки, сообщения, AI tokens)

- [ ] **MCP — Phase 2 (расширенные интеграции)**
  - [ ] MCP Server → публикация в MCP Registry
    - Позволяет любому AI-агенту (Claude Desktop, Cursor, etc.) работать с данными поездок
    - Use case: менеджер использует Claude Desktop → "Создай поездку для Иванова в Рим на 15 августа"
  - [ ] MCP Client для Booking.com API (цены, доступность отелей)
  - [ ] MCP Client для Skyscanner/Kiwi (поиск рейсов)
  - [ ] MCP Client для Viator/GetYourGuide (экскурсии)
  - [ ] MCP Composability:
    - Цепочки: Поиск рейса → Поиск отеля → Создание поездки
    - AI-agent может автоматизировать полный workflow менеджера

- [ ] **Мультиязычность**
  - [ ] Admin UI i18n (RU, EN, ET)
  - [ ] Шаблоны уведомлений на 3 языках
  - [ ] Авто-перевод ответов бота (если язык клиента ≠ язык данных)

- [ ] **API**
  - [ ] Public REST API для агентств
  - [ ] OpenAPI/Swagger документация
  - [ ] API rate limiting (по тарифу)
  - [ ] Webhook callbacks (trip.created, trip.updated, message.received)

- [ ] **Telegram Mini App**
  - [ ] Веб-интерфейс внутри Telegram (Trip Card)
  - [ ] Интерактивная карта (отель, аэропорт, POI)
  - [ ] Timeline поездки (визуальная шкала)
  - [ ] Quick actions (позвонить гиду, открыть навигацию)

### Маркетинг

- [ ] **Performance Marketing**
  - [ ] Google Ads (ключевые слова: "travel agency software", "AI travel bot", "telegram bot for travel agency")
  - [ ] LinkedIn Ads (ретаргетинг посетителей сайта)
  - [ ] Facebook/Instagram Ads (B2B lookalike audiences)
  - [ ] Бюджет: €500–1000/мес
  - [ ] Целевой CAC: < €200

- [ ] **SEO**
  - [ ] 10+ статей в блоге (длинный хвост: "travel agency automation", "AI chatbot for tourism")
  - [ ] Linkbuilding (guest posts, directories)
  - [ ] Оптимизация Landing Page (Core Web Vitals, schema markup)

- [ ] **Партнёрская программа**
  - [ ] Referral program: 20% от первого платежа за привлечённого клиента
  - [ ] Партнёрский портал (tracking ссылок, статистика)
  - [ ] Привлечь первых 5 партнёров (IT-консультанты, travel-блогеры)

- [ ] **Product Hunt Launch**
  - [ ] Подготовка: скриншоты, видео, описание
  - [ ] Собрать поддержку upvotes (сообщество, знакомые)
  - [ ] Целевая позиция: Top 5 дня

### Соцсети (масштабирование)

- [ ] **Video content** (основной фокус):
  - YouTube: еженедельные видео (туториалы, кейсы, обзоры)
  - TikTok / Instagram Reels: короткие B2B видео
  - LinkedIn Video: кейсы клиентов, founder updates
- [ ] **UGC (User Generated Content)**:
  - Видео-отзывы от пилотных агентств
  - Screenshots реальных чатов бота (с разрешения)
- [ ] **Community building**:
  - Telegram-чат для пользователей продукта
  - Monthly AMA (Ask Me Anything) в Telegram
  - Notion/Discord community для travel tech

### B2B Продажи

- [ ] **Расширение географии**:
  - Балтия (Эстония, Латвия, Литва) → Скандинавия (Финляндия, Швеция)
  - Позже: Германия, Польша, Чехия
- [ ] **Sales process**:
  - Discovery call (15 мин) → Demo (30 мин) → Trial → Onboarding
  - Sales deck обновлённый (с кейсами пилота)
  - ROI калькулятор: "Сколько часов экономит ваш менеджер"
- [ ] **Турвыставки и конференции**:
  - Tourest (Tallinn, ежегодная выставка)
  - MATKA (Helsinki)
  - ITB Berlin (крупнейшая B2B travel выставка)
  - Стенд/стол или participation badge + networking
- [ ] **Целевые метрики Q3**:
  - 10 платящих клиентов
  - MRR €1,000+
  - Churn < 10%

---

## Q4 2026 (октябрь — декабрь): Рост + интеграции

### Продукт

- [ ] **CRM интеграции**
  - [ ] Bitrix24 (популярен в СНГ)
  - [ ] HubSpot
  - [ ] Zapier/Make connector (low-code интеграции)

- [ ] **MCP — Phase 3 (AI Workflows)**
  - [ ] MCP Tool: `analyze_trip_feedback` — анализ отзывов по поездке
  - [ ] MCP Tool: `generate_trip_report` — автогенерация отчёта для менеджера
  - [ ] MCP Tool: `suggest_upsell` — AI-рекомендации допродаж
  - [ ] AI Workflow: "Автосоздание поездки из email"
    - Менеджер пересылает email с бронью → AI парсит → создаёт поездку
  - [ ] AI Workflow: "Post-trip feedback collection"
    - Бот автоматически спрашивает отзыв через 24ч после возвращения
  - [ ] MCP Marketplace listing (если появится centralized marketplace)

- [ ] **Advanced AI**
  - [ ] Proactive messages: бот сам пишет ("Завтра дождь, возьмите зонт")
  - [ ] Image understanding: турист отправляет фото → бот распознаёт (меню, вывеска, карта)
  - [ ] Multi-modal: генерация визуальных карточек (маршрут, расписание)
  - [ ] Sentiment analysis: определение настроения клиента (escalation при негативе)

- [ ] **Upsell Engine**
  - [ ] Интеграция с Viator/GetYourGuide API (экскурсии)
  - [ ] Контекстные рекомендации (погода, локация, день поездки)
  - [ ] Mini-CPA модель (комиссия с бронирований через бота)

- [ ] **Mobile**
  - [ ] Telegram Mini App v2 (полнофункциональный)
  - [ ] PWA для менеджеров (admin на мобильном)

- [ ] **Enterprise features**
  - [ ] SSO (SAML / OpenID Connect)
  - [ ] Audit log
  - [ ] Data export (GDPR compliance)
  - [ ] Custom branding (белая метка бота)
  - [ ] SLA dashboard

### Маркетинг (масштабирование)

- [ ] **Case Studies**
  - [ ] 3–5 подробных кейсов с пилотными агентствами
  - [ ] Формат: проблема → решение → результаты (цифры)
  - [ ] Публикация на сайте + LinkedIn + PR

- [ ] **Webinars / Events**
  - [ ] Ежемесячный вебинар: "AI для турагентств"
  - [ ] Со-вебинары с партнёрами (Twilio, Stripe)
  - [ ] Запись и публикация как evergreen content

- [ ] **Автоматизация маркетинга**
  - [ ] Email drip campaigns (sign up → nurture → convert)
  - [ ] Chatbot на сайте (тот же AI, demo-режим)
  - [ ] Retargeting campaigns (Google + LinkedIn)

- [ ] **PR**
  - [ ] Номинация на awards (Travel Tech Awards, Estonian Startup Awards)
  - [ ] Публикации в Phocuswire, Skift, TravelWeekly
  - [ ] Выступление на travel-tech конференциях

### Соцсети (зрелая стратегия)

- [ ] **Content pillars** (4 столпа контента):
  1. **Product** — фичи, обновления, демо (30%)
  2. **Education** — как AI помогает турбизнесу (30%)
  3. **Social proof** — кейсы, отзывы, цифры (25%)
  4. **Culture** — команда, закулисье, values (15%)

- [ ] **Метрики соцсетей (целевые к концу 2026)**:
  - LinkedIn: 2,000+ followers, 5% engagement rate
  - Instagram: 1,000+ followers
  - Telegram: 500+ подписчиков
  - YouTube: 50+ видео, 500+ subscribers
  - Newsletter: 1,000+ подписчиков

### B2B Продажи (масштабирование)

- [ ] **Найм**:
  - [ ] Part-time Sales/BDR (первый найм)
  - [ ] Customer Success Manager (онбординг + retention)

- [ ] **Процессы**:
  - [ ] CRM (переход на полноценный HubSpot / Pipedrive)
  - [ ] Sales playbook (скрипты, objection handling, pricing negotiation)
  - [ ] Onboarding playbook (пошаговый чеклист для нового клиента)
  - [ ] Quarterly Business Review с ключевыми клиентами

- [ ] **Каналы продаж**:
  - [ ] Direct sales (LinkedIn + email outreach)
  - [ ] Inbound (сайт + SEO + Ads)
  - [ ] Partnerships (IT-интеграторы для турбизнеса)
  - [ ] Channel partners (franchise networks турагентств)

- [ ] **Целевые метрики Q4**:
  - 30–50 платящих клиентов
  - MRR €5,000+
  - ARR run rate €60,000+
  - NPS > 40
  - Average contract value: €100–150/мес

---

## Ключевые метрики 2026 (OKR)

### Продукт
| Метрика | Q1 | Q2 | Q3 | Q4 |
|---------|----|----|----|----|
| Агентства (total) | 0 | 2–3 (пилот) | 10 | 30–50 |
| Активные поездки | 0 | 20–50 | 100–200 | 500+ |
| Сообщения бота/мес | 0 | 500 | 2,000 | 10,000 |
| AI accuracy | — | 70% | 85% | 90%+ |
| Uptime | — | 99% | 99.5% | 99.9% |
| Response time (p95) | — | <3s | <2s | <1.5s |

### Финансы
| Метрика | Q1 | Q2 | Q3 | Q4 |
|---------|----|----|----|----|
| MRR | €0 | €0 (бесплатный пилот) | €1,000 | €5,000 |
| CAC | — | — | <€200 | <€150 |
| LTV (projected) | — | — | €600 | €1,200 |
| Burn rate | €50/мес (VPS) | €200/мес | €1,000/мес | €2,000/мес |

### Маркетинг
| Метрика | Q1 | Q2 | Q3 | Q4 |
|---------|----|----|----|----|
| Website visitors/мес | 0 | 200 | 1,000 | 3,000 |
| Demo requests | 0 | 5 | 20 | 50 |
| Blog posts | 0 | 3 | 10 | 20 |
| Newsletter subscribers | 0 | 50 | 200 | 1,000 |

---

## MCP Strategy (детально)

### Зачем MCP для Trip Assistant?

**Model Context Protocol** превращает Trip Assistant из standalone-продукта в **платформу**, к которой могут подключаться AI-агенты.

**Сценарии:**

1. **MCP Server (наш сервис → внешние AI-агенты)**
   - Менеджер через Claude Desktop/Cursor: "Покажи все активные поездки на следующую неделю"
   - AI-ассистент агентства автоматически создаёт поездки из CRM
   - Интеграция со сторонними AI-workflow (n8n, Langchain)

2. **MCP Client (внешние сервисы → наш сервис)**
   - Реал-тайм статус рейса (FlightAware MCP)
   - Погода в дестинации (Weather MCP)
   - Достопримечательности рядом (Google Maps MCP)
   - Цены на отели (Booking MCP)

3. **MCP Composability (цепочки)**
   - Email с бронью → парсинг → создание поездки → уведомление клиента
   - Задержка рейса → авто-обновление поездки → уведомление клиента
   - QBR: AI собирает аналитику по всем поездкам за квартал

### Технический план MCP

```
Phase 1 (Q2): MCP Server — базовые tools (CRUD trips, clients, messages)
Phase 2 (Q3): MCP Registry + внешние MCP clients (flights, weather, maps)
Phase 3 (Q4): AI Workflows, auto-trip-creation, upsell engine, analytics
```

---

## B2B Sales Playbook (детально)

### ICP (Ideal Customer Profile)

| Параметр | Значение |
|----------|---------|
| Тип компании | Турагентство (outbound tourism) |
| Размер | 5–50 сотрудников |
| Клиентов/год | 200–2,000 |
| География | Балтия → Скандинавия → Европа |
| Текущие каналы | WhatsApp/Telegram/Email вручную |
| Pain point | Менеджеры тратят 30–50% времени на одинаковые вопросы |
| Decision maker | Директор / Head of Operations |
| Budget | €50–200/мес бюджет на софт |

### Value Proposition

> **Trip Assistant экономит менеджерам 10+ часов в неделю**, автоматически отвечая на повторяющиеся вопросы туристов через мессенджеры.

**ROI для агентства (200 клиентов/год):**
- Среднее количество вопросов на поездку: 8–12
- Время менеджера на 1 вопрос: 3–5 мин
- AI отвечает на 80% вопросов → экономия ~40 мин/клиент
- 200 клиентов × 40 мин = **133 часов/год** (~€2,000+ при ставке €15/час)
- Стоимость Trip Assistant: €99/мес × 12 = €1,188/год
- **ROI: +70%**

### Sales Funnel

```
Awareness (LinkedIn, Ads, SEO, Events)
    ↓
Interest (Landing Page, Blog, Demo Video)
    ↓
Demo Request (форма на сайте / LinkedIn DM)
    ↓
Discovery Call (15 мин — понять боли)
    ↓
Product Demo (30 мин — показать продукт)
    ↓
Free Trial (14 дней — полный доступ)
    ↓
Onboarding (помочь создать первые поездки)
    ↓
Conversion (выбор тарифного плана)
    ↓
Expansion (больше менеджеров, больше функций)
```

### Pricing Strategy

| План | Цена | Включено | Целевой клиент |
|------|------|----------|----------------|
| **Starter** | €49/мес | 50 поездок, 1 менеджер, Telegram | Малый агент (1–3 чел.) |
| **Pro** | €99/мес | 200 поездок, 5 менеджеров, +WhatsApp | Средний агент (5–15 чел.) |
| **Business** | €199/мес | Unlimited, 20 менеджеров, API, приоритет | Крупный агент (15–50 чел.) |
| **Enterprise** | Custom | White label, SSO, SLA, интеграции | Сети агентств, туроператоры |

Annual billing: скидка 20%.

---

## Риски и митигация

| Риск | Вероятность | Импакт | Митигация |
|------|-------------|--------|-----------|
| Турагентства не хотят платить | Высокая | Критический | Бесплатный пилот → доказать ROI → конвертировать |
| WhatsApp Business API дорогой | Средняя | Средний | Начать с Telegram, WhatsApp как premium фича |
| AI даёт неправильные ответы | Средняя | Высокий | Human-in-the-loop, feedback кнопки, промпт-тюнинг |
| Конкуренты (большие TravelTech) | Низкая | Средний | Фокус на нишу (малые агентства), скорость итерации |
| Медленный рост B2B | Высокая | Средний | Longer runway, низкий burn rate, founder-led sales |
| GDPR compliance | Средняя | Высокий | DPA, data residency в EU, audit log, export |

---

## Milestones 2026

| Дата | Milestone |
|------|-----------|
| **Март 2026** | MVP deployed, landing page live |
| **Апрель 2026** | Первый пилотный клиент |
| **Май 2026** | WhatsApp интеграция + MCP Server v1 |
| **Июнь 2026** | 3 пилотных агентства, Product Hunt launch |
| **Июль 2026** | Монетизация включена (Stripe billing) |
| **Август 2026** | 10 платящих клиентов |
| **Сентябрь 2026** | MCP Registry, Telegram Mini App |
| **Октябрь 2026** | CRM интеграции, первый hire (Sales/CS) |
| **Ноябрь 2026** | 30 клиентов, MRR €3,000 |
| **Декабрь 2026** | 50 клиентов, MRR €5,000, ARR run rate €60K |

---

_Создано: 12 марта 2026_
_Следующий review: 1 апреля 2026_
