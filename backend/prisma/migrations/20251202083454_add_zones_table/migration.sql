/*
  Warnings:

  - You are about to drop the `festival` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropTable
DROP TABLE "festival";

-- CreateTable
CREATE TABLE "Festival" (
    "id" SERIAL NOT NULL,
    "nom" VARCHAR(100) NOT NULL,
    "lieu" VARCHAR(100) NOT NULL,
    "dateDebut" DATE NOT NULL,
    "dateFin" DATE NOT NULL,
    "nbTotalTable" INTEGER NOT NULL,
    "nbTotalChaise" INTEGER NOT NULL,

    CONSTRAINT "Festival_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ZoneTarifaire" (
    "id" SERIAL NOT NULL,
    "festival_id" INTEGER NOT NULL,
    "nom" VARCHAR(100) NOT NULL,
    "prixTable" REAL NOT NULL,
    "prixM2" REAL NOT NULL,

    CONSTRAINT "ZoneTarifaire_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ZonePlan" (
    "id" SERIAL NOT NULL,
    "festival_id" INTEGER NOT NULL,
    "nom" VARCHAR(100) NOT NULL,
    "zone_tarifaire_id" INTEGER NOT NULL,

    CONSTRAINT "ZonePlan_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "ZoneTarifaire" ADD CONSTRAINT "ZoneTarifaire_festival_id_fkey" FOREIGN KEY ("festival_id") REFERENCES "Festival"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ZonePlan" ADD CONSTRAINT "ZonePlan_festival_id_fkey" FOREIGN KEY ("festival_id") REFERENCES "Festival"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ZonePlan" ADD CONSTRAINT "ZonePlan_zone_tarifaire_id_fkey" FOREIGN KEY ("zone_tarifaire_id") REFERENCES "ZoneTarifaire"("id") ON DELETE CASCADE ON UPDATE CASCADE;
