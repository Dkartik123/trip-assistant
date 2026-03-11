// ─── Client Types ─────────────────────────────────────────

export interface ClientRow {
  id: string;
  name: string;
  firstName: string | null;
  lastName: string | null;
  phone: string | null;
  email: string | null;
  country: string | null;
  language: string;
  locale: string | null;
  timezone: string;
  telegramChatId: string | null;
  telegramUsername: string | null;
  whatsappPhone: string | null;
  preferredMessenger: string | null;
  clientStatus: string;
  source: string | null;
  notes: string | null;
  preferredContactTime: string | null;
  voiceEnabled: boolean;
  notificationEnabled: boolean;
  emergencyContactName: string | null;
  emergencyContactPhone: string | null;
  consentMarketing: boolean;
  consentMessaging: boolean;
  consentPrivacy: boolean;
  tripsCount: number;
  lastActivity: string | null;
}

export interface ClientOption {
  id: string;
  name: string;
}

export interface MessageData {
  id: string;
  role: "user" | "assistant";
  content: string;
  createdAt: string;
}
