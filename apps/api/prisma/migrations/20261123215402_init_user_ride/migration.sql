-- CreateEnum
CREATE TYPE "RideSource" AS ENUM ('MANUAL', 'GPX');

-- CreateTable
CREATE TABLE "User" (
    "id" UUID NOT NULL,
    "email" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "timezone" TEXT NOT NULL,
    "createdAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Ride" (
    "id" UUID NOT NULL,
    "userId" UUID NOT NULL,
    "source" "RideSource" NOT NULL,
    "title" TEXT NOT NULL,
    "startedAt" TIMESTAMPTZ(3) NOT NULL,
    "distanceMeters" DECIMAL(12,3) NOT NULL,
    "elapsedSeconds" INTEGER,
    "elevationGainMeters" DECIMAL(10,3),
    "notes" TEXT,
    "createdAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(3) NOT NULL,

    CONSTRAINT "Ride_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");


-- AddForeignKey
ALTER TABLE "Ride"
  ADD CONSTRAINT "Ride_userId_fkey"
  FOREIGN KEY ("userId")
  REFERENCES "User"("id")
  ON DELETE RESTRICT
  ON UPDATE CASCADE;

-- AddCheckConstraints
ALTER TABLE "Ride"
  ADD CONSTRAINT "Ride_distanceMeters_valid"
    CHECK (
      "distanceMeters" >= 0
      AND "distanceMeters" <> 'NaN'::numeric
    ),
  ADD CONSTRAINT "Ride_elapsedSeconds_valid"
    CHECK (
      "elapsedSeconds" IS NULL
      OR "elapsedSeconds" >= 0
    ),
  ADD CONSTRAINT "Ride_elevationGainMeters_valid"
    CHECK (
      "elevationGainMeters" IS NULL
      OR (
        "elevationGainMeters" >= 0
        AND "elevationGainMeters" <> 'NaN'::numeric
      )
    );