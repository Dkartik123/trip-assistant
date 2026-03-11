import { describe, it, expect, vi, beforeEach } from "vitest";

/**
 * AI service unit test — verifies prompt building and response handling.
 * Uses mocked Google Gemini client to avoid real API calls.
 */

// Mock Google GenAI SDK
const mockGenerateContent = vi.fn().mockResolvedValue({
  text: "Your flight is on May 12.",
  usageMetadata: { promptTokenCount: 100, candidatesTokenCount: 20 },
});

vi.mock("@google/genai", () => {
  return {
    GoogleGenAI: class MockGoogleGenAI {
      models = { generateContent: mockGenerateContent };
    },
  };
});

// Mock logger
vi.mock("@/lib/logger", () => ({
  createLogger: () => ({
    debug: vi.fn(),
    info: vi.fn(),
    warn: vi.fn(),
    error: vi.fn(),
  }),
}));

describe("AI Service", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    process.env.GEMINI_API_KEY = "AIzaSy-test-key";
  });

  it("should generate a response from trip data", async () => {
    const { generateResponse } = await import("@/lib/services/ai.service");

    const mockTrip = {
      id: "trip-1",
      clientId: "client-1",
      managerId: "manager-1",
      status: "active" as const,
      flightDate: new Date("2026-05-12T07:45:00Z"),
      flightNumber: "AY123",
      departureCity: "Tallinn",
      departureAirport: "TLL",
      arrivalCity: "Rome",
      arrivalAirport: "FCO",
      arrivalDate: new Date("2026-05-12T10:30:00Z"),
      gate: "A12",
      hotelName: "Hotel Roma",
      hotelAddress: "Via Roma 1",
      hotelPhone: "+39 06 1234567",
      checkinTime: "14:00",
      checkoutTime: "11:00",
      guideName: "Marco",
      guidePhone: "+39 333 1234567",
      transferInfo: "Airport pickup included",
      transferDriverPhone: "+39 333 7654321",
      transferMeetingPoint: "Arrivals hall, exit B",
      insuranceInfo: "ERGO Travel Insurance",
      insurancePhone: "+372 6101010",
      managerPhone: "+372 5551234",
      flights: [
        {
          flightDate: "2026-05-12T07:45",
          flightNumber: "AY123",
          departureCity: "Tallinn",
          departureAirport: "TLL",
          arrivalCity: "Rome",
          arrivalAirport: "FCO",
          arrivalDate: "2026-05-12T10:30",
          gate: "A12",
        },
      ],
      hotels: [
        {
          hotelName: "Hotel Roma",
          hotelAddress: "Via Roma 1",
          hotelPhone: "+39 06 1234567",
          checkinTime: "14:00",
          checkoutTime: "11:00",
        },
      ],
      guides: [{ guideName: "Marco", guidePhone: "+39 333 1234567" }],
      transfers: [
        {
          transferInfo: "Airport pickup included",
          transferDriverPhone: "+39 333 7654321",
          transferMeetingPoint: "Arrivals hall, exit B",
        },
      ],
      insurances: [
        {
          insuranceInfo: "ERGO Travel Insurance",
          insurancePhone: "+372 6101010",
        },
      ],
      inviteToken: "test-token",
      notes: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const result = await generateResponse(mockTrip, [], "When is my flight?");

    expect(result).toBe("Your flight is on May 12.");
  });

  it("should handle empty history", async () => {
    const { generateResponse } = await import("@/lib/services/ai.service");

    const mockTrip = {
      id: "trip-2",
      clientId: "client-1",
      managerId: "manager-1",
      status: "active" as const,
      flightDate: null,
      flightNumber: null,
      departureCity: null,
      departureAirport: null,
      arrivalCity: null,
      arrivalAirport: null,
      arrivalDate: null,
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
      managerPhone: null,
      flights: [],
      hotels: [],
      guides: [],
      transfers: [],
      insurances: [],
      inviteToken: "token-2",
      notes: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const result = await generateResponse(mockTrip, [], "Hello");
    expect(typeof result).toBe("string");
    expect(result.length).toBeGreaterThan(0);
  });
});
