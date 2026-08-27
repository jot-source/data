-- Add optional profile fields collected during the (skippable) profile-setup
-- step after sign-up. Both are nullable so the step can be skipped.
--   organization : user's company / university (free text)
--   job_title    : user's self-described role e.g. "Project Manager"
--                  (NOT the permission `role` column, which stays user/admin/seller)
-- AlterTable
ALTER TABLE "users" ADD COLUMN     "job_title" TEXT,
ADD COLUMN     "organization" TEXT;
