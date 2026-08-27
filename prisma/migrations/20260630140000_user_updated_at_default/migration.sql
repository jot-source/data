-- Give users.updated_at a DB-level default.
--
-- Prisma's @updatedAt is applied in application code only, so the column had no
-- database default. The Supabase `handle_new_user` trigger INSERTs the
-- public.users row on signup *outside* Prisma, leaving updated_at null →
-- NOT NULL violation → the signup transaction aborts and GoTrue returns a 500.
-- A DB default fixes the trigger insert; @updatedAt still bumps it on app updates.
ALTER TABLE "users" ALTER COLUMN "updated_at" SET DEFAULT CURRENT_TIMESTAMP;
