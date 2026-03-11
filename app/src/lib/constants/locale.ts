// ─── Language Options ─────────────────────────────────────

export const LANGUAGES = [
  { value: "ru", label: "Русский" },
  { value: "en", label: "English" },
  { value: "et", label: "Eesti" },
  { value: "de", label: "Deutsch" },
  { value: "fi", label: "Suomi" },
  { value: "lv", label: "Latviešu" },
  { value: "lt", label: "Lietuvių" },
] as const;

// ─── Timezone Options ─────────────────────────────────────

export const TIMEZONES = [
  { value: "Europe/Moscow", label: "Москва (UTC+3)" },
  { value: "Europe/Tallinn", label: "Таллинн (UTC+2/+3)" },
  { value: "Europe/Riga", label: "Рига (UTC+2/+3)" },
  { value: "Europe/Helsinki", label: "Хельсинки (UTC+2/+3)" },
  { value: "Europe/London", label: "Лондон (UTC+0/+1)" },
  { value: "Europe/Berlin", label: "Берлин (UTC+1/+2)" },
  { value: "Asia/Dubai", label: "Дубай (UTC+4)" },
  { value: "UTC", label: "UTC" },
] as const;
