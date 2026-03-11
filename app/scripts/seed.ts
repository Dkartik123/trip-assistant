import "dotenv/config";
import postgres from "postgres";
import { drizzle } from "drizzle-orm/postgres-js";
import * as schema from "../src/lib/db/schema";
import { randomBytes, createHash } from "crypto";

async function seed() {
  const sql = postgres(process.env.DATABASE_URL!);
  const db = drizzle(sql, { schema });

  console.log("🌱 Seeding database...");

  // --- Agency ---
  const [agency] = await db
    .insert(schema.agencies)
    .values({
      name: "TravelPro Estonia",
      apiKey: randomBytes(32).toString("hex"),
    })
    .returning();
  console.log(`✅ Agency: ${agency.name} (${agency.id})`);

  // --- Manager ---
  const passwordHash = createHash("sha256").update("password123").digest("hex");
  const [manager] = await db
    .insert(schema.managers)
    .values({
      agencyId: agency.id,
      name: "Денис Менеджер",
      email: "manager@travelpro.ee",
      passwordHash,
    })
    .returning();
  console.log(`✅ Manager: ${manager.name} (${manager.email})`);

  // --- Clients ---
  const [client1] = await db
    .insert(schema.clients)
    .values({
      agencyId: agency.id,
      name: "Иван Петров",
      phone: "+7 999 123 45 67",
      email: "ivan@example.com",
      language: "ru",
      timezone: "Europe/Moscow",
    })
    .returning();

  const [client2] = await db
    .insert(schema.clients)
    .values({
      agencyId: agency.id,
      name: "Anna Sидорова",
      phone: "+372 555 98 76",
      email: "anna@example.com",
      language: "et",
      timezone: "Europe/Tallinn",
    })
    .returning();

  const [client3] = await db
    .insert(schema.clients)
    .values({
      agencyId: agency.id,
      name: "Михаил Козлов",
      phone: "+7 916 333 22 11",
      email: "mikhail@example.com",
      language: "ru",
      timezone: "Europe/Moscow",
    })
    .returning();

  console.log(
    `✅ Clients: ${client1.name}, ${client2.name}, ${client3.name}`,
  );

  // --- Trips ---
  const now = new Date();
  const in3Days = new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000);
  const in7Days = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
  const daysAgo5 = new Date(now.getTime() - 5 * 24 * 60 * 60 * 1000);

  const [trip1] = await db
    .insert(schema.trips)
    .values({
      clientId: client1.id,
      managerId: manager.id,
      status: "active",
      flightDate: in3Days,
      flightNumber: "SU2134",
      departureCity: "Москва",
      departureAirport: "SVO",
      arrivalCity: "Анталья",
      arrivalAirport: "AYT",
      gate: "A23",
      hotelName: "Rixos Premium Belek",
      hotelAddress: "İleribası Mevkii, Belek, Antalya, Turkey",
      hotelPhone: "+90 242 310 41 00",
      checkinTime: "14:00",
      checkoutTime: "12:00",
      guideName: "Мехмет Йылмаз",
      guidePhone: "+90 532 123 45 67",
      transferInfo: "Индивидуальный трансфер аэропорт → отель",
      transferDriverPhone: "+90 532 987 65 43",
      transferMeetingPoint: "Выход B, табличка с именем",
      insuranceInfo: "Полис #TRV-2026-12345, покрытие до $50,000",
      insurancePhone: "+7 800 123 45 67",
      managerPhone: "+372 555 1234",
      inviteToken: randomBytes(32).toString("hex"),
      notes: "VIP клиент, предпочитает номер с видом на море",
    })
    .returning();

  const [trip2] = await db
    .insert(schema.trips)
    .values({
      clientId: client2.id,
      managerId: manager.id,
      status: "draft",
      flightDate: in7Days,
      flightNumber: "BT311",
      departureCity: "Таллинн",
      departureAirport: "TLL",
      arrivalCity: "Барселона",
      arrivalAirport: "BCN",
      hotelName: "Hotel Arts Barcelona",
      hotelAddress: "Marina 19-21, 08005 Barcelona, Spain",
      hotelPhone: "+34 932 211 000",
      checkinTime: "15:00",
      checkoutTime: "11:00",
      managerPhone: "+372 555 1234",
      inviteToken: randomBytes(32).toString("hex"),
    })
    .returning();

  const [trip3] = await db
    .insert(schema.trips)
    .values({
      clientId: client3.id,
      managerId: manager.id,
      status: "completed",
      flightDate: daysAgo5,
      flightNumber: "FZ968",
      departureCity: "Санкт-Петербург",
      departureAirport: "LED",
      arrivalCity: "Дубай",
      arrivalAirport: "DXB",
      hotelName: "Atlantis The Palm",
      hotelAddress: "Crescent Rd, The Palm Jumeirah, Dubai, UAE",
      hotelPhone: "+971 4 426 2000",
      checkinTime: "15:00",
      checkoutTime: "12:00",
      guideName: "Ahmed Al-Rashid",
      guidePhone: "+971 50 123 4567",
      transferInfo: "Групповой трансфер (автобус отеля)",
      managerPhone: "+372 555 1234",
      inviteToken: randomBytes(32).toString("hex"),
    })
    .returning();

  console.log(
    `✅ Trips: ${trip1.arrivalCity} (active), ${trip2.arrivalCity} (draft), ${trip3.arrivalCity} (completed)`,
  );

  // --- Notifications for active trip ---
  const flightTime = in3Days.getTime();
  await db.insert(schema.notifications).values([
    {
      tripId: trip1.id,
      type: "24h_before",
      scheduledAt: new Date(flightTime - 24 * 60 * 60 * 1000),
      status: "pending",
    },
    {
      tripId: trip1.id,
      type: "3h_before",
      scheduledAt: new Date(flightTime - 3 * 60 * 60 * 1000),
      status: "pending",
    },
    {
      tripId: trip1.id,
      type: "arrival",
      scheduledAt: new Date(flightTime + 4 * 60 * 60 * 1000),
      status: "pending",
    },
  ]);
  console.log(`✅ 3 notifications scheduled for trip to ${trip1.arrivalCity}`);

  // --- Sample messages for completed trip ---
  await db.insert(schema.messages).values([
    {
      tripId: trip3.id,
      chatId: "300300300",
      channel: "telegram",
      role: "user",
      contentType: "text",
      content: "Привет! Какая погода сейчас в Дубае?",
    },
    {
      tripId: trip3.id,
      chatId: "300300300",
      channel: "telegram",
      role: "assistant",
      contentType: "text",
      content:
        "Здравствуйте, Михаил! В Дубае сейчас тёплая погода, около +28°C днём. Рекомендую взять лёгкую одежду и солнцезащитный крем. Ваш отель Atlantis The Palm находится на знаменитом острове Palm Jumeirah — там будет ещё комфортнее благодаря морскому бризу.",
    },
    {
      tripId: trip3.id,
      chatId: "300300300",
      channel: "telegram",
      role: "user",
      contentType: "text",
      content: "А где меня встретят в аэропорту?",
    },
    {
      tripId: trip3.id,
      chatId: "300300300",
      channel: "telegram",
      role: "assistant",
      contentType: "text",
      content:
        "Для вас организован групповой трансфер — автобус от отеля Atlantis The Palm. После получения багажа ищите представителя с табличкой «Atlantis» в зоне прибытия. Если возникнут вопросы на месте, позвоните гиду: Ahmed Al-Rashid, тел. +971 50 123 4567.",
    },
  ]);
  console.log(`✅ 4 sample messages for trip to ${trip3.arrivalCity}`);

  await sql.end();
  console.log("\n🎉 Seed complete!");
}

seed().catch((err) => {
  console.error("❌ Seed failed:", err);
  process.exit(1);
});
