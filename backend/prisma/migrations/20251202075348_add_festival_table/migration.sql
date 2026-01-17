-- CreateTable
CREATE TABLE "festival" (
    "id" SERIAL NOT NULL,
    "nom" VARCHAR(100) NOT NULL,
    "lieu" VARCHAR(100) NOT NULL,
    "dateDebut" DATE NOT NULL,
    "dateFin" DATE NOT NULL,
    "nbTotalTable" INTEGER NOT NULL,
    "nbTotalChaise" INTEGER NOT NULL,

    CONSTRAINT "festival_pkey" PRIMARY KEY ("id")
);
