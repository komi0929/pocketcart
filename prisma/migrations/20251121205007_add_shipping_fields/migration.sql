-- AlterTable
ALTER TABLE "Order" ADD COLUMN     "shipped_at" TIMESTAMP(3),
ADD COLUMN     "tracking_number" TEXT;
