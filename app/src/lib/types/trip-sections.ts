// ─── Shared types for multi-card trip sections ──────────

export interface FlightItem {
  flightDate: string;
  flightNumber: string;
  departureCity: string;
  departureAirport: string;
  arrivalCity: string;
  arrivalAirport: string;
  arrivalDate: string;
  gate: string;
}

export interface HotelItem {
  hotelName: string;
  hotelAddress: string;
  hotelPhone: string;
  checkinTime: string;
  checkoutTime: string;
}

export interface GuideItem {
  guideName: string;
  guidePhone: string;
}

export interface TransferItem {
  transferInfo: string;
  transferDriverPhone: string;
  transferMeetingPoint: string;
}

export interface InsuranceItem {
  insuranceInfo: string;
  insurancePhone: string;
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
  managerPhone?: string;
  notes?: string;
}

// ─── Empty defaults ──────────────────────────────────────

export const emptyFlight: FlightItem = {
  flightDate: "",
  flightNumber: "",
  departureCity: "",
  departureAirport: "",
  arrivalCity: "",
  arrivalAirport: "",
  arrivalDate: "",
  gate: "",
};

export const emptyHotel: HotelItem = {
  hotelName: "",
  hotelAddress: "",
  hotelPhone: "",
  checkinTime: "",
  checkoutTime: "",
};

export const emptyGuide: GuideItem = {
  guideName: "",
  guidePhone: "",
};

export const emptyTransfer: TransferItem = {
  transferInfo: "",
  transferDriverPhone: "",
  transferMeetingPoint: "",
};

export const emptyInsurance: InsuranceItem = {
  insuranceInfo: "",
  insurancePhone: "",
};
