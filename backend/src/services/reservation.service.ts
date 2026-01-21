import { PrismaClient, WorkflowStatus, TypeReservant, TypeRemise } from '@prisma/client';
import { NotFoundError, BadRequestError, ConflictError } from '../utils/errors/custom-errors';
import {
  ReservationDetail,
  ReservationListItem,
  CreateReservationRequest,
  UpdateReservationRequest,
  AddReservationLineRequest,
  UpdateReservationLineRequest,
  AddReservationContactRequest,
  AddReservationJeuRequest,
  UpdateReservationJeuRequest,
  ReservationFilters,
  PriceCalculationResponse,
  StockCheckResponse,
  PRIX_PRISE_ELECTRIQUE,
  RATIO_M2_PAR_TABLE,
  MAX_JEUX_PAR_TABLE,
} from '../models/reservation.models';

export class ReservationService {
  prisma: PrismaClient;

  constructor(prisma: PrismaClient) {
    this.prisma = prisma;
  }

  // ============================================
  // MÉTHODES CRUD PRINCIPALES
  // ============================================

  /**
   * Récupérer toutes les réservations avec filtres
   */
  async getAllReservations(filters: ReservationFilters) {
    const {
      festivalId,
      editeurId,
      workflowStatus,
      typeReservant,
      search,
      page = 1,
      pageSize = 20,
    } = filters;

    const where: any = {};

    if (festivalId) where.festivalId = festivalId;
    if (editeurId) where.editeurId = editeurId;
    if (workflowStatus) where.workflowStatus = workflowStatus;
    if (typeReservant) where.typeReservant = typeReservant;
    if (search) {
      where.OR = [
        { editeur: { libelle: { contains: search, mode: 'insensitive' } } },
        { festival: { nom: { contains: search, mode: 'insensitive' } } },
      ];
    }

    console.log('🔍 getAllReservations Filters:', filters);
    console.log('🔍 getAllReservations Where:', JSON.stringify(where, null, 2));

    const [reservations, total] = await Promise.all([
      this.prisma.reservation.findMany({
        where,
        include: {
          editeur: { select: { id: true, libelle: true } },
          festival: { select: { id: true, nom: true } },
          reservationLines: true,
        },
        skip: (page - 1) * pageSize,
        take: pageSize,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.reservation.count({ where }),
    ]);

    console.log(`✅ Found ${reservations.length} reservations (Total: ${total})`);

    // Calculer le total des tables et prix pour chaque réservation
    const reservationsWithTotals: ReservationListItem[] = await Promise.all(
      reservations.map(async (res) => {
        const calculation = await this.calculatePrice(res.id);
        return {
          id: res.id,
          editeurId: res.editeurId,
          festivalId: res.festivalId,
          workflowStatus: res.workflowStatus,
          typeReservant: res.typeReservant,
          editeur: res.editeur,
          festival: res.festival,
          totalTables: calculation.totalTables,
          totalPrice: calculation.totalGeneral,
          createdAt: res.createdAt,
        };
      })
    );

    const totalPages = Math.ceil(total / pageSize);

    return {
      success: true as const,
      data: reservationsWithTotals,
      total,
      currentPage: page,
      totalPages,
    };
  }

  /**
   * Récupérer une réservation par ID avec toutes les relations
   */
  async getReservationById(id: number): Promise<ReservationDetail> {
    const reservation = await this.prisma.reservation.findUnique({
      where: { id },
      include: {
        editeur: {
          select: { id: true, libelle: true, email: true, phone: true },
        },
        festival: {
          select: { id: true, nom: true, dateDebut: true, dateFin: true },
        },
        reservationLines: {
          include: {
            zoneTarifaire: {
              select: { id: true, nom: true, prixTable: true, prixM2: true },
            },
          },
        },
        reservationContacts: {
          orderBy: { dateContact: 'desc' },
        },
        reservationJeux: {
          include: {
            jeu: {
              select: { id: true, libelle: true },
            },
            editeurJeu: {
              select: { id: true, libelle: true },
            },
            zonePlan: {
              select: { id: true, nom: true },
            },
          },
        },
      },
    });

    if (!reservation) {
      throw new NotFoundError(`Réservation avec l'ID ${id} non trouvée`);
    }

    return reservation as any;
  }

  /**
   * Créer une nouvelle réservation
   */
  async createReservation(data: CreateReservationRequest) {
    // Vérifier que l'éditeur existe
    const editeur = await this.prisma.editeur.findUnique({
      where: { id: data.editeurId },
    });
    if (!editeur) {
      throw new NotFoundError(`Éditeur avec l'ID ${data.editeurId} non trouvé`);
    }

    // Vérifier que le festival existe
    const festival = await this.prisma.festival.findUnique({
      where: { id: data.festivalId },
    });
    if (!festival) {
      throw new NotFoundError(`Festival avec l'ID ${data.festivalId} non trouvé`);
    }

    // Vérifier qu'il n'existe pas déjà une réservation pour ce couple
    const existing = await this.prisma.reservation.findUnique({
      where: {
        editeurId_festivalId: {
          editeurId: data.editeurId,
          festivalId: data.festivalId,
        },
      },
    });
    if (existing) {
      throw new ConflictError(
        `Une réservation existe déjà pour cet éditeur et ce festival`
      );
    }

    const reservation = await this.prisma.reservation.create({
      data: {
        editeurId: data.editeurId,
        festivalId: data.festivalId,
        typeReservant: data.typeReservant || TypeReservant.EDITEUR,
        notesClient: data.notesClient,
      },
      include: {
        editeur: { select: { id: true, libelle: true, email: true, phone: true } },
        festival: { select: { id: true, nom: true, dateDebut: true, dateFin: true } },
      },
    });

    return {
      success: true as const,
      reservation: reservation as any,
      message: 'Réservation créée avec succès',
    };
  }

  /**
   * Mettre à jour une réservation
   */
  async updateReservation(id: number, data: UpdateReservationRequest) {
    // Vérifier que la réservation existe
    const existing = await this.prisma.reservation.findUnique({ where: { id } });
    if (!existing) {
      throw new NotFoundError(`Réservation avec l'ID ${id} non trouvée`);
    }

    // Vérifier que la date du festival n'est pas passée (veille)
    const festival = await this.prisma.festival.findUnique({
      where: { id: existing.festivalId },
    });
    if (festival) {
      const veilleFestival = new Date(festival.dateDebut);
      veilleFestival.setDate(veilleFestival.getDate() - 1);
      if (new Date() > veilleFestival) {
        throw new BadRequestError(
          'Impossible de modifier une réservation après la veille du festival'
        );
      }
    }

    const reservation = await this.prisma.reservation.update({
      where: { id },
      data,
      include: {
        editeur: { select: { id: true, libelle: true, email: true, phone: true } },
        festival: { select: { id: true, nom: true, dateDebut: true, dateFin: true } },
      },
    });

    return {
      success: true as const,
      reservation: reservation as any,
      message: 'Réservation mise à jour avec succès',
    };
  }

  /**
   * Supprimer une réservation (CASCADE)
   */
  async deleteReservation(id: number) {
    const existing = await this.prisma.reservation.findUnique({ where: { id } });
    if (!existing) {
      throw new NotFoundError(`Réservation avec l'ID ${id} non trouvée`);
    }

    await this.prisma.reservation.delete({ where: { id } });

    return {
      success: true as const,
      message: 'Réservation supprimée avec succès',
    };
  }

  // ============================================
  // GESTION DES LIGNES DE RÉSERVATION
  // ============================================

  /**
   * Ajouter une ligne de réservation (zone tarifaire)
   */
  async addReservationLine(reservationId: number, data: AddReservationLineRequest) {
    // Vérifier que la réservation existe
    const reservation = await this.prisma.reservation.findUnique({
      where: { id: reservationId },
    });
    if (!reservation) {
      throw new NotFoundError(`Réservation avec l'ID ${reservationId} non trouvée`);
    }

    // Vérifier que la zone tarifaire existe et appartient au même festival
    const zoneTarifaire = await this.prisma.zoneTarifaire.findUnique({
      where: { id: data.zoneTarifaireId },
    });
    if (!zoneTarifaire) {
      throw new NotFoundError(
        `Zone tarifaire avec l'ID ${data.zoneTarifaireId} non trouvée`
      );
    }
    if (zoneTarifaire.festivalId !== reservation.festivalId) {
      throw new BadRequestError(
        'La zone tarifaire ne correspond pas au festival de la réservation'
      );
    }

    // Vérifier le stock de tables disponibles
    await this.checkStockAvailable(
      reservation.festivalId,
      data.zoneTarifaireId,
      data.nbTables
    );

    // Calculer nbM2 si non fourni
    const nbM2 = data.nbM2 || data.nbTables * RATIO_M2_PAR_TABLE;

    // Calculer le sous-total
    const sousTotal = data.nbTables * zoneTarifaire.prixTable;

    const line = await this.prisma.reservationLine.create({
      data: {
        reservationId,
        zoneTarifaireId: data.zoneTarifaireId,
        nbTables: data.nbTables,
        nbM2,
        grandesTablesSouhaitees: data.grandesTablesSouhaitees || false,
        sousTotal,
      },
    });

    return {
      success: true as const,
      line,
      message: 'Ligne de réservation ajoutée avec succès',
    };
  }

  /**
   * Mettre à jour une ligne de réservation
   */
  async updateReservationLine(lineId: number, data: UpdateReservationLineRequest) {
    const existing = await this.prisma.reservationLine.findUnique({
      where: { id: lineId },
      include: { zoneTarifaire: true, reservation: true },
    });
    if (!existing) {
      throw new NotFoundError(`Ligne de réservation avec l'ID ${lineId} non trouvée`);
    }

    // Si on change le nombre de tables, vérifier le stock
    if (data.nbTables && data.nbTables !== existing.nbTables) {
      const diff = data.nbTables - existing.nbTables;
      if (diff > 0) {
        await this.checkStockAvailable(
          existing.reservation.festivalId,
          existing.zoneTarifaireId,
          diff
        );
      }
    }

    // Recalculer nbM2 et sous-total
    const nbTables = data.nbTables || existing.nbTables;
    const nbM2 = data.nbM2 || nbTables * RATIO_M2_PAR_TABLE;
    const sousTotal = nbTables * existing.zoneTarifaire.prixTable;

    const line = await this.prisma.reservationLine.update({
      where: { id: lineId },
      data: {
        ...data,
        nbM2,
        sousTotal,
      },
    });

    return {
      success: true as const,
      line,
      message: 'Ligne de réservation mise à jour avec succès',
    };
  }

  /**
   * Supprimer une ligne de réservation
   */
  async deleteReservationLine(lineId: number) {
    const existing = await this.prisma.reservationLine.findUnique({
      where: { id: lineId },
    });
    if (!existing) {
      throw new NotFoundError(`Ligne de réservation avec l'ID ${lineId} non trouvée`);
    }

    await this.prisma.reservationLine.delete({ where: { id: lineId } });

    return {
      success: true as const,
      message: 'Ligne de réservation supprimée avec succès',
    };
  }

  // ============================================
  // GESTION DES CONTACTS
  // ============================================

  /**
   * Ajouter un contact/relance
   */
  async addReservationContact(reservationId: number, data: AddReservationContactRequest) {
    const reservation = await this.prisma.reservation.findUnique({
      where: { id: reservationId },
    });
    if (!reservation) {
      throw new NotFoundError(`Réservation avec l'ID ${reservationId} non trouvée`);
    }

    const contact = await this.prisma.reservationContact.create({
      data: {
        reservationId,
        dateContact: new Date(data.dateContact),
        commentaire: data.commentaire,
      },
    });

    return {
      success: true as const,
      contact,
      message: 'Contact ajouté avec succès',
    };
  }

  /**
   * Supprimer un contact
   */
  async deleteReservationContact(contactId: number) {
    const existing = await this.prisma.reservationContact.findUnique({
      where: { id: contactId },
    });
    if (!existing) {
      throw new NotFoundError(`Contact avec l'ID ${contactId} non trouvé`);
    }

    await this.prisma.reservationContact.delete({ where: { id: contactId } });

    return {
      success: true as const,
      message: 'Contact supprimé avec succès',
    };
  }

  // ============================================
  // GESTION DES JEUX
  // ============================================

  /**
   * Ajouter un jeu à la réservation
   */
  async addReservationJeu(reservationId: number, data: AddReservationJeuRequest) {
    const reservation = await this.prisma.reservation.findUnique({
      where: { id: reservationId },
      include: { reservationLines: true, reservationJeux: true },
    });
    if (!reservation) {
      throw new NotFoundError(`Réservation avec l'ID ${reservationId} non trouvée`);
    }

    // Vérifier que le jeu existe
    const jeu = await this.prisma.jeu.findUnique({ where: { id: data.jeuId } });
    if (!jeu) {
      throw new NotFoundError(`Jeu avec l'ID ${data.jeuId} non trouvé`);
    }

    // Validation: jamais 1 jeu sur 2 tables
    if (data.nbTablesAllouees === 2 && data.nbExemplaires === 1) {
      throw new BadRequestError('Impossible d\'allouer 2 tables pour 1 seul exemplaire de jeu');
    }

    // Validation: max 2 jeux par table
    const totalTablesReservees = reservation.reservationLines.reduce(
      (sum, line) => sum + line.nbTables,
      0
    );
    const totalTablesAllouees = reservation.reservationJeux.reduce(
      (sum, jeu) => sum + jeu.nbTablesAllouees,
      0
    );
    // Seulement vérifier si des tables ont été réservées
    if (totalTablesReservees > 0 && totalTablesAllouees + data.nbTablesAllouees > totalTablesReservees) {
      throw new BadRequestError(
        `Dépassement du nombre de tables réservées (${totalTablesReservees})`
      );
    }

    // Si une zone du plan est spécifiée, vérifier qu'elle correspond à une zone tarifaire réservée
    if (data.zonePlanId) {
      const zonePlan = await this.prisma.zonePlan.findUnique({
        where: { id: data.zonePlanId },
      });
      if (!zonePlan) {
        throw new NotFoundError(`Zone du plan avec l'ID ${data.zonePlanId} non trouvée`);
      }

      // Seulement vérifier si des lignes de réservation existent
      if (reservation.reservationLines.length > 0) {
        const hasZoneTarifaire = reservation.reservationLines.some(
          (line) => line.zoneTarifaireId === zonePlan.zoneTarifaireId
        );
        if (!hasZoneTarifaire) {
          throw new BadRequestError(
            'La zone du plan doit correspondre à une zone tarifaire réservée'
          );
        }
      }
    }

    const reservationJeu = await this.prisma.reservationJeu.create({
      data: {
        reservationId,
        jeuId: data.jeuId,
        editeurJeuId: data.editeurJeuId,
        zonePlanId: data.zonePlanId,
        nbExemplaires: data.nbExemplaires,
        nbTablesAllouees: data.nbTablesAllouees,
      },
    });

    return {
      success: true as const,
      jeu: reservationJeu,
      message: 'Jeu ajouté avec succès',
    };
  }

  /**
   * Mettre à jour un jeu de la réservation
   */
  async updateReservationJeu(jeuId: number, data: UpdateReservationJeuRequest) {
    const existing = await this.prisma.reservationJeu.findUnique({
      where: { id: jeuId },
      include: {
        reservation: {
          include: { reservationLines: true, reservationJeux: true },
        },
      },
    });
    if (!existing) {
      throw new NotFoundError(`Jeu de réservation avec l'ID ${jeuId} non trouvé`);
    }

    // Validation: jamais 1 jeu sur 2 tables
    const nbExemplaires = data.nbExemplaires || existing.nbExemplaires;
    const nbTablesAllouees = data.nbTablesAllouees || existing.nbTablesAllouees;
    if (nbTablesAllouees === 2 && nbExemplaires === 1) {
      throw new BadRequestError('Impossible d\'allouer 2 tables pour 1 seul exemplaire de jeu');
    }

    // Validation: max tables réservées
    if (data.nbTablesAllouees) {
      const totalTablesReservees = existing.reservation.reservationLines.reduce(
        (sum, line) => sum + line.nbTables,
        0
      );
      const totalTablesAllouees = existing.reservation.reservationJeux
        .filter((j) => j.id !== jeuId)
        .reduce((sum, jeu) => sum + jeu.nbTablesAllouees, 0);

      // Seulement vérifier si des tables ont été réservées
      if (totalTablesReservees > 0 && totalTablesAllouees + data.nbTablesAllouees > totalTablesReservees) {
        throw new BadRequestError(
          `Dépassement du nombre de tables réservées (${totalTablesReservees})`
        );
      }
    }

    // Vérifier la zone du plan si changée
    if (data.zonePlanId) {
      const zonePlan = await this.prisma.zonePlan.findUnique({
        where: { id: data.zonePlanId },
      });
      if (!zonePlan) {
        throw new NotFoundError(`Zone du plan avec l'ID ${data.zonePlanId} non trouvée`);
      }

      // Seulement vérifier si des lignes de réservation existent
      if (existing.reservation.reservationLines.length > 0) {
        const hasZoneTarifaire = existing.reservation.reservationLines.some(
          (line) => line.zoneTarifaireId === zonePlan.zoneTarifaireId
        );
        if (!hasZoneTarifaire) {
          throw new BadRequestError(
            'La zone du plan doit correspondre à une zone tarifaire réservée'
          );
        }
      }
    }

    const reservationJeu = await this.prisma.reservationJeu.update({
      where: { id: jeuId },
      data,
    });

    return {
      success: true as const,
      jeu: reservationJeu,
      message: 'Jeu mis à jour avec succès',
    };
  }

  /**
   * Supprimer un jeu de la réservation
   */
  async deleteReservationJeu(jeuId: number) {
    const existing = await this.prisma.reservationJeu.findUnique({
      where: { id: jeuId },
    });
    if (!existing) {
      throw new NotFoundError(`Jeu de réservation avec l'ID ${jeuId} non trouvé`);
    }

    await this.prisma.reservationJeu.delete({ where: { id: jeuId } });

    return {
      success: true as const,
      message: 'Jeu supprimé avec succès',
    };
  }

  // ============================================
  // CALCULS ET VALIDATIONS
  // ============================================

  /**
   * Calculer le prix total d'une réservation
   */
  async calculatePrice(reservationId: number): Promise<PriceCalculationResponse> {
    const reservation = await this.prisma.reservation.findUnique({
      where: { id: reservationId },
      include: { reservationLines: true },
    });
    if (!reservation) {
      throw new NotFoundError(`Réservation avec l'ID ${reservationId} non trouvée`);
    }

    const totalTables = reservation.reservationLines.reduce(
      (sum, line) => sum + line.nbTables,
      0
    );

    const totalM2 = reservation.reservationLines.reduce(
      (sum, line) => sum + line.nbM2,
      0
    );

    const sousTotal = reservation.reservationLines.reduce(
      (sum, line) => sum + line.sousTotal,
      0
    );

    const coutPrises = reservation.nbPrisesElectriques * PRIX_PRISE_ELECTRIQUE;

    let remise = 0;
    if (reservation.typeRemise === TypeRemise.TABLES_OFFERTES) {
      // Remise en tables: calculer le prix moyen par table et multiplier
      const prixMoyenTable = totalTables > 0 ? sousTotal / totalTables : 0;
      remise = reservation.valeurRemise * prixMoyenTable;
    } else if (reservation.typeRemise === TypeRemise.SOMME_ARGENT) {
      remise = reservation.valeurRemise;
    }

    const totalGeneral = Math.max(0, sousTotal + coutPrises - remise);

    return {
      success: true,
      totalTables,
      totalM2,
      sousTotal,
      coutPrises,
      remise,
      totalGeneral,
    };
  }

  /**
   * Vérifier la disponibilité du stock de tables
   */
  async checkStockAvailable(
    festivalId: number,
    zoneTarifaireId: number,
    nbTablesRequested: number
  ): Promise<StockCheckResponse> {
    const festival = await this.prisma.festival.findUnique({
      where: { id: festivalId },
    });
    if (!festival) {
      throw new NotFoundError(`Festival avec l'ID ${festivalId} non trouvé`);
    }

    // Calculer le nombre de tables déjà réservées pour cette zone tarifaire
    const reservations = await this.prisma.reservationLine.findMany({
      where: {
        zoneTarifaireId,
        reservation: { festivalId },
      },
    });

    const tablesReservees = reservations.reduce((sum, line) => sum + line.nbTables, 0);
    const stockDisponible = festival.nbTotalTable - tablesReservees;

    const available = stockDisponible >= nbTablesRequested;

    if (!available) {
      throw new BadRequestError(
        `Stock insuffisant. Disponible: ${stockDisponible}, Demandé: ${nbTablesRequested}`
      );
    }

    return {
      success: true,
      available,
      currentStock: stockDisponible,
      requested: nbTablesRequested,
      remaining: stockDisponible - nbTablesRequested,
    };
  }

  /**
   * Auto-sauvegarde (brouillon)
   */
  async autoSave(id: number, data: Partial<UpdateReservationRequest>) {
    const existing = await this.prisma.reservation.findUnique({ where: { id } });
    if (!existing) {
      throw new NotFoundError(`Réservation avec l'ID ${id} non trouvée`);
    }

    await this.prisma.reservation.update({
      where: { id },
      data,
    });

    return {
      success: true as const,
      message: 'Auto-sauvegarde réussie',
      timestamp: new Date(),
    };
  }
}
