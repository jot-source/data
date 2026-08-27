-- Backfills migration history for facet columns that already exist on the
-- shared dev database (added via `prisma db push` at some point, without a
-- migration ever being generated). Guarded with IF NOT EXISTS so this is a
-- no-op there, while actually creating the columns on any environment
-- (preview/production) that was only ever built from the migrations folder.

-- AlterTable
ALTER TABLE "datasets"
  ADD COLUMN IF NOT EXISTS "modality" TEXT,
  ADD COLUMN IF NOT EXISTS "use_case" TEXT,
  ADD COLUMN IF NOT EXISTS "license_type" TEXT,
  ADD COLUMN IF NOT EXISTS "quality_score" DOUBLE PRECISION,
  ADD COLUMN IF NOT EXISTS "annotation_type" TEXT,
  ADD COLUMN IF NOT EXISTS "collection_method" TEXT,
  ADD COLUMN IF NOT EXISTS "dataset_code" TEXT,
  ADD COLUMN IF NOT EXISTS "record_count" BIGINT,
  ADD COLUMN IF NOT EXISTS "record_unit" TEXT,
  ADD COLUMN IF NOT EXISTS "languages" TEXT[] DEFAULT ARRAY[]::TEXT[],
  ADD COLUMN IF NOT EXISTS "countries" TEXT[] DEFAULT ARRAY[]::TEXT[],
  ADD COLUMN IF NOT EXISTS "compliance" TEXT[] DEFAULT ARRAY[]::TEXT[];

-- CreateIndex
CREATE INDEX IF NOT EXISTS "datasets_modality_idx" ON "datasets"("modality");
CREATE INDEX IF NOT EXISTS "datasets_use_case_idx" ON "datasets"("use_case");
CREATE INDEX IF NOT EXISTS "datasets_license_type_idx" ON "datasets"("license_type");
CREATE INDEX IF NOT EXISTS "datasets_quality_score_idx" ON "datasets"("quality_score");
CREATE INDEX IF NOT EXISTS "datasets_languages_idx" ON "datasets" USING GIN ("languages");
CREATE INDEX IF NOT EXISTS "datasets_compliance_idx" ON "datasets" USING GIN ("compliance");
