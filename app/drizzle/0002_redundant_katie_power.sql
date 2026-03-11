ALTER TABLE "trips" ADD COLUMN "flights" jsonb DEFAULT '[]'::jsonb;--> statement-breakpoint
ALTER TABLE "trips" ADD COLUMN "hotels" jsonb DEFAULT '[]'::jsonb;--> statement-breakpoint
ALTER TABLE "trips" ADD COLUMN "guides" jsonb DEFAULT '[]'::jsonb;--> statement-breakpoint
ALTER TABLE "trips" ADD COLUMN "transfers" jsonb DEFAULT '[]'::jsonb;--> statement-breakpoint
ALTER TABLE "trips" ADD COLUMN "insurances" jsonb DEFAULT '[]'::jsonb;--> statement-breakpoint

-- Migrate existing flat column data into new JSONB arrays
UPDATE "trips" SET "flights" = jsonb_build_array(jsonb_build_object(
  'flightDate', COALESCE(to_char("flight_date" AT TIME ZONE 'UTC', 'YYYY-MM-DD"T"HH24:MI'), ''),
  'flightNumber', COALESCE("flight_number", ''),
  'departureCity', COALESCE("departure_city", ''),
  'departureAirport', COALESCE("departure_airport", ''),
  'arrivalCity', COALESCE("arrival_city", ''),
  'arrivalAirport', COALESCE("arrival_airport", ''),
  'arrivalDate', COALESCE(to_char("arrival_date" AT TIME ZONE 'UTC', 'YYYY-MM-DD"T"HH24:MI'), ''),
  'gate', COALESCE("gate", '')
)) WHERE "flight_date" IS NOT NULL OR "flight_number" IS NOT NULL;--> statement-breakpoint

UPDATE "trips" SET "hotels" = jsonb_build_array(jsonb_build_object(
  'hotelName', COALESCE("hotel_name", ''),
  'hotelAddress', COALESCE("hotel_address", ''),
  'hotelPhone', COALESCE("hotel_phone", ''),
  'checkinTime', COALESCE("checkin_time", ''),
  'checkoutTime', COALESCE("checkout_time", '')
)) WHERE "hotel_name" IS NOT NULL;--> statement-breakpoint

UPDATE "trips" SET "guides" = jsonb_build_array(jsonb_build_object(
  'guideName', COALESCE("guide_name", ''),
  'guidePhone', COALESCE("guide_phone", '')
)) WHERE "guide_name" IS NOT NULL;--> statement-breakpoint

UPDATE "trips" SET "transfers" = jsonb_build_array(jsonb_build_object(
  'transferInfo', COALESCE("transfer_info", ''),
  'transferDriverPhone', COALESCE("transfer_driver_phone", ''),
  'transferMeetingPoint', COALESCE("transfer_meeting_point", '')
)) WHERE "transfer_info" IS NOT NULL;--> statement-breakpoint

UPDATE "trips" SET "insurances" = jsonb_build_array(jsonb_build_object(
  'insuranceInfo', COALESCE("insurance_info", ''),
  'insurancePhone', COALESCE("insurance_phone", '')
)) WHERE "insurance_info" IS NOT NULL;