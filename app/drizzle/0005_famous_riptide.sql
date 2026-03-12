CREATE TABLE "trip_subscribers" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"trip_id" uuid NOT NULL,
	"telegram_chat_id" varchar(50) NOT NULL,
	"name" varchar(255),
	"language" varchar(10) DEFAULT 'en',
	"joined_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "trip_subscribers" ADD CONSTRAINT "trip_subscribers_trip_id_trips_id_fk" FOREIGN KEY ("trip_id") REFERENCES "public"."trips"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "trip_subscribers_trip_id_idx" ON "trip_subscribers" USING btree ("trip_id");--> statement-breakpoint
CREATE INDEX "trip_subscribers_chat_id_idx" ON "trip_subscribers" USING btree ("telegram_chat_id");