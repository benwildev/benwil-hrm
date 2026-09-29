-- AlterTable
ALTER TABLE "employees" ADD COLUMN     "biometric_user_id" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "employees_biometric_user_id_key" ON "employees"("biometric_user_id");

