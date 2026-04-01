import { beforeEach, describe, expect, it, vi } from "vitest";

const mockFormatFullSummary = vi.fn();

vi.mock("@/lib/services/trip-message.service", () => ({
  tripMessageService: {
    formatFullSummary: (...args: unknown[]) => mockFormatFullSummary(...args),
  },
}));

describe("trip-export.service", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockFormatFullSummary.mockReturnValue([
      "🌍 <b>YOUR TRIP</b>\n✈️ <b>Flight AY100</b>\nBarcelona",
    ]);

    delete process.env.APPLE_WALLET_WWDR_BASE64;
    delete process.env.APPLE_WALLET_SIGNER_CERT_BASE64;
    delete process.env.APPLE_WALLET_SIGNER_KEY_BASE64;
    delete process.env.APPLE_WALLET_SIGNER_KEY_PASSPHRASE;
    delete process.env.APPLE_WALLET_PASS_TYPE_IDENTIFIER;
    delete process.env.APPLE_WALLET_TEAM_IDENTIFIER;
  });

  it("builds a Google Calendar URL from trip data", async () => {
    const { buildGoogleCalendarUrl } = await import(
      "@/lib/services/trip-export.service"
    );

    const url = buildGoogleCalendarUrl(
      {
        id: "trip-1",
        clientId: "client-1",
        managerId: "manager-1",
        status: "active",
        flightDate: new Date("2026-06-01T09:00:00.000Z"),
        arrivalDate: new Date("2026-06-07T18:00:00.000Z"),
        flights: [
          {
            type: "flight",
            flightNumber: "AY100",
            departureCity: "Helsinki",
            departureAirport: "HEL",
            arrivalCity: "Barcelona",
            arrivalAirport: "BCN",
            flightDate: "2026-06-01T09:00:00.000Z",
            arrivalDate: "2026-06-01T12:00:00.000Z",
            gate: "A12",
            passengers: [],
            trainNumber: "",
            departureStation: "",
            arrivalStation: "",
            seat: "",
            carriageClass: "",
          },
        ],
        hotels: [
          {
            hotelName: "Grand Hotel",
            hotelAddress: "1 Beach Road, Barcelona",
            hotelPhone: "",
            checkinDate: "2026-06-01",
            checkoutDate: "2026-06-07",
            checkinTime: "",
            checkoutTime: "",
            roomType: "",
            mealPlan: "",
            confirmationNumber: "",
            pin: "",
            price: "",
            cancellationPolicy: "",
            specialRequests: "",
            propertyMessages: [],
            guestName: "",
          },
        ],
        guides: [],
        transfers: [],
        insurances: [],
        attractions: [],
        notes: "Check passport validity",
        managerPhone: "",
        flightNumber: null,
        departureCity: null,
        departureAirport: null,
        arrivalCity: null,
        arrivalAirport: null,
        gate: null,
        hotelName: null,
        hotelAddress: null,
        hotelPhone: null,
        checkinTime: null,
        checkoutTime: null,
        guideName: null,
        guidePhone: null,
        transferInfo: null,
        transferDriverPhone: null,
        transferMeetingPoint: null,
        insuranceInfo: null,
        insurancePhone: null,
        inviteToken: null,
        createdAt: new Date("2026-01-01T00:00:00.000Z"),
        updatedAt: new Date("2026-01-01T00:00:00.000Z"),
      },
      "Jane Doe",
    );

    expect(url).toContain("calendar.google.com/calendar/render");
    expect(url).toContain("Jane+Doe+trip+to+Barcelona");
    expect(url).toContain("Barcelona");
    expect(url).toContain("Flights%3A");
  });

  it("generates a PDF buffer", async () => {
    const { generateTripPdf } = await import(
      "@/lib/services/trip-export.service"
    );

    const buffer = await generateTripPdf(
      {
        id: "trip-1",
        clientId: "client-1",
        managerId: "manager-1",
        status: "active",
        flightDate: new Date("2026-06-01T09:00:00.000Z"),
        arrivalDate: new Date("2026-06-07T18:00:00.000Z"),
        flights: [],
        hotels: [],
        guides: [],
        transfers: [],
        insurances: [],
        attractions: [],
        notes: null,
        managerPhone: null,
        flightNumber: null,
        departureCity: null,
        departureAirport: null,
        arrivalCity: null,
        arrivalAirport: null,
        gate: null,
        hotelName: null,
        hotelAddress: null,
        hotelPhone: null,
        checkinTime: null,
        checkoutTime: null,
        guideName: null,
        guidePhone: null,
        transferInfo: null,
        transferDriverPhone: null,
        transferMeetingPoint: null,
        insuranceInfo: null,
        insurancePhone: null,
        inviteToken: null,
        createdAt: new Date("2026-01-01T00:00:00.000Z"),
        updatedAt: new Date("2026-01-01T00:00:00.000Z"),
      },
      "Jane Doe",
    );

    expect(buffer.subarray(0, 4).toString()).toBe("%PDF");
  });

  it("normalizes HTML trip summary text for PDF export", async () => {
    const { normalizeTripSummary } = await import(
      "@/lib/services/trip-export.service"
    );

    expect(
      normalizeTripSummary([
        "📄 <b>Documents</b>\nLine &amp; more&nbsp;&#8364;",
        "<i>Ready</i>\n\n\n<a href=\"https://example.com\">Link</a> &copy;",
      ]),
    ).toBe("📄 Documents\nLine & more €\n\nReady\n\nLink ©");
  });

  it("reports wallet support as disabled without certificates", async () => {
    const { canGenerateWalletPasses } = await import(
      "@/lib/services/trip-export.service"
    );

    expect(canGenerateWalletPasses()).toBe(false);
  });
});
