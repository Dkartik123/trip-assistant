// ─── Client Status Labels ─────────────────────────────────

export const CLIENT_STATUS_LABELS: Record<
  string,
  {
    label: string;
    variant: "default" | "secondary" | "destructive" | "outline";
  }
> = {
  active: { label: "Активен", variant: "default" },
  archived: { label: "Архив", variant: "secondary" },
  blocked: { label: "Заблокирован", variant: "destructive" },
};

export const CLIENT_STATUS_OPTIONS = [
  { value: "active", label: "Активен" },
  { value: "archived", label: "Архив" },
  { value: "blocked", label: "Заблокирован" },
] as const;
