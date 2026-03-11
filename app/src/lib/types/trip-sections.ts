// ─── Shared types for multi-card trip sections ──────────

/** Passenger on a flight (name + baggage) */
export interface PassengerItem {
  name: string;
  dateOfBirth: string; // DD.MM.YY or YYYY-MM-DD
  type: string; // "adult" | "child" | "infant"
  baggage: string; // e.g. "Käsipagas 55cm×40cm×20cm 10kg"
  baggagePrice: string; // e.g. "49.49 EUR"
  ticketPrice: string; // e.g. "148.91 EUR"
}

export type RouteType = "flight" | "train";

export interface FlightItem {
  /** Type of route: flight or train */
  type: RouteType;

  // ── Common ──
  flightDate: string;          // departure datetime YYYY-MM-DDTHH:mm
  departureCity: string;
  arrivalCity: string;
  arrivalDate: string;         // arrival datetime  YYYY-MM-DDTHH:mm
  passengers: PassengerItem[];

  // ── Flight-specific ──
  flightNumber: string;
  departureAirport: string;    // IATA
  arrivalAirport: string;      // IATA
  gate: string;

  // ── Train-specific ──
  trainNumber: string;
  departureStation: string;
  arrivalStation: string;
  seat: string;
  carriageClass: string;       // "1st" | "2nd" | "business"
}

export interface HotelItem {
  hotelName: string;
  hotelAddress: string;
  hotelPhone: string;
  checkinDate: string; // YYYY-MM-DD
  checkoutDate: string; // YYYY-MM-DD
  checkinTime: string;
  checkoutTime: string;
  roomType: string;
  mealPlan: string; // e.g. "Breakfast included"
  confirmationNumber: string;
  pin: string;
  price: string;
  cancellationPolicy: string;
  specialRequests: string;
  propertyMessages: string[]; // messages from the hotel/property
  guestName: string;
}

export interface GuideItem {
  guideName: string;
  guidePhone: string;
}

export type TransferType = "transfer" | "rental" | "walking";

export interface TransferItem {
  /** Type of transport: transfer, rental, train, walking */
  type: TransferType;

  // ── Common ──
  transferInfo: string;
  date: string;           // YYYY-MM-DD
  time: string;           // HH:mm
  fromLocation: string;
  toLocation: string;
  price: string;
  confirmationNumber: string;
  notes: string;

  // ── Transfer-specific ──
  transferDriverPhone: string;
  transferMeetingPoint: string;

  // ── Car rental-specific ──
  rentalCompany: string;
  carModel: string;
  pickupLocation: string;
  dropoffLocation: string;
  pickupDate: string;     // YYYY-MM-DD
  pickupTime: string;     // HH:mm
  dropoffDate: string;    // YYYY-MM-DD
  dropoffTime: string;    // HH:mm
  rentalInsuranceType: string;    // e.g. "CDW", "SCDW", "Full"
  rentalInsuranceInfo: string;    // policy details
  rentalInsurancePhone: string;

}

export interface InsuranceItem {
  insuranceInfo: string;
  insurancePhone: string;
}

/** Attractions, activities, and experiences */
export interface AttractionItem {
  name: string;
  description: string;
  date: string; // YYYY-MM-DD
  time: string; // HH:mm
  location: string;
  price: string;
  confirmationNumber: string;
  notes: string;
}

export interface NoteItem {
  title: string;
  text: string;
}

export interface ExtractedTripData {
  flights?: FlightItem[];
  hotels?: HotelItem[];
  guides?: GuideItem[];
  transfers?: TransferItem[];
  insurances?: InsuranceItem[];
  attractions?: AttractionItem[];
  managerPhone?: string;
  notes?: string;
}

// ─── Empty defaults ──────────────────────────────────────

export const emptyPassenger: PassengerItem = {
  name: "",
  dateOfBirth: "",
  type: "adult",
  baggage: "",
  baggagePrice: "",
  ticketPrice: "",
};

export const emptyFlight: FlightItem = {
  type: "flight",
  flightDate: "",
  departureCity: "",
  arrivalCity: "",
  arrivalDate: "",
  passengers: [],
  // Flight-specific
  flightNumber: "",
  departureAirport: "",
  arrivalAirport: "",
  gate: "",
  // Train-specific
  trainNumber: "",
  departureStation: "",
  arrivalStation: "",
  seat: "",
  carriageClass: "",
};

export const emptyHotel: HotelItem = {
  hotelName: "",
  hotelAddress: "",
  hotelPhone: "",
  checkinDate: "",
  checkoutDate: "",
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
};

export const emptyGuide: GuideItem = {
  guideName: "",
  guidePhone: "",
};

export const emptyTransfer: TransferItem = {
  type: "transfer",
  transferInfo: "",
  date: "",
  time: "",
  fromLocation: "",
  toLocation: "",
  price: "",
  confirmationNumber: "",
  notes: "",
  transferDriverPhone: "",
  transferMeetingPoint: "",
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
};

export const emptyInsurance: InsuranceItem = {
  insuranceInfo: "",
  insurancePhone: "",
};

export const emptyAttraction: AttractionItem = {
  name: "",
  description: "",
  date: "",
  time: "",
  location: "",
  price: "",
  confirmationNumber: "",
  notes: "",
};
