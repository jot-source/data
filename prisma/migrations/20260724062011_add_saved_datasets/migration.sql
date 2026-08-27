-- CreateTable
CREATE TABLE "saved_datasets" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "dataset_id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "saved_datasets_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "saved_datasets_user_id_idx" ON "saved_datasets"("user_id");

-- CreateIndex
CREATE INDEX "saved_datasets_dataset_id_idx" ON "saved_datasets"("dataset_id");

-- CreateIndex
CREATE UNIQUE INDEX "saved_datasets_user_id_dataset_id_key" ON "saved_datasets"("user_id", "dataset_id");

-- AddForeignKey
ALTER TABLE "saved_datasets" ADD CONSTRAINT "saved_datasets_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "saved_datasets" ADD CONSTRAINT "saved_datasets_dataset_id_fkey" FOREIGN KEY ("dataset_id") REFERENCES "datasets"("id") ON DELETE CASCADE ON UPDATE CASCADE;
