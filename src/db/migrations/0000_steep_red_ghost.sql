DO $$ BEGIN
 CREATE TYPE "vote_type" AS ENUM('single', 'ranked');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "poll_choices" (
	"id" uuid PRIMARY KEY NOT NULL,
	"title" varchar(32) NOT NULL,
	"poll_id" uuid,
	"created_by" varchar(255),
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "polls" (
	"id" uuid PRIMARY KEY NOT NULL,
	"title" varchar(32) NOT NULL,
	"description" varchar(32),
	"vote_type" "vote_type",
	"is_private" boolean DEFAULT false,
	"is_active" boolean DEFAULT true,
	"is_closed" boolean DEFAULT false,
	"created_by" varchar(255),
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "ranked_votes" (
	"id" uuid PRIMARY KEY NOT NULL,
	"poll_id" uuid,
	"poll_choice_id" uuid,
	"voter_id" varchar(255),
	"rank" integer,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "single_votes" (
	"id" uuid PRIMARY KEY NOT NULL,
	"poll_id" uuid,
	"poll_choice_id" uuid,
	"voter_id" varchar(255),
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "poll_choices" ADD CONSTRAINT "poll_choices_poll_id_polls_id_fk" FOREIGN KEY ("poll_id") REFERENCES "polls"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "ranked_votes" ADD CONSTRAINT "ranked_votes_poll_id_polls_id_fk" FOREIGN KEY ("poll_id") REFERENCES "polls"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "ranked_votes" ADD CONSTRAINT "ranked_votes_poll_choice_id_poll_choices_id_fk" FOREIGN KEY ("poll_choice_id") REFERENCES "poll_choices"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "single_votes" ADD CONSTRAINT "single_votes_poll_id_polls_id_fk" FOREIGN KEY ("poll_id") REFERENCES "polls"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "single_votes" ADD CONSTRAINT "single_votes_poll_choice_id_poll_choices_id_fk" FOREIGN KEY ("poll_choice_id") REFERENCES "poll_choices"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
