import { describe, it, expect, vi, beforeEach } from "vitest";
import type { Trip } from "@/lib/db/repositories";

/**
 * AI service unit test — verifies prompt building and response handling.
 * Uses mocked Anthropic client to avoid real API calls.
 */

// Mock Anthropic SDK
const mockCreate = vi.fn().mockResolvedValue({
  content: [{ type: "text", text: "Your flight is on May 12." }],
  usage: { input_tokens: 100, output_tokens: 20 },
});

vi.mock("@anthropic-ai/sdk", () => {
  return {
    default: class MockAnthropic {
      messages = { create: mockCreate };
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
    process.env.ANTHROPIC_API_KEY = "sk-ant-test-key";
    mockCreate.mockResolvedValue({
      content: [{ type: "text", text: "Your flight is on May 12." }],
      usage: { input_tokens: 100, output_tokens: 20 },
    });
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
          type: "flight" as const,
          flightDate: "2026-05-12T07:45",
          flightNumber: "AY123",
          departureCity: "Tallinn",
          departureAirport: "TLL",
          arrivalCity: "Rome",
          arrivalAirport: "FCO",
          arrivalDate: "2026-05-12T10:30",
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
          hotelName: "Hotel Roma",
          hotelAddress: "Via Roma 1",
          hotelPhone: "+39 06 1234567",
          checkinDate: "",
          checkoutDate: "",
          checkinTime: "14:00",
          checkoutTime: "11:00",
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
      guides: [{ guideName: "Marco", guidePhone: "+39 333 1234567" }],
      transfers: [
        {
          type: "transfer" as const,
          transferInfo: "Airport pickup included",
          transferDriverPhone: "+39 333 7654321",
          transferMeetingPoint: "Arrivals hall, exit B",
          date: "",
          time: "",
          fromLocation: "",
          toLocation: "",
          price: "",
          confirmationNumber: "",
          notes: "",
          rentalCompany: "",
          carModel: "",
          pickupLocation: "",
          dropoffLocation: "",
          pickupDate: "",
          pickupTime: "",
          dropoffDate: "",
          dropoffTime: "",
          rentalInsuranceType: "",
          rentalInsuranceInfo: "",
          rentalInsurancePhone: "",
        },
      ],
      insurances: [
        {
          insuranceInfo: "ERGO Travel Insurance",
          insurancePhone: "+372 6101010",
        },
      ],
      attractions: [],
      inviteToken: "test-token",
      notes: null,
      clientMemory: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    } as unknown as Trip;

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
      attractions: [],
      inviteToken: "token-2",
      notes: null,
      clientMemory: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    } as unknown as Trip;

    const result = await generateResponse(mockTrip, [], "Hello");
    expect(typeof result).toBe("string");
    expect(result.length).toBeGreaterThan(0);
  });
});
