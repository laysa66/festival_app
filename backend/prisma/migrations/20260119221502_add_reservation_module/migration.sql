-- CreateEnum
CREATE TYPE "WorkflowStatus" AS ENUM ('PAS_DE_CONTACT', 'CONTACT_PRIS', 'DISCUSSION_EN_COURS', 'SERA_ABSENT', 'CONSIDERE_ABSENT', 'PRESENT', 'FACTURE', 'FACTURE_PAYEE');

-- CreateEnum
CREATE TYPE "TypeReservant" AS ENUM ('EDITEUR', 'PRESTATAIRE', 'ANIMATION', 'ASSO', 'BOUTIQUE');

-- CreateEnum
CREATE TYPE "TypeRemise" AS ENUM ('TABLES_OFFERTES', 'SOMME_ARGENT');

-- CreateTable
CREATE TABLE "reservations" (
    "id" SERIAL NOT NULL,
    "editeur_id" INTEGER NOT NULL,
    "festival_id" INTEGER NOT NULL,
    "workflowStatus" "WorkflowStatus" NOT NULL DEFAULT 'PAS_DE_CONTACT',
    "typeReservant" "TypeReservant" NOT NULL DEFAULT 'EDITEUR',
    "date_facturation" DATE,
    "viendra_presente_ses_jeux" BOOLEAN NOT NULL DEFAULT true,
    "nous_presentons" BOOLEAN NOT NULL DEFAULT false,
    "liste_jeux_demandee" BOOLEAN NOT NULL DEFAULT false,
    "liste_jeux_obtenue" BOOLEAN NOT NULL DEFAULT false,
    "jeux_recus_physiquement" BOOLEAN NOT NULL DEFAULT false,
    "notes_client" TEXT,
    "notes_workflow" TEXT,
    "nb_prises_electriques" INTEGER NOT NULL DEFAULT 0,
    "type_remise" "TypeRemise",
    "valeur_remise" REAL NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "reservations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "reservation_lines" (
    "id" SERIAL NOT NULL,
    "reservation_id" INTEGER NOT NULL,
    "zone_tarifaire_id" INTEGER NOT NULL,
    "nb_tables" INTEGER NOT NULL,
    "nb_m2" REAL NOT NULL DEFAULT 0,
    "grandes_tables_souhaitees" BOOLEAN NOT NULL DEFAULT false,
    "sous_total" REAL NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "reservation_lines_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "reservation_contacts" (
    "id" SERIAL NOT NULL,
    "reservation_id" INTEGER NOT NULL,
    "date_contact" DATE NOT NULL,
    "commentaire" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "reservation_contacts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "reservation_jeux" (
    "id" SERIAL NOT NULL,
    "reservation_id" INTEGER NOT NULL,
    "jeu_id" INTEGER NOT NULL,
    "editeur_jeu_id" INTEGER,
    "zone_plan_id" INTEGER,
    "nb_exemplaires" INTEGER NOT NULL DEFAULT 1,
    "nb_tables_allouees" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "reservation_jeux_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "reservations_editeur_id_festival_id_key" ON "reservations"("editeur_id", "festival_id");

-- AddForeignKey
ALTER TABLE "reservations" ADD CONSTRAINT "reservations_editeur_id_fkey" FOREIGN KEY ("editeur_id") REFERENCES "editeurs"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "reservations" ADD CONSTRAINT "reservations_festival_id_fkey" FOREIGN KEY ("festival_id") REFERENCES "Festival"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "reservation_lines" ADD CONSTRAINT "reservation_lines_reservation_id_fkey" FOREIGN KEY ("reservation_id") REFERENCES "reservations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "reservation_lines" ADD CONSTRAINT "reservation_lines_zone_tarifaire_id_fkey" FOREIGN KEY ("zone_tarifaire_id") REFERENCES "ZoneTarifaire"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "reservation_contacts" ADD CONSTRAINT "reservation_contacts_reservation_id_fkey" FOREIGN KEY ("reservation_id") REFERENCES "reservations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "reservation_jeux" ADD CONSTRAINT "reservation_jeux_reservation_id_fkey" FOREIGN KEY ("reservation_id") REFERENCES "reservations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "reservation_jeux" ADD CONSTRAINT "reservation_jeux_jeu_id_fkey" FOREIGN KEY ("jeu_id") REFERENCES "jeux"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "reservation_jeux" ADD CONSTRAINT "reservation_jeux_editeur_jeu_id_fkey" FOREIGN KEY ("editeur_jeu_id") REFERENCES "editeurs"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "reservation_jeux" ADD CONSTRAINT "reservation_jeux_zone_plan_id_fkey" FOREIGN KEY ("zone_plan_id") REFERENCES "ZonePlan"("id") ON DELETE SET NULL ON UPDATE CASCADE;
