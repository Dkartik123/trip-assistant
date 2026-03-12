import { z } from "zod";

// ─── Section Schemas ─────────────────────────────────────

export const passengerSchema = z.object({
  name: z.string().optional().default(""),
  dateOfBirth: z.string().optional().default(""),
  type: z.string().optional().default("adult"),
  baggage: z.string().optional().default(""),
  baggagePrice: z.string().optional().default(""),
  ticketPrice: z.string().optional().default(""),
});

export const flightSchema = z.object({
  type: z.enum(["flight", "train"]).optional().default("flight"),
  // Common
  flightDate: z.string().optional().default(""),
  departureCity: z.string().optional().default(""),
  arrivalCity: z.string().optional().default(""),
  arrivalDate: z.string().optional().default(""),
  passengers: z.array(passengerSchema).optional().default([]),
  // Flight-specific
  flightNumber: z.string().optional().default(""),
  departureAirport: z.string().optional().default(""),
  arrivalAirport: z.string().optional().default(""),
  gate: z.string().optional().default(""),
  // Train-specific
  trainNumber: z.string().optional().default(""),
  departureStation: z.string().optional().default(""),
  arrivalStation: z.string().optional().default(""),
  seat: z.string().optional().default(""),
  carriageClass: z.string().optional().default(""),
});

export const hotelSchema = z.object({
  hotelName: z.string().optional().default(""),
  hotelAddress: z.string().optional().default(""),
  hotelPhone: z.string().optional().default(""),
  checkinTime: z.string().optional().default(""),
  checkoutTime: z.string().optional().default(""),
  checkinDate: z.string().optional().default(""),
  checkoutDate: z.string().optional().default(""),
  roomType: z.string().optional().default(""),
  mealPlan: z.string().optional().default(""),
  guestName: z.string().optional().default(""),
  confirmationNumber: z.string().optional().default(""),
  pin: z.string().optional().default(""),
  price: z.string().optional().default(""),
  cancellationPolicy: z.string().optional().default(""),
  specialRequests: z.string().optional().default(""),
  propertyMessages: z.array(z.string()).optional().default([]),
});

export const guideSchema = z.object({
  guideName: z.string().optional().default(""),
  guidePhone: z.string().optional().default(""),
});

export const transferSchema = z.object({
  type: z.enum(["transfer", "rental", "walking"]).catch("transfer"),
  // Common
  transferInfo: z.string().optional().default(""),
  date: z.string().optional().default(""),
  time: z.string().optional().default(""),
  fromLocation: z.string().optional().default(""),
  toLocation: z.string().optional().default(""),
  price: z.string().optional().default(""),
  confirmationNumber: z.string().optional().default(""),
  notes: z.string().optional().default(""),
  // Transfer
  transferDriverPhone: z.string().optional().default(""),
  transferMeetingPoint: z.string().optional().default(""),
  // Rental
  rentalCompany: z.string().optional().default(""),
  carModel: z.string().optional().default(""),
  pickupLocation: z.string().optional().default(""),
  dropoffLocation: z.string().optional().default(""),
  pickupDate: z.string().optional().default(""),
  pickupTime: z.string().optional().default(""),
  dropoffDate: z.string().optional().default(""),
  dropoffTime: z.string().optional().default(""),
  rentalInsuranceType: z.string().optional().default(""),
  rentalInsuranceInfo: z.string().optional().default(""),
  rentalInsurancePhone: z.string().optional().default(""),
});

export const insuranceSchema = z.object({
  insuranceInfo: z.string().optional().default(""),
  insurancePhone: z.string().optional().default(""),
});

export const attractionSchema = z.object({
  name: z.string().optional().default(""),
  description: z.string().optional().default(""),
  date: z.string().optional().default(""),
  time: z.string().optional().default(""),
  location: z.string().optional().default(""),
  price: z.string().optional().default(""),
  confirmationNumber: z.string().optional().default(""),
  notes: z.string().optional().default(""),
});

// ─── Trip Schemas ────────────────────────────────────────

const baseTripSections = {
  flights: z.array(flightSchema).optional().default([]),
  hotels: z.array(hotelSchema).optional().default([]),
  guides: z.array(guideSchema).optional().default([]),
  transfers: z.array(transferSchema).optional().default([]),
  insurances: z.array(insuranceSchema).optional().default([]),
  attractions: z.array(attractionSchema).optional().default([]),
  managerPhone: z.string().max(50).optional().nullable(),
  notes: z.string().optional().nullable(),
};

export const createTripSchema = z.object({
  clientId: z.string().uuid(),
  managerId: z.string().uuid(),
  status: z.enum(["draft", "active", "completed"]).default("draft"),
  ...baseTripSections,
});

export const updateTripSchema = z.object({
  status: z.enum(["draft", "active", "completed"]).optional(),
  flights: z.array(flightSchema).optional(),
  hotels: z.array(hotelSchema).optional(),
  guides: z.array(guideSchema).optional(),
  transfers: z.array(transferSchema).optional(),
  insurances: z.array(insuranceSchema).optional(),
  attractions: z.array(attractionSchema).optional(),
  managerPhone: z.string().max(50).optional().nullable(),
  notes: z.string().optional().nullable(),
});
