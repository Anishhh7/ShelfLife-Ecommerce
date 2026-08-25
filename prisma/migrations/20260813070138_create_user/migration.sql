-- CreateEnum
CREATE TYPE "Role" AS ENUM ('Customer', 'Vendor', 'Staff', 'Admin');

-- CreateTable
CREATE TABLE "User" (
    "id" SERIAL NOT NULL,
    "name" TEXT,
    "email" TEXT,
    "phone" TEXT,
    "password" TEXT,
    "passwordConfirm" TEXT,
    "role" "Role" NOT NULL DEFAULT 'Customer',
    "active" BOOLEAN NOT NULL DEFAULT true,
    "passwordChangedAt" TIMESTAMP(3),
    "approved" BOOLEAN NOT NULL DEFAULT false,
    "storeName" TEXT,
    "profileImageUrl" TEXT,
    "profileImagePublicId" TEXT,
    "vendorImageUrl" TEXT,
    "vendorImagePublicId" TEXT,
    "staffImageUrl" TEXT,
    "staffImagePublicId" TEXT,
    "location" TEXT NOT NULL DEFAULT 'Point',
    "coordinates" DOUBLE PRECISION[],
    "address" TEXT,
    "description" TEXT,
    "passwordResetOTP" TEXT,
    "passwordResetOTPExpires" TIMESTAMP(3),
    "refreshTokenExpires" TIMESTAMP(3),
    "refreshTokenHash" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "User_phone_key" ON "User"("phone");
