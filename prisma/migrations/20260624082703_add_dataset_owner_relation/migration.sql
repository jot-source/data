-- AlterTable
ALTER TABLE "datasets" ADD COLUMN     "dodo_product_id" TEXT,
ADD COLUMN     "uploaded_by_user_id" TEXT;

-- AlterTable
ALTER TABLE "users" ALTER COLUMN "updated_at" DROP DEFAULT;

-- CreateIndex
CREATE INDEX "datasets_uploaded_by_user_id_idx" ON "datasets"("uploaded_by_user_id");

-- CreateIndex
CREATE INDEX "downloads_user_id_idx" ON "downloads"("user_id");

-- CreateIndex
CREATE INDEX "downloads_dataset_id_idx" ON "downloads"("dataset_id");

-- CreateIndex
CREATE INDEX "downloads_order_id_idx" ON "downloads"("order_id");

-- CreateIndex
CREATE INDEX "orders_user_id_idx" ON "orders"("user_id");

-- CreateIndex
CREATE INDEX "orders_dataset_id_idx" ON "orders"("dataset_id");

-- CreateIndex
CREATE INDEX "orders_status_idx" ON "orders"("status");

-- AddForeignKey
ALTER TABLE "datasets" ADD CONSTRAINT "datasets_uploaded_by_user_id_fkey" FOREIGN KEY ("uploaded_by_user_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
