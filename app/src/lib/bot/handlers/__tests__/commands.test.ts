import { describe, it, expect, vi, beforeEach } from "vitest";

// ─── Mocks ──────────────────────────────────────────

const mockFindByTelegramChatId = vi.fn();
const mockFindByTelegramGroupId = vi.fn();
const mockFindByClientId = vi.fn();

vi.mock("@/lib/db/repositories", () => ({
  clientRepository: {
    findByTelegramChatId: (...args: unknown[]) =>
      mockFindByTelegramChatId(...args),
    findByTelegramGroupId: (...args: unknown[]) =>
      mockFindByTelegramGroupId(...args),
  },
  tripRepository: {
    findByClientId: (...args: unknown[]) => mockFindByClientId(...args),
  },
}));

vi.mock("@/lib/logger", () => ({
  createLogger: () => ({
    debug: vi.fn(),
    info: vi.fn(),
    warn: vi.fn(),
    error: vi.fn(),
  }),
}));

function createMockCtx(overrides: Record<string, unknown> = {}) {
  return {
    chat: { id: 12345, type: "private" },
    message: { text: "/trip" },
    reply: vi.fn(),
    ...overrides,
  };
}

describe("Bot Commands", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("/trip should show trip summary for linked client", async () => {
    const { handleTripCommand } = await import("@/lib/bot/handlers/commands");

    mockFindByTelegramChatId.mockResolvedValueOnce({
      id: "client-1",
      name: "Test",
    });
    mockFindByClientId.mockResolvedValueOnce({
      id: "trip-1",
      flightNumber: "TK1234",
      flightDate: new Date("2026-06-15T10:00:00Z"),
      departureCity: "Tallinn",
      departureAirport: "TLL",
      arrivalCity: "Istanbul",
      arrivalAirport: "IST",
      gate: "B5",
      hotelName: "Grand Hotel",
      hotelAddress: "Istiklal St 1",
      checkinTime: "14:00",
      checkoutTime: "12:00",
      guideName: "Mehmet",
      guidePhone: "+90 555 1234",
      transferInfo: "Airport shuttle",
      insuranceInfo: "ERGO",
      insurancePhone: "+372 600",
      managerPhone: "+372 5551234",
    });

    const ctx = createMockCtx();
    await handleTripCommand(ctx as never);

    expect(ctx.reply).toHaveBeenCalledTimes(1);
    const msg = ctx.reply.mock.calls[0][0] as string;
    expect(msg).toContain("Trip Summary");
    expect(msg).toContain("TK1234");
    expect(msg).toContain("Grand Hotel");
  });

  it("/trip should prompt unlinked users", async () => {
    const { handleTripCommand } = await import("@/lib/bot/handlers/commands");

    mockFindByTelegramChatId.mockResolvedValueOnce(undefined);

    const ctx = createMockCtx();
    await handleTripCommand(ctx as never);

    expect(ctx.reply).toHaveBeenCalledWith(
      expect.stringContaining("don't recognize"),
    );
  });

  it("/flight should show flight details", async () => {
    const { handleFlightCommand } = await import("@/lib/bot/handlers/commands");

    mockFindByTelegramChatId.mockResolvedValueOnce({ id: "c1" });
    mockFindByClientId.mockResolvedValueOnce({
      id: "t1",
      flightNumber: "AY100",
      flightDate: new Date("2026-07-01T08:00:00Z"),
      departureCity: "Helsinki",
      departureAirport: "HEL",
      arrivalCity: "Barcelona",
      arrivalAirport: "BCN",
      gate: "C3",
    });

    const ctx = createMockCtx();
    await handleFlightCommand(ctx as never);

    const msg = ctx.reply.mock.calls[0][0] as string;
    expect(msg).toContain("AY100");
    expect(msg).toContain("Barcelona");
  });

  it("/hotel should say N/A when no hotel set", async () => {
    const { handleHotelCommand } = await import("@/lib/bot/handlers/commands");

    mockFindByTelegramChatId.mockResolvedValueOnce({ id: "c1" });
    mockFindByClientId.mockResolvedValueOnce({
      id: "t1",
      hotelName: null,
    });

    const ctx = createMockCtx();
    await handleHotelCommand(ctx as never);

    const msg = ctx.reply.mock.calls[0][0] as string;
    expect(msg).toContain("No hotel details");
  });

  it("/guide should show guide info", async () => {
    const { handleGuideCommand } = await import("@/lib/bot/handlers/commands");

    mockFindByTelegramChatId.mockResolvedValueOnce({ id: "c1" });
    mockFindByClientId.mockResolvedValueOnce({
      id: "t1",
      guideName: "Anna",
      guidePhone: "+372 555",
    });

    const ctx = createMockCtx();
    await handleGuideCommand(ctx as never);

    const msg = ctx.reply.mock.calls[0][0] as string;
    expect(msg).toContain("Anna");
    expect(msg).toContain("+372 555");
  });
});
