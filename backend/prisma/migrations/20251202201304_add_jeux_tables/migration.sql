-- CreateTable
CREATE TABLE "editeurs" (
    "id" SERIAL NOT NULL,
    "libelle" TEXT NOT NULL,
    "exposant" BOOLEAN NOT NULL DEFAULT false,
    "distributeur" BOOLEAN NOT NULL DEFAULT false,
    "logo" TEXT,

    CONSTRAINT "editeurs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "types_jeu" (
    "id" SERIAL NOT NULL,
    "libelle" TEXT NOT NULL,
    "idZone" TEXT,

    CONSTRAINT "types_jeu_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "mecanismes" (
    "id" SERIAL NOT NULL,
    "nom" TEXT NOT NULL,
    "description" TEXT,

    CONSTRAINT "mecanismes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "jeux" (
    "id" SERIAL NOT NULL,
    "libelle" TEXT NOT NULL,
    "auteur" TEXT,
    "nbMinJoueur" INTEGER,
    "nbMaxJoueur" INTEGER,
    "notice" TEXT,
    "idEditeur" INTEGER,
    "idTypeJeu" INTEGER,
    "ageMin" INTEGER,
    "prototype" BOOLEAN NOT NULL DEFAULT false,
    "duree" INTEGER,
    "theme" TEXT,
    "description" TEXT,
    "image" TEXT,
    "videoRegle" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "jeux_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "jeux_mecanismes" (
    "id" SERIAL NOT NULL,
    "idJeu" INTEGER NOT NULL,
    "idMecanism" INTEGER NOT NULL,

    CONSTRAINT "jeux_mecanismes_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "jeux_mecanismes_idJeu_idMecanism_key" ON "jeux_mecanismes"("idJeu", "idMecanism");

-- AddForeignKey
ALTER TABLE "jeux" ADD CONSTRAINT "jeux_idEditeur_fkey" FOREIGN KEY ("idEditeur") REFERENCES "editeurs"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "jeux" ADD CONSTRAINT "jeux_idTypeJeu_fkey" FOREIGN KEY ("idTypeJeu") REFERENCES "types_jeu"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "jeux_mecanismes" ADD CONSTRAINT "jeux_mecanismes_idJeu_fkey" FOREIGN KEY ("idJeu") REFERENCES "jeux"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "jeux_mecanismes" ADD CONSTRAINT "jeux_mecanismes_idMecanism_fkey" FOREIGN KEY ("idMecanism") REFERENCES "mecanismes"("id") ON DELETE CASCADE ON UPDATE CASCADE;
