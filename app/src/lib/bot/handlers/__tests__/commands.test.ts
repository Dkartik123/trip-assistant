import { describe, it, expect, vi, beforeEach } from "vitest";

// ─── Mocks ──────────────────────────────────────────

const mockFindByTelegramChatId = vi.fn();
const mockFindByTelegramGroupId = vi.fn();
const mockFindByClientId = vi.fn();
const mockFindByChatId = vi.fn();
const mockFindById = vi.fn();

vi.mock("@/lib/db/repositories", () => ({
  clientRepository: {
    findByTelegramChatId: (...args: unknown[]) =>
      mockFindByTelegramChatId(...args),
    findByTelegramGroupId: (...args: unknown[]) =>
      mockFindByTelegramGroupId(...args),
  },
  tripRepository: {
    findByClientId: (...args: unknown[]) => mockFindByClientId(...args),
    findById: (...args: unknown[]) => mockFindById(...args),
  },
  subscriberRepository: {
    findByChatId: (...args: unknown[]) => mockFindByChatId(...args),
  },
}));

const mockFormatFlights = vi
  .fn()
  .mockReturnValue("✈️ <b>Flight AY100</b>\nHelsinki → Barcelona");
const mockFormatGuides = vi
  .fn()
  .mockReturnValue("🧑‍💼 <b>Guide</b>\nAnna — +372 555");
const mockFormatHotels = vi
  .fn()
  .mockReturnValue("🏨 <b>Hotel</b>\nNo hotel details available yet.");
const mockFormatFullSummary = vi
  .fn()
  .mockReturnValue(["📋 <b>Trip Summary</b>\nTK1234\nGrand Hotel"]);
const mockFormatDocs = vi
  .fn()
  .mockReturnValue("📄 <b>Documents</b>\nERGO Insurance");

vi.mock("@/lib/services/trip-message.service", () => ({
  tripMessageService: {
    formatFlights: (...args: unknown[]) => mockFormatFlights(...args),
    formatGuides: (...args: unknown[]) => mockFormatGuides(...args),
    formatHotels: (...args: unknown[]) => mockFormatHotels(...args),
    formatFullSummary: (...args: unknown[]) => mockFormatFullSummary(...args),
    formatDocs: (...args: unknown[]) => mockFormatDocs(...args),
  },
  summarizeTripForClient: vi
    .fn()
    .mockImplementation((trip: unknown) => Promise.resolve(trip)),
  translateParts: vi
    .fn()
    .mockImplementation((parts: string[]) => Promise.resolve(parts)),
  translateMessage: vi
    .fn()
    .mockImplementation((text: string) => Promise.resolve(text)),
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
    // Default: subscriber lookup returns nothing
    mockFindByChatId.mockResolvedValue(undefined);
  });

  it("/trip should send loading message and fire background summary", async () => {
    const { handleTripCommand } = await import("@/lib/bot/handlers/commands");

    mockFindByTelegramChatId.mockResolvedValueOnce({
      id: "client-1",
      name: "Test",
      language: "en",
    });
    mockFindByClientId.mockResolvedValueOnce({
      id: "trip-1",
      flightNumber: "TK1234",
      hotelName: "Grand Hotel",
    });

    const ctx = createMockCtx();
    await handleTripCommand(ctx as never);

    // First call is the loading message
    expect(ctx.reply).toHaveBeenCalledWith("⏳ Loading your trip summary...");

    // Background work runs asynchronously — wait a tick for it to resolve
    await new Promise((r) => setTimeout(r, 50));

    // Background call sends the formatted summary with HTML parse_mode
    expect(ctx.reply).toHaveBeenCalledWith(
      expect.stringContaining("Trip Summary"),
      { parse_mode: "HTML" },
    );
  });

  it("/trip should prompt unlinked users", async () => {
    const { handleTripCommand } = await import("@/lib/bot/handlers/commands");

    mockFindByTelegramChatId.mockResolvedValueOnce(undefined);
    mockFindByChatId.mockResolvedValueOnce(undefined);

    const ctx = createMockCtx();
    await handleTripCommand(ctx as never);

    expect(ctx.reply).toHaveBeenCalledWith(
      expect.stringContaining("don't recognize"),
    );
  });

  it("/flight should show flight details", async () => {
    const { handleFlightCommand } = await import("@/lib/bot/handlers/commands");

    mockFindByTelegramChatId.mockResolvedValueOnce({
      id: "c1",
      language: "en",
    });
    mockFindByClientId.mockResolvedValueOnce({
      id: "t1",
      flightNumber: "AY100",
      departureCity: "Helsinki",
      arrivalCity: "Barcelona",
    });

    const ctx = createMockCtx();
    await handleFlightCommand(ctx as never);

    expect(mockFormatFlights).toHaveBeenCalled();
    expect(ctx.reply).toHaveBeenCalledWith(expect.stringContaining("AY100"), {
      parse_mode: "HTML",
    });
  });

  it("/hotel should send loading + background hotel info", async () => {
    const { handleHotelCommand } = await import("@/lib/bot/handlers/commands");

    mockFindByTelegramChatId.mockResolvedValueOnce({
      id: "c1",
      language: "en",
    });
    mockFindByClientId.mockResolvedValueOnce({
      id: "t1",
      hotelName: null,
    });

    const ctx = createMockCtx();
    await handleHotelCommand(ctx as never);

    // Loading message fires first
    expect(ctx.reply).toHaveBeenCalledWith("⏳ Loading hotel details...");

    // Background work resolves
    await new Promise((r) => setTimeout(r, 50));

    expect(mockFormatHotels).toHaveBeenCalled();
    expect(ctx.reply).toHaveBeenCalledWith(expect.stringContaining("Hotel"), {
      parse_mode: "HTML",
    });
  });

  it("/guide should show guide info", async () => {
    const { handleGuideCommand } = await import("@/lib/bot/handlers/commands");

    mockFindByTelegramChatId.mockResolvedValueOnce({
      id: "c1",
      language: "en",
    });
    mockFindByClientId.mockResolvedValueOnce({
      id: "t1",
      guideName: "Anna",
      guidePhone: "+372 555",
    });

    const ctx = createMockCtx();
    await handleGuideCommand(ctx as never);

    expect(mockFormatGuides).toHaveBeenCalled();
    expect(ctx.reply).toHaveBeenCalledWith(expect.stringContaining("Anna"), {
      parse_mode: "HTML",
    });
  });
});
