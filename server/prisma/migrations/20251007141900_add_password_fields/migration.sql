-- AlterTable
ALTER TABLE "users" ADD COLUMN     "password_hash" TEXT,
ADD COLUMN     "is_password_set" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "force_password_setup" BOOLEAN NOT NULL DEFAULT true;
