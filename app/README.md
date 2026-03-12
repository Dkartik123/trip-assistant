This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Prerequisites

- **Node.js** ≥ 18
- **Docker** (for PostgreSQL)
- **npm**

## Environment Variables

Copy `.env.example` to `.env` (or edit `.env` directly) and fill in:

| Variable | Description |
|---|---|
| `DATABASE_URL` | PostgreSQL connection string |
| `TELEGRAM_BOT_TOKEN` | Telegram bot token from [@BotFather](https://t.me/BotFather) |
| `TELEGRAM_BOT_USERNAME` | Bot username (without @) |
| `GEMINI_API_KEY` | Google Gemini API key (AI extraction + translation) |
| `OPENAI_API_KEY` | OpenAI API key (Whisper voice recognition) |
| `NEXTAUTH_SECRET` | Random secret for NextAuth sessions |

## Getting Started

### 1. Start the database

```bash
docker compose -f docker-compose.dev.yml up -d
```

### 2. Install dependencies

```bash
cd app
npm install
```

### 3. Run database migrations

```bash
npm run db:migrate
```

### 4. Start the development server

```bash
npm run dev
```

The app will be available at [http://localhost:3000](http://localhost:3000).

### 5. Start the Telegram bot (polling mode)

In a **separate terminal**:

```bash
npm run bot:dev
```

This starts the bot in long-polling mode for local development.

## Available Scripts

| Command | Description |
|---|---|
| `npm run dev` | Start Next.js dev server (port 3000) |
| `npm run bot:dev` | Start Telegram bot in polling mode |
| `npm run build` | Production build |
| `npm run start` | Start production server |
| `npm run db:generate` | Generate Drizzle migration files |
| `npm run db:migrate` | Apply database migrations |
| `npm run db:studio` | Open Drizzle Studio (DB GUI) |
| `npm run test` | Run tests (vitest) |
| `npm run lint` | Run ESLint |

## Project Structure

```
app/
├── src/
│   ├── app/              # Next.js App Router (pages + API routes)
│   │   ├── admin/        # Admin panel (trips, clients, messages)
│   │   ├── api/          # REST API + webhook endpoints
│   │   └── login/        # Authentication page
│   ├── components/       # React components (UI + admin)
│   └── lib/
│       ├── bot/          # Telegram bot (grammY) handlers
│       ├── db/           # Drizzle ORM schema + repositories
│       ├── services/     # Business logic (AI, trips, messages)
│       └── config/       # Environment config
├── drizzle/              # Database migrations
└── scripts/              # Bot polling entry point
```

## Production Deployment

```bash
docker compose up -d --build
```

Uses the main `docker-compose.yml` with both PostgreSQL and the app container. The Telegram bot runs via webhook in production (not polling).
