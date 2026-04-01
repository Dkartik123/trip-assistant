# Trip Assistant — AI Travel Bot

Travel Assistant for travel agencies. Telegram + WhatsApp bot powered by Claude AI.

## Tech Stack

- **Next.js 15** (App Router) + TypeScript
- **PostgreSQL** + Drizzle ORM
- **grammY** (Telegram Bot, webhook)
- **Claude AI** (Anthropic) — trip Q&A
- **Whisper** (OpenAI) — voice messages
- **NextAuth** — manager authentication
- **Docker** + Docker Compose
- **Nginx** + Let's Encrypt (production)

## Getting Started

### Prerequisites

- Docker & Docker Compose
- Node.js 20+ (for local dev)

### Development (Docker)

```bash
# Copy env file
cp .env.example .env

# Start all services (app + postgres)
docker compose up -d

# Run migrations
docker compose exec app npm run db:migrate

# View logs
docker compose logs -f app
```

### Development (Local)

```bash
# Install dependencies
cd app && npm install

# Start PostgreSQL only
docker compose up -d postgres

# Run migrations
npm run db:migrate

# Start dev server
npm run dev
```

### Environment Variables

Copy `.env.example` and fill in values. See [.env.example](.env.example) for all variables.

## Project Structure

```
app/
  src/
    app/              — Next.js App Router (pages + API routes)
    lib/
      bot/            — Telegram bot (grammY handlers)
      services/       — Business logic (trip, ai, notification)
      db/             — Drizzle schema, migrations, repositories
      scheduler/      — Cron jobs for notifications
      whatsapp/       — WhatsApp message handler
      config/         — Environment validation (Zod)
      logger/         — Pino structured logging
```

## Scripts

| Script | Description |
|--------|-------------|
| `npm run dev` | Start Next.js dev server |
| `npm run build` | Production build |
| `npm run start` | Start production server |
| `npm run db:generate` | Generate Drizzle migrations |
| `npm run db:migrate` | Apply migrations |
| `npm run db:studio` | Open Drizzle Studio |
| `npm run test` | Run Vitest tests |
| `npm run lint` | ESLint check |
| `npm run format` | Prettier format |

## Trip exports

- `/docs` in Telegram now sends the trip as a PDF file and includes a Google Calendar link.
- In the admin trip page you can download the PDF and open a prefilled Google Calendar event.
- Apple Wallet ticket export is available per flight when the Apple Wallet certificate variables from `.env.example` are configured.
