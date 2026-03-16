# VPS Server Documentation

## Основная информация

| Параметр | Значение |
|---|---|
| IP адрес | `5.45.127.212` |
| Домен | `trip.llmsolution.eu` |
| ОС | Ubuntu (последняя стабильная) |
| Пользователь | `root` |
| Путь к проекту | `/opt/trip-assistant` |

---

## SSH подключение

### Быстрое подключение

```bash
ssh root@5.45.127.212
```

или через домен:

```bash
ssh root@trip.llmsolution.eu
```

### Настройка алиаса (рекомендуется)

Добавь в `~/.ssh/config` (Windows: `C:\Users\User\.ssh\config`):

```
Host trip
    HostName 5.45.127.212
    User root
    IdentityFile ~/.ssh/id_rsa
```

После этого можно подключаться просто:

```bash
ssh trip
```

### Запуск команды без входа в сессию

```bash
ssh root@5.45.127.212 "команда"

# Примеры:
ssh root@5.45.127.212 "docker ps"
ssh root@5.45.127.212 "docker logs trip-app --tail 50"
ssh root@5.45.127.212 "cd /opt/trip-assistant && git pull"
```

---

## Структура сервера

```
/opt/trip-assistant/       # Корень проекта (git clone)
├── app/                   # Next.js приложение
├── deploy/                # nginx конфиг
│   └── nginx-trip-assistant.conf
├── docker-compose.yml     # Production compose
├── docker-compose.dev.yml # Dev compose
├── Dockerfile
└── .env                   # Секреты (НЕ в git!)
```

---

## Docker контейнеры

### Просмотр статуса

```bash
ssh root@5.45.127.212 "docker ps -a"
```

| Контейнер | Образ | Описание |
|---|---|---|
| `trip-app` | `trip-assistant-app` | Next.js приложение (порт 3000) |
| `trip-postgres` | `postgres:16-alpine` | База данных PostgreSQL |

### Полезные команды

```bash
# Логи приложения
ssh root@5.45.127.212 "docker logs trip-app --tail 100 -f"

# Перезапустить приложение
ssh root@5.45.127.212 "cd /opt/trip-assistant && docker compose up -d app"

# Перезапустить всё
ssh root@5.45.127.212 "cd /opt/trip-assistant && docker compose up -d"

# Зайти в контейнер
ssh root@5.45.127.212 "docker exec -it trip-app sh"

# Зайти в базу данных
ssh root@5.45.127.212 "docker exec -it trip-postgres psql -U tripuser -d tripdb"

# Проверить здоровье
ssh root@5.45.127.212 "curl -s http://localhost:3000/api/health"
```

---

## Деплой (правильный workflow)

### 1. Локально: закоммить и запушить

```bash
git add .
git commit -m "feat: описание изменений"
git push
```

### 2. На сервере: pull + rebuild

```bash
ssh root@5.45.127.212 "cd /opt/trip-assistant && git pull"
```

Если нужен rebuild (изменился код):

```bash
# Запустить билд в фоне (занимает ~5 минут)
ssh root@5.45.127.212 "cat > /tmp/rebuild.sh << 'EOF'
#!/bin/bash
cd /opt/trip-assistant
docker compose build app > /tmp/build.log 2>&1
echo DONE_EXIT_CODE=\$? >> /tmp/build.log
EOF
chmod +x /tmp/rebuild.sh
nohup /tmp/rebuild.sh </dev/null >/dev/null 2>&1 &
echo BUILD_STARTED"

# Проверить прогресс
ssh root@5.45.127.212 "tail -20 /tmp/build.log"

# После завершения — перезапустить контейнер
ssh root@5.45.127.212 "cd /opt/trip-assistant && docker compose up -d app"
```

> ⚠️ **Важно:** никогда не запускай несколько `docker compose build` параллельно — сервер имеет 4GB RAM, параллельные билды убивают друг друга через OOM.

---

## Nginx

Конфиг: `/etc/nginx/sites-enabled/trip-assistant` (или `/etc/nginx/conf.d/`)

Исходный файл в репозитории: `deploy/nginx-trip-assistant.conf`

```bash
# Проверить конфиг nginx
ssh root@5.45.127.212 "nginx -t"

# Перезагрузить nginx
ssh root@5.45.127.212 "systemctl reload nginx"

# Логи nginx
ssh root@5.45.127.212 "tail -50 /var/log/nginx/access.log"
ssh root@5.45.127.212 "tail -50 /var/log/nginx/error.log"
```

### Схема трафика

```
Internet → nginx (80/443) → Docker trip-app (localhost:3000)
```

SSL: Let's Encrypt (certbot), автопродление через systemd timer.

---

## Переменные окружения

Файл `/opt/trip-assistant/.env` содержит все секреты. Он **не в git**.

```bash
# Просмотреть текущие переменные
ssh root@5.45.127.212 "cat /opt/trip-assistant/.env"

# Редактировать
ssh root@5.45.127.212 "nano /opt/trip-assistant/.env"
# После изменения .env — перезапустить контейнер:
ssh root@5.45.127.212 "cd /opt/trip-assistant && docker compose up -d app"
```

Ключевые переменные:

| Переменная | Описание |
|---|---|
| `DATABASE_URL` | Строка подключения к PostgreSQL |
| `NEXTAUTH_SECRET` | Секрет NextAuth |
| `NEXTAUTH_URL` | `https://trip.llmsolution.eu` |
| `TELEGRAM_BOT_TOKEN` | Токен Telegram бота |
| `TELEGRAM_WEBHOOK_SECRET` | Секрет для верификации webhook |
| `GEMINI_API_KEY` | Google Gemini API ключ |

---

## Telegram Webhook

Бот: `@TripAssistant123Bot`

Webhook URL: `https://trip.llmsolution.eu/api/webhook/telegram`

```bash
# Проверить текущий webhook
curl "https://api.telegram.org/bot<TOKEN>/getWebhookInfo"

# Установить webhook
curl "https://api.telegram.org/bot<TOKEN>/setWebhook" \
  -d "url=https://trip.llmsolution.eu/api/webhook/telegram" \
  -d "secret_token=<WEBHOOK_SECRET>"
```

---

## Мониторинг и отладка

```bash
# Ресурсы сервера
ssh root@5.45.127.212 "free -h; echo ---; df -h /"

# Нагрузка CPU
ssh root@5.45.127.212 "top -bn1 | head -20"

# Логи ошибок приложения
ssh root@5.45.127.212 "docker logs trip-app 2>&1 | grep -i error | tail -20"

# Проверить endpoint
curl -s https://trip.llmsolution.eu/api/health

# Миграции базы данных (если нужны)
ssh root@5.45.127.212 "docker exec trip-app npx drizzle-kit migrate"
```

---

## GitHub репозиторий

URL: `https://github.com/Dkartik123/trip-assistant.git`

Сервер подключён к репо через HTTPS. При `git pull` иногда нужно указать credentials если токен протух.
