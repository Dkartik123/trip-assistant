CREATE TYPE "public"."client_status" AS ENUM('active', 'archived', 'blocked');--> statement-breakpoint
CREATE TYPE "public"."preferred_messenger" AS ENUM('whatsapp', 'telegram', 'sms', 'email');--> statement-breakpoint
ALTER TABLE "clients" ADD COLUMN "first_name" varchar(128);--> statement-breakpoint
ALTER TABLE "clients" ADD COLUMN "last_name" varchar(128);--> statement-breakpoint
ALTER TABLE "clients" ADD COLUMN "date_of_birth" timestamp with time zone;--> statement-breakpoint
ALTER TABLE "clients" ADD COLUMN "country" varchar(100);--> statement-breakpoint
ALTER TABLE "clients" ADD COLUMN "locale" varchar(20);--> statement-breakpoint
ALTER TABLE "clients" ADD COLUMN "telegram_username" varchar(100);--> statement-breakpoint
ALTER TABLE "clients" ADD COLUMN "preferred_messenger" "preferred_messenger";--> statement-breakpoint
ALTER TABLE "clients" ADD COLUMN "is_verified" boolean DEFAULT false;--> statement-breakpoint
ALTER TABLE "clients" ADD COLUMN "client_status" "client_status" DEFAULT 'active';--> statement-breakpoint
ALTER TABLE "clients" ADD COLUMN "source" varchar(100);--> statement-breakpoint
ALTER TABLE "clients" ADD COLUMN "manager_id" uuid;--> statement-breakpoint
ALTER TABLE "clients" ADD COLUMN "notes" text;--> statement-breakpoint
ALTER TABLE "clients" ADD COLUMN "preferred_contact_time" varchar(100);--> statement-breakpoint
ALTER TABLE "clients" ADD COLUMN "voice_enabled" boolean DEFAULT true;--> statement-breakpoint
ALTER TABLE "clients" ADD COLUMN "notification_enabled" boolean DEFAULT true;--> statement-breakpoint
ALTER TABLE "clients" ADD COLUMN "emergency_contact_name" varchar(255);--> statement-breakpoint
ALTER TABLE "clients" ADD COLUMN "emergency_contact_phone" varchar(50);--> statement-breakpoint
ALTER TABLE "clients" ADD COLUMN "consent_marketing" boolean DEFAULT false;--> statement-breakpoint
ALTER TABLE "clients" ADD COLUMN "consent_messaging" boolean DEFAULT false;--> statement-breakpoint
ALTER TABLE "clients" ADD COLUMN "consent_privacy" boolean DEFAULT false;--> statement-breakpoint
ALTER TABLE "clients" ADD COLUMN "last_seen_at" timestamp with time zone;--> statement-breakpoint
ALTER TABLE "clients" ADD COLUMN "updated_at" timestamp with time zone DEFAULT now();--> statement-breakpoint
ALTER TABLE "clients" ADD CONSTRAINT "clients_manager_id_managers_id_fk" FOREIGN KEY ("manager_id") REFERENCES "public"."managers"("id") ON DELETE set null ON UPDATE no action;