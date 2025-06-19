-- AlterTable
ALTER TABLE "Reservation" ADD COLUMN     "reason" TEXT;

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "image" TEXT,
ALTER COLUMN "password" DROP NOT NULL;
