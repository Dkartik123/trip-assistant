import {
  pgTable,
  text,
  timestamp,
  uuid,
  varchar,
  pgEnum,
  index,
  jsonb,
  boolean,
} from "drizzle-orm/pg-core";
import type {
  FlightItem,
  HotelItem,
  GuideItem,
  TransferItem,
  InsuranceItem,
  AttractionItem,
} from "@/lib/types/trip-sections";
import { relations } from "drizzle-orm";

// ─── Enums ───────────────────────────────────────────────

export const tripStatusEnum = pgEnum("trip_status", [
  "draft",
  "active",
  "completed",
]);

export const notificationTypeEnum = pgEnum("notification_type", [
  "24h_before",
  "3h_before",
  "arrival",
  "trip_changed",
  "custom",
]);

export const notificationStatusEnum = pgEnum("notification_status", [
  "pending",
  "sent",
  "failed",
]);

export const messageChannelEnum = pgEnum("message_channel", [
  "telegram",
  "whatsapp",
]);

export const messageRoleEnum = pgEnum("message_role", [
  "user",
  "assistant",
  "operator",
]);

export const messageContentTypeEnum = pgEnum("message_content_type", [
  "text",
  "voice",
]);

export const preferredMessengerEnum = pgEnum("preferred_messenger", [
  "whatsapp",
  "telegram",
  "sms",
  "email",
]);

export const clientStatusEnum = pgEnum("client_status", [
  "active",
  "archived",
  "blocked",
]);

// ─── Agencies ────────────────────────────────────────────

export const agencies = pgTable("agencies", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: varchar("name", { length: 255 }).notNull(),
  apiKey: varchar("api_key", { length: 255 }).notNull().unique(),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

// ─── Managers ────────────────────────────────────────────

export const managers = pgTable("managers", {
  id: uuid("id").primaryKey().defaultRandom(),
  agencyId: uuid("agency_id")
    .notNull()
    .references(() => agencies.id, { onDelete: "cascade" }),
  name: varchar("name", { length: 255 }).notNull(),
  email: varchar("email", { length: 255 }).notNull().unique(),
  phone: varchar("phone", { length: 50 }),
  passwordHash: varchar("password_hash", { length: 255 }).notNull(),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

// ─── Clients ─────────────────────────────────────────────

export const clients = pgTable("clients", {
  id: uuid("id").primaryKey().defaultRandom(),
  agencyId: uuid("agency_id")
    .notNull()
    .references(() => agencies.id, { onDelete: "cascade" }),

  // Идентификация
  name: varchar("name", { length: 255 }).notNull(),
  firstName: varchar("first_name", { length: 128 }),
  lastName: varchar("last_name", { length: 128 }),
  dateOfBirth: timestamp("date_of_birth", { withTimezone: true }),

  // Контакты
  phone: varchar("phone", { length: 50 }),
  email: varchar("email", { length: 255 }),
  country: varchar("country", { length: 100 }),

  // Язык и локаль
  language: varchar("language", { length: 10 }).default("en"),
  locale: varchar("locale", { length: 20 }),

  // Мессенджеры
  telegramChatId: varchar("telegram_chat_id", { length: 50 }),
  telegramGroupId: varchar("telegram_group_id", { length: 50 }),
  telegramUsername: varchar("telegram_username", { length: 100 }),
  whatsappPhone: varchar("whatsapp_phone", { length: 50 }),
  preferredMessenger: preferredMessengerEnum("preferred_messenger"),

  // Верификация
  isVerified: boolean("is_verified").default(false),

  // Бизнес-поля
  clientStatus: clientStatusEnum("client_status").default("active"),
  source: varchar("source", { length: 100 }),
  managerId: uuid("manager_id").references(() => managers.id, {
    onDelete: "set null",
  }),
  notes: text("notes"),

  // Настройки AI / уведомлений
  timezone: varchar("timezone", { length: 100 }).default("UTC"),
  preferredContactTime: varchar("preferred_contact_time", { length: 100 }),
  voiceEnabled: boolean("voice_enabled").default(true),
  notificationEnabled: boolean("notification_enabled").default(true),

  // Экстренный контакт
  emergencyContactName: varchar("emergency_contact_name", { length: 255 }),
  emergencyContactPhone: varchar("emergency_contact_phone", { length: 50 }),

  // Согласия
  consentMarketing: boolean("consent_marketing").default(false),
  consentMessaging: boolean("consent_messaging").default(false),
  consentPrivacy: boolean("consent_privacy").default(false),

  // Временные метки
  lastSeenAt: timestamp("last_seen_at", { withTimezone: true }),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow(),
});

// ─── Trips ───────────────────────────────────────────────

export const trips = pgTable(
  "trips",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    clientId: uuid("client_id")
      .notNull()
      .references(() => clients.id, { onDelete: "cascade" }),
    managerId: uuid("manager_id")
      .notNull()
      .references(() => managers.id),
    status: tripStatusEnum("status").notNull().default("draft"),

    // Flight
    flightDate: timestamp("flight_date", { withTimezone: true }),
    flightNumber: varchar("flight_number", { length: 20 }),
    departureCity: varchar("departure_city", { length: 100 }),
    departureAirport: varchar("departure_airport", { length: 10 }),
    arrivalCity: varchar("arrival_city", { length: 100 }),
    arrivalAirport: varchar("arrival_airport", { length: 10 }),
    arrivalDate: timestamp("arrival_date", { withTimezone: true }),
    gate: varchar("gate", { length: 10 }),

    // Hotel
    hotelName: varchar("hotel_name", { length: 255 }),
    hotelAddress: text("hotel_address"),
    hotelPhone: varchar("hotel_phone", { length: 50 }),
    checkinTime: varchar("checkin_time", { length: 10 }),
    checkoutTime: varchar("checkout_time", { length: 10 }),

    // Guide
    guideName: varchar("guide_name", { length: 255 }),
    guidePhone: varchar("guide_phone", { length: 50 }),

    // Transfer
    transferInfo: text("transfer_info"),
    transferDriverPhone: varchar("transfer_driver_phone", { length: 50 }),
    transferMeetingPoint: text("transfer_meeting_point"),

    // Insurance
    insuranceInfo: text("insurance_info"),
    insurancePhone: varchar("insurance_phone", { length: 50 }),

    // Manager contact (for AI fallback)
    managerPhone: varchar("manager_phone", { length: 50 }),

    // Deep-link token
    inviteToken: varchar("invite_token", { length: 64 }).unique(),

    // Multi-card JSONB arrays
    flights: jsonb("flights").$type<FlightItem[]>().default([]),
    hotels: jsonb("hotels").$type<HotelItem[]>().default([]),
    guides: jsonb("guides").$type<GuideItem[]>().default([]),
    transfers: jsonb("transfers").$type<TransferItem[]>().default([]),
    insurances: jsonb("insurances").$type<InsuranceItem[]>().default([]),
    attractions: jsonb("attractions").$type<AttractionItem[]>().default([]),

    notes: text("notes"),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => [
    index("trips_client_id_idx").on(table.clientId),
    index("trips_flight_date_idx").on(table.flightDate),
    index("trips_invite_token_idx").on(table.inviteToken),
  ],
);

// ─── Trip ↔ Clients (many-to-many) ──────────────────────

export const tripClients = pgTable(
  "trip_clients",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    tripId: uuid("trip_id")
      .notNull()
      .references(() => trips.id, { onDelete: "cascade" }),
    clientId: uuid("client_id")
      .notNull()
      .references(() => clients.id, { onDelete: "cascade" }),
    role: varchar("role", { length: 50 }).default("traveler"), // traveler, payer, organizer
    notes: text("notes"),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => [
    index("trip_clients_trip_id_idx").on(table.tripId),
    index("trip_clients_client_id_idx").on(table.clientId),
  ],
);

// ─── Trip Subscribers (Telegram users following the trip) ─

export const tripSubscribers = pgTable(
  "trip_subscribers",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    tripId: uuid("trip_id")
      .notNull()
      .references(() => trips.id, { onDelete: "cascade" }),
    telegramChatId: varchar("telegram_chat_id", { length: 50 }).notNull(),
    name: varchar("name", { length: 255 }),
    language: varchar("language", { length: 10 }).default("en"),
    joinedAt: timestamp("joined_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => [
    index("trip_subscribers_trip_id_idx").on(table.tripId),
    index("trip_subscribers_chat_id_idx").on(table.telegramChatId),
  ],
);

// ─── Notifications ───────────────────────────────────────

export const notifications = pgTable(
  "notifications",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    tripId: uuid("trip_id")
      .notNull()
      .references(() => trips.id, { onDelete: "cascade" }),
    type: notificationTypeEnum("type").notNull(),
    scheduledAt: timestamp("scheduled_at", { withTimezone: true }).notNull(),
    sentAt: timestamp("sent_at", { withTimezone: true }),
    status: notificationStatusEnum("status").notNull().default("pending"),
    content: text("content"),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => [index("notifications_scheduled_at_idx").on(table.scheduledAt)],
);

// ─── Messages ────────────────────────────────────────────

export const messages = pgTable(
  "messages",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    tripId: uuid("trip_id")
      .notNull()
      .references(() => trips.id, { onDelete: "cascade" }),
    chatId: varchar("chat_id", { length: 50 }).notNull(),
    channel: messageChannelEnum("channel").notNull(),
    role: messageRoleEnum("role").notNull(),
    content: text("content").notNull(),
    contentType: messageContentTypeEnum("content_type")
      .notNull()
      .default("text"),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => [
    index("messages_trip_id_idx").on(table.tripId),
    index("messages_created_at_idx").on(table.createdAt),
  ],
);

// ─── Relations ───────────────────────────────────────────

export const agenciesRelations = relations(agencies, ({ many }) => ({
  managers: many(managers),
  clients: many(clients),
}));

export const managersRelations = relations(managers, ({ one, many }) => ({
  agency: one(agencies, {
    fields: [managers.agencyId],
    references: [agencies.id],
  }),
  trips: many(trips),
}));

export const clientsRelations = relations(clients, ({ one, many }) => ({
  agency: one(agencies, {
    fields: [clients.agencyId],
    references: [agencies.id],
  }),
  trips: many(trips),
  tripClients: many(tripClients),
}));

export const tripsRelations = relations(trips, ({ one, many }) => ({
  client: one(clients, {
    fields: [trips.clientId],
    references: [clients.id],
  }),
  manager: one(managers, {
    fields: [trips.managerId],
    references: [managers.id],
  }),
  tripClients: many(tripClients),
  subscribers: many(tripSubscribers),
  notifications: many(notifications),
  messages: many(messages),
}));

export const tripClientsRelations = relations(tripClients, ({ one }) => ({
  trip: one(trips, {
    fields: [tripClients.tripId],
    references: [trips.id],
  }),
  client: one(clients, {
    fields: [tripClients.clientId],
    references: [clients.id],
  }),
}));

export const tripSubscribersRelations = relations(
  tripSubscribers,
  ({ one }) => ({
    trip: one(trips, {
      fields: [tripSubscribers.tripId],
      references: [trips.id],
    }),
  }),
);

export const notificationsRelations = relations(notifications, ({ one }) => ({
  trip: one(trips, {
    fields: [notifications.tripId],
    references: [trips.id],
  }),
}));

export const messagesRelations = relations(messages, ({ one }) => ({
  trip: one(trips, {
    fields: [messages.tripId],
    references: [trips.id],
  }),
}));
