import { describe, it, expect, vi, beforeEach } from "vitest";

// ─── Mocks ──────────────────────────────────────────

const mockTripCreate = vi.fn();
const mockTripUpdate = vi.fn();
const mockTripFindById = vi.fn();
const mockTripFindByInviteToken = vi.fn();
const mockTripFindByClientId = vi.fn();
const mockNotifCreateMany = vi.fn().mockResolvedValue([]);
const mockNotifDeletePending = vi.fn();

vi.mock("@/lib/db/repositories", () => ({
  tripRepository: {
    create: (...args: unknown[]) => mockTripCreate(...args),
    update: (...args: unknown[]) => mockTripUpdate(...args),
    findById: (...args: unknown[]) => mockTripFindById(...args),
    findByInviteToken: (...args: unknown[]) =>
      mockTripFindByInviteToken(...args),
    findByClientId: (...args: unknown[]) => mockTripFindByClientId(...args),
  },
  clientRepository: {},
  notificationRepository: {
    createMany: (...args: unknown[]) => mockNotifCreateMany(...args),
    deletePendingByTripId: (...args: unknown[]) =>
      mockNotifDeletePending(...args),
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

describe("Trip Service", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should create a trip with invite token", async () => {
    const { tripService } = await import("@/lib/services/trip.service");

    const fakeTrip = {
      id: "trip-1",
      clientId: "client-1",
      managerId: "manager-1",
      status: "draft",
      flightDate: null,
      inviteToken: "abc123",
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    mockTripCreate.mockResolvedValueOnce(fakeTrip);

    const result = await tripService.createTrip({
      clientId: "client-1",
      managerId: "manager-1",
    });

    expect(result.id).toBe("trip-1");
    expect(mockTripCreate).toHaveBeenCalledTimes(1);
    // Should include an inviteToken
    const callArg = mockTripCreate.mock.calls[0][0];
    expect(callArg.inviteToken).toBeDefined();
    expect(typeof callArg.inviteToken).toBe("string");
    expect(callArg.inviteToken.length).toBe(64); // 32 bytes hex
  });

  it("should schedule notifications when flight date is set", async () => {
    const { tripService } = await import("@/lib/services/trip.service");

    const futureDate = new Date(Date.now() + 48 * 60 * 60 * 1000); // 48h from now
    const fakeTrip = {
      id: "trip-2",
      clientId: "client-1",
      managerId: "manager-1",
      status: "active",
      flightDate: futureDate,
      inviteToken: "xyz",
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    mockTripCreate.mockResolvedValueOnce(fakeTrip);

    await tripService.createTrip({
      clientId: "client-1",
      managerId: "manager-1",
      flightDate: futureDate,
    });

    // Should create 3 notifications (24h, 3h, arrival)
    expect(mockNotifCreateMany).toHaveBeenCalledTimes(1);
    const notifs = mockNotifCreateMany.mock.calls[0][0];
    expect(notifs.length).toBe(3);
    expect(notifs.map((n: { type: string }) => n.type)).toEqual([
      "24h_before",
      "3h_before",
      "arrival",
    ]);
  });

  it("should reschedule notifications on flight date update", async () => {
    const { tripService } = await import("@/lib/services/trip.service");

    const oldDate = new Date(Date.now() + 24 * 60 * 60 * 1000);
    const newDate = new Date(Date.now() + 72 * 60 * 60 * 1000);

    mockTripFindById.mockResolvedValueOnce({
      id: "trip-3",
      flightDate: oldDate,
    });

    mockTripUpdate.mockResolvedValueOnce({
      id: "trip-3",
      flightDate: newDate,
      inviteToken: "abc",
    });

    await tripService.updateTrip("trip-3", { flightDate: newDate });

    expect(mockNotifDeletePending).toHaveBeenCalledWith("trip-3");
    expect(mockNotifCreateMany).toHaveBeenCalledTimes(1);
  });

  it("should generate a valid deep link", async () => {
    const { tripService } = await import("@/lib/services/trip.service");

    const trip = { inviteToken: "test-token-abc" } as Parameters<
      typeof tripService.getDeepLink
    >[0];
    const link = tripService.getDeepLink(trip, "TestBot");

    expect(link).toBe("https://t.me/TestBot?start=test-token-abc");
  });
});
