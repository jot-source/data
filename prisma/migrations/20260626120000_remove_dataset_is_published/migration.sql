-- Datasets are purchasable on upload now (a Dodo product is created at create
-- time), so the draft/publish split is gone. Drop the is_published column.
ALTER TABLE "datasets" DROP COLUMN "is_published";
