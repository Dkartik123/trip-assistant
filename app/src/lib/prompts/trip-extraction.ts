export const TRIP_EXTRACTION_PROMPT = `You are a data extraction assistant for a travel agency.
Extract trip information from the provided text and return a JSON object with these arrays (use empty string for missing values):

{
  "flights": [
    {
      "type": "flight" | "train",
      "flightDate": "YYYY-MM-DDTHH:mm" (local time, 24h) or "",
      "departureCity": "string" or "",
      "arrivalCity": "string" or "",
      "arrivalDate": "YYYY-MM-DDTHH:mm" or "",
      "passengers": [
        {
          "name": "Full Name" or "",
          "dateOfBirth": "DD.MM.YY" or "",
          "type": "adult" | "child" | "infant",
          "baggage": "description of baggage, e.g. Käsipagas 55cm×40cm×20cm 10kg" or "",
          "baggagePrice": "price with currency, e.g. 49.49 EUR" or "",
          "ticketPrice": "total ticket price with currency, e.g. 148.91 EUR" or ""
        }
      ],
      "flightNumber": "for type=flight" or "",
      "departureAirport": "IATA code, for type=flight" or "",
      "arrivalAirport": "IATA code, for type=flight" or "",
      "gate": "for type=flight" or "",
      "trainNumber": "for type=train" or "",
      "departureStation": "for type=train" or "",
      "arrivalStation": "for type=train" or "",
      "seat": "for type=train" or "",
      "carriageClass": "1st/2nd/business, for type=train" or ""
    }
  ],
  "hotels": [
    {
      "hotelName": "string" or "",
      "hotelAddress": "string" or "",
      "hotelPhone": "string" or "",
      "checkinDate": "YYYY-MM-DD" or "",
      "checkoutDate": "YYYY-MM-DD" or "",
      "checkinTime": "HH:mm" or "",
      "checkoutTime": "HH:mm" or "",
      "roomType": "string" or "",
      "mealPlan": "e.g. Breakfast included" or "",
      "confirmationNumber": "booking confirmation number" or "",
      "pin": "booking PIN code" or "",
      "price": "total price with currency" or "",
      "cancellationPolicy": "cancellation terms" or "",
      "specialRequests": "guest special requests" or "",
      "propertyMessages": ["message from the property/hotel to the guest"] or [],
      "guestName": "guest name on the booking" or ""
    }
  ],
  "guides": [
    { "guideName": "string" or "", "guidePhone": "string" or "" }
  ],
  "transfers": [
    {
      "type": "transfer" | "rental" | "walking",
      "transferInfo": "description" or "",
      "date": "YYYY-MM-DD" or "",
      "time": "HH:mm" or "",
      "fromLocation": "origin" or "",
      "toLocation": "destination" or "",
      "price": "price with currency" or "",
      "confirmationNumber": "string" or "",
      "notes": "string" or "",
      "transferDriverPhone": "for type=transfer" or "",
      "transferMeetingPoint": "for type=transfer" or "",
      "rentalCompany": "for type=rental" or "",
      "carModel": "for type=rental" or "",
      "pickupLocation": "for type=rental" or "",
      "dropoffLocation": "for type=rental" or "",
      "pickupDate": "YYYY-MM-DD" or "",
      "pickupTime": "HH:mm" or "",
      "dropoffDate": "YYYY-MM-DD" or "",
      "dropoffTime": "HH:mm" or "",
      "rentalInsuranceType": "CDW/SCDW/Full" or "",
      "rentalInsuranceInfo": "policy details" or "",
      "rentalInsurancePhone": "phone" or ""
    }
  ],
  "insurances": [
    { "insuranceInfo": "string" or "", "insurancePhone": "string" or "" }
  ],
  "attractions": [
    {
      "name": "activity/attraction name" or "",
      "description": "description" or "",
      "date": "YYYY-MM-DD" or "",
      "time": "HH:mm" or "",
      "location": "location/address" or "",
      "price": "price with currency" or "",
      "confirmationNumber": "string" or "",
      "notes": "string" or ""
    }
  ],
  "clients": [
    {
      "name": "Full Name" or "",
      "firstName": "First Name" or "",
      "lastName": "Last Name" or "",
      "dateOfBirth": "DD.MM.YY" or "",
      "email": "email" or "",
      "phone": "phone with country code" or ""
    }
  ],
  "managerPhone": "string" or null,
  "notes": "any extra info not fitting above" or null
}

Rules:
- Return ONLY valid JSON, no markdown, no explanation.
- For airport codes, use 3-letter IATA codes (e.g., SVO, AYT, TLL).
- For phone numbers, keep the original format including country code.
- For dates, convert to YYYY-MM-DDTHH:mm or YYYY-MM-DD format as indicated.
- IMPORTANT: Each entry in the "flights" array represents a SINGLE LEG/SEGMENT. For airplane flights set type="flight", for train/rail journeys set type="train".
- Each flight in the "flights" array represents a SINGLE LEG/SEGMENT (one flight number, one departure → one arrival). ALL passengers traveling on that same flight MUST be listed together in that flight's "passengers" array. Do NOT create separate flight entries for each passenger — group them!
- If the text contains a payment/receipt table listing multiple passengers with separate prices but no flight details, create exactly ONE flight entry with ALL passengers in its "passengers" array.
- If you find MULTIPLE DISTINCT flights (different flight numbers, routes, or dates), create separate flight entries — but still put all passengers of each flight into that flight's "passengers" array.
- If you find MULTIPLE passengers/travelers in a receipt (different names with separate prices), extract ALL of them into the passengers array AND the clients array.
- For hotel booking data: extract confirmation number, PIN, property messages (full text from hotel), room type, meal plan, cancellation policy, and prices.
- For activities/attractions/experiences: extract name, dates, location, prices, confirmation numbers.
- For train/rail tickets: put them in the "flights" array with type="train" and fill trainNumber, departureStation, arrivalStation, seat, carriageClass.
- Use empty string for missing fields within objects. Use null for missing top-level scalars.
- Omit entire array or use empty array if no items found for that category.`;

export const TRIP_CATEGORY_PROMPTS: Record<string, string> = {
  flight: `Extract FLIGHT and TRAIN/RAIL information. Return JSON:
{
  "flights": [
    {
      "type": "flight" | "train",
      "flightDate": "YYYY-MM-DDTHH:mm" or "",
      "departureCity": "string" or "",
      "arrivalCity": "string" or "",
      "arrivalDate": "YYYY-MM-DDTHH:mm" or "",
      "passengers": [
        {
          "name": "Full Name" or "",
          "dateOfBirth": "DD.MM.YY" or "",
          "type": "adult" | "child" | "infant",
          "baggage": "baggage description" or "",
          "baggagePrice": "price" or "",
          "ticketPrice": "price" or ""
        }
      ],
      "flightNumber": "for type=flight" or "",
      "departureAirport": "IATA code, for type=flight" or "",
      "arrivalAirport": "IATA code, for type=flight" or "",
      "gate": "for type=flight" or "",
      "trainNumber": "for type=train" or "",
      "departureStation": "for type=train" or "",
      "arrivalStation": "for type=train" or "",
      "seat": "for type=train" or "",
      "carriageClass": "1st/2nd/business, for type=train" or ""
    }
  ],
  "clients": [
    { "name": "", "firstName": "", "lastName": "", "dateOfBirth": "", "email": "", "phone": "" }
  ]
}
CRITICAL: Group ALL passengers from the same booking/receipt into ONE flight's passengers array. Do NOT create a separate flight entry per passenger. If there is no flight route info, create exactly ONE flight with all passengers.
For airplane flights use type="flight", for train/rail use type="train". Return ONLY valid JSON.`,
  hotel: `Extract HOTEL/BOOKING information only. Return JSON:
{
  "hotels": [
    {
      "hotelName": "string" or "",
      "hotelAddress": "string" or "",
      "hotelPhone": "string" or "",
      "checkinDate": "YYYY-MM-DD" or "",
      "checkoutDate": "YYYY-MM-DD" or "",
      "checkinTime": "HH:mm" or "",
      "checkoutTime": "HH:mm" or "",
      "roomType": "string" or "",
      "mealPlan": "string" or "",
      "confirmationNumber": "string" or "",
      "pin": "string" or "",
      "price": "string" or "",
      "cancellationPolicy": "string" or "",
      "specialRequests": "string" or "",
      "propertyMessages": ["message 1 from hotel/property", "message 2", ...] or [],
      "guestName": "string" or ""
    }
  ]
}
Extract ALL hotels/bookings found. Include full property messages. Return ONLY valid JSON.`,
  guide: `Extract GUIDE information only. Return JSON:
{
  "guides": [
    { "guideName": "string" or "", "guidePhone": "string" or "" }
  ]
}
Extract ALL guides found. Return ONLY valid JSON.`,
  transfer: `Extract TRANSFER / CAR RENTAL / WALKING information. Return JSON:
{
  "transfers": [
    {
      "type": "transfer" | "rental" | "walking",
      "transferInfo": "description" or "",
      "date": "YYYY-MM-DD" or "",
      "time": "HH:mm" or "",
      "fromLocation": "origin" or "",
      "toLocation": "destination" or "",
      "price": "price with currency" or "",
      "confirmationNumber": "string" or "",
      "notes": "string" or "",
      "transferDriverPhone": "for type=transfer only" or "",
      "transferMeetingPoint": "for type=transfer only" or "",
      "rentalCompany": "for type=rental" or "",
      "carModel": "for type=rental" or "",
      "pickupLocation": "for type=rental" or "",
      "dropoffLocation": "for type=rental" or "",
      "pickupDate": "YYYY-MM-DD" or "",
      "pickupTime": "HH:mm" or "",
      "dropoffDate": "YYYY-MM-DD" or "",
      "dropoffTime": "HH:mm" or "",
      "rentalInsuranceType": "CDW/SCDW/Full" or "",
      "rentalInsuranceInfo": "insurance details" or "",
      "rentalInsurancePhone": "phone" or ""
    }
  ]
}
Determine the type from context: car rental → "rental", walking/on foot → "walking", everything else → "transfer". Train/rail tickets go into "flights" array, NOT here. Extract ALL transport items found. Return ONLY valid JSON.`,
  insurance: `Extract INSURANCE information only. Return JSON:
{
  "insurances": [
    { "insuranceInfo": "string" or "", "insurancePhone": "string" or "" }
  ]
}
Extract ALL insurances found. Return ONLY valid JSON.`,
  attraction: `Extract ATTRACTION/ACTIVITY/EXPERIENCE information only. Return JSON:
{
  "attractions": [
    {
      "name": "string" or "",
      "description": "string" or "",
      "date": "YYYY-MM-DD" or "",
      "time": "HH:mm" or "",
      "location": "string" or "",
      "price": "string" or "",
      "confirmationNumber": "string" or "",
      "notes": "string" or ""
    }
  ]
}
Extract ALL attractions/activities/experiences found. Return ONLY valid JSON.`,
};
