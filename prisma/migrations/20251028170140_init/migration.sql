/*
  Warnings:

  - Added the required column `serviceId` to the `Penalty` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Penalty" ADD COLUMN     "serviceId" TEXT NOT NULL;

-- CreateIndex
CREATE INDEX "Penalty_serviceId_idx" ON "Penalty"("serviceId");

-- AddForeignKey
ALTER TABLE "Penalty" ADD CONSTRAINT "Penalty_serviceId_fkey" FOREIGN KEY ("serviceId") REFERENCES "Service"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
