CREATE TABLE "trip_clients" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"trip_id" uuid NOT NULL,
	"client_id" uuid NOT NULL,
	"role" varchar(50) DEFAULT 'traveler',
	"notes" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "trips" ADD COLUMN "attractions" jsonb DEFAULT '[]'::jsonb;--> statement-breakpoint
ALTER TABLE "trip_clients" ADD CONSTRAINT "trip_clients_trip_id_trips_id_fk" FOREIGN KEY ("trip_id") REFERENCES "public"."trips"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "trip_clients" ADD CONSTRAINT "trip_clients_client_id_clients_id_fk" FOREIGN KEY ("client_id") REFERENCES "public"."clients"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "trip_clients_trip_id_idx" ON "trip_clients" USING btree ("trip_id");--> statement-breakpoint
CREATE INDEX "trip_clients_client_id_idx" ON "trip_clients" USING btree ("client_id");