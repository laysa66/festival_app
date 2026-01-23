import { PrismaClient } from '@prisma/client';
import { AppError } from '../utils/errors/custom-errors';

class FestivalService {
  constructor(private prisma: PrismaClient) {}

  async getAllFestivals() {
    try {
      const festivals = await this.prisma.festival.findMany({
        include: {
          zoneTarifaires: true,
          zonePlans: {
            include: {
              zoneTarifaire: true,
            },
          },
        },
      });
      return festivals;
    } catch (error) {
      throw new AppError(500, 'Failed to fetch festivals');
    }
  }

  async getFestivalById(id: number) {
    try {
      const festival = await this.prisma.festival.findUnique({
        where: { id },
        include: {
          zoneTarifaires: true,
          zonePlans: {
            include: {
              zoneTarifaire: true,
            },
          },
        },
      });

      if (!festival) {
        throw new AppError(404, 'Festival not found');
      }

      return festival;
    } catch (error) {
      if (error instanceof AppError) throw error;
      throw new AppError(500, 'Failed to fetch festival');
    }
  }

  async createFestival(data: {
    nom: string;
    lieu: string;
    dateDebut: Date | string;
    dateFin: Date | string;
    nbTotalTable: number;
    nbTotalChaise: number;
    bigTables?: number;
    bigChairs?: number;
    smallTables?: number;
    smallChairs?: number;
    mairieTables?: number;
    mairieChairs?: number;
  }) {
    try {
      // Convert date strings to Date objects if needed
      let dateDebut = data.dateDebut;
      let dateFin = data.dateFin;
      
      if (typeof dateDebut === 'string') {
        dateDebut = new Date(dateDebut);
      }
      if (typeof dateFin === 'string') {
        dateFin = new Date(dateFin);
      }

      const festival = await this.prisma.festival.create({
        data: {
          nom: data.nom,
          lieu: data.lieu,
          dateDebut,
          dateFin,
          nbTotalTable: data.nbTotalTable,
          nbTotalChaise: data.nbTotalChaise,
          bigTables: data.bigTables || 0,
          bigChairs: data.bigChairs || 0,
          smallTables: data.smallTables || 0,
          smallChairs: data.smallChairs || 0,
          mairieTables: data.mairieTables || 0,
          mairieChairs: data.mairieChairs || 0,
        },
        include: {
          zoneTarifaires: true,
          zonePlans: true,
        },
      });

      return festival;
    } catch (error) {
      if (error instanceof AppError) throw error;
      throw new AppError(500, 'Failed to create festival');
    }
  }

  async updateFestival(
    id: number,
    data: {
      nom?: string;
      lieu?: string;
      dateDebut?: Date | string;
      dateFin?: Date | string;
      nbTotalTable?: number;
      nbTotalChaise?: number;
      bigTables?: number;
      bigChairs?: number;
      smallTables?: number;
      smallChairs?: number;
      mairieTables?: number;
      mairieChairs?: number;
    }
  ) {
    try {
      const festival = await this.prisma.festival.findUnique({
        where: { id },
      });

      if (!festival) {
        throw new AppError(404, 'Festival not found');
      }

      // Convert date strings to Date objects if needed
      const updateData = { ...data };
      if (typeof updateData.dateDebut === 'string') {
        updateData.dateDebut = new Date(updateData.dateDebut);
      }
      if (typeof updateData.dateFin === 'string') {
        updateData.dateFin = new Date(updateData.dateFin);
      }

      const updatedFestival = await this.prisma.festival.update({
        where: { id },
        data: updateData,
        include: {
          zoneTarifaires: true,
          zonePlans: true,
        },
      });

      return updatedFestival;
    } catch (error) {
      if (error instanceof AppError) throw error;
      throw new AppError(500, 'Failed to update festival');
    }
  }

  async deleteFestival(id: number) {
    try {
      const festival = await this.prisma.festival.findUnique({
        where: { id },
      });

      if (!festival) {
        throw new AppError(404, 'Festival not found');
      }

      const deletedFestival = await this.prisma.festival.delete({
        where: { id },
      });

      return deletedFestival;
    } catch (error) {
      if (error instanceof AppError) throw error;
      throw new AppError(500, 'Failed to delete festival');
    }
  }

  // Zone Tarifaire Management
  async addZoneTarifaire(festivalId: number, data: {
    nom: string;
    prixTable: number;
    prixM2: number;
  }) {
    try {
      const festival = await this.prisma.festival.findUnique({
        where: { id: festivalId },
      });

      if (!festival) {
        throw new AppError(404, 'Festival not found');
      }

      const zoneTarifaire = await this.prisma.zoneTarifaire.create({
        data: {
          nom: data.nom,
          prixTable: data.prixTable,
          prixM2: data.prixM2,
          festivalId,
        },
      });

      return zoneTarifaire;
    } catch (error) {
      if (error instanceof AppError) throw error;
      throw new AppError(500, 'Failed to add zone tarifaire');
    }
  }

  async updateZoneTarifaire(zoneId: number, data: {
    nom?: string;
    prixTable?: number;
    prixM2?: number;
  }) {
    try {
      const zone = await this.prisma.zoneTarifaire.findUnique({
        where: { id: zoneId },
      });

      if (!zone) {
        throw new AppError(404, 'Zone tarifaire not found');
      }

      const updatedZone = await this.prisma.zoneTarifaire.update({
        where: { id: zoneId },
        data,
      });

      return updatedZone;
    } catch (error) {
      if (error instanceof AppError) throw error;
      throw new AppError(500, 'Failed to update zone tarifaire');
    }
  }

  async deleteZoneTarifaire(zoneId: number) {
    try {
      const zone = await this.prisma.zoneTarifaire.findUnique({
        where: { id: zoneId },
      });

      if (!zone) {
        throw new AppError(404, 'Zone tarifaire not found');
      }

      const deletedZone = await this.prisma.zoneTarifaire.delete({
        where: { id: zoneId },
      });

      return deletedZone;
    } catch (error) {
      if (error instanceof AppError) throw error;
      throw new AppError(500, 'Failed to delete zone tarifaire');
    }
  }

  // Zone Plan Management
  async addZonePlan(festivalId: number, data: {
    nom: string;
    zoneTarifaireId: number;
  }) {
    try {
      const festival = await this.prisma.festival.findUnique({
        where: { id: festivalId },
      });

      if (!festival) {
        throw new AppError(404, 'Festival not found');
      }

      const zoneTarifaire = await this.prisma.zoneTarifaire.findUnique({
        where: { id: data.zoneTarifaireId },
      });

      if (!zoneTarifaire) {
        throw new AppError(404, 'Zone tarifaire not found');
      }

      const zonePlan = await this.prisma.zonePlan.create({
        data: {
          nom: data.nom,
          zoneTarifaireId: data.zoneTarifaireId,
          festivalId,
        },
      });

      return zonePlan;
    } catch (error) {
      if (error instanceof AppError) throw error;
      throw new AppError(500, 'Failed to add zone plan');
    }
  }

  async updateZonePlan(zonePlanId: number, data: {
    nom?: string;
    zoneTarifaireId?: number;
  }) {
    try {
      const zonePlan = await this.prisma.zonePlan.findUnique({
        where: { id: zonePlanId },
      });

      if (!zonePlan) {
        throw new AppError(404, 'Zone plan not found');
      }

      if (data.zoneTarifaireId) {
        const zoneTarifaire = await this.prisma.zoneTarifaire.findUnique({
          where: { id: data.zoneTarifaireId },
        });

        if (!zoneTarifaire) {
          throw new AppError(404, 'Zone tarifaire not found');
        }
      }

      const updatedZonePlan = await this.prisma.zonePlan.update({
        where: { id: zonePlanId },
        data,
      });

      return updatedZonePlan;
    } catch (error) {
      if (error instanceof AppError) throw error;
      throw new AppError(500, 'Failed to update zone plan');
    }
  }

  async deleteZonePlan(zonePlanId: number) {
    try {
      const zonePlan = await this.prisma.zonePlan.findUnique({
        where: { id: zonePlanId },
      });

      if (!zonePlan) {
        throw new AppError(404, 'Zone plan not found');
      }

      const deletedZonePlan = await this.prisma.zonePlan.delete({
        where: { id: zonePlanId },
      });

      return deletedZonePlan;
    } catch (error) {
      if (error instanceof AppError) throw error;
      throw new AppError(500, 'Failed to delete zone plan');
    }
  }

  async getAllGames() {
    try {
      const games = await this.prisma.jeu.findMany({
        include: {
          editeur: true,
          typeJeu: true,
        },
      });
      return games;
    } catch (error) {
      throw new AppError(500, 'Failed to fetch games');
    }
  }

  async getGamesByEditeur(editeurId: number) {
    try {
      const games = await this.prisma.jeu.findMany({
        where: { idEditeur: editeurId },
        include: {
          editeur: true,
          typeJeu: true,
        },
      });
      return games;
    } catch (error) {
      throw new AppError(500, 'Failed to fetch games by editeur');
    }
  }

  async getFilteredGames(filters: {
    typeJeuId?: number;
    minDuration?: number;
    maxDuration?: number;
    minPlayers?: number;
    maxPlayers?: number;
  }) {
    try {
      const where: any = {};

      if (filters.typeJeuId) {
        where.idTypeJeu = filters.typeJeuId;
      }

      if (filters.minDuration !== undefined || filters.maxDuration !== undefined) {
        where.duree = {};
        if (filters.minDuration !== undefined) {
          where.duree.gte = filters.minDuration;
        }
        if (filters.maxDuration !== undefined) {
          where.duree.lte = filters.maxDuration;
        }
      }

      if (filters.minPlayers !== undefined) {
        where.nbMinJoueur = { gte: filters.minPlayers };
      }

      if (filters.maxPlayers !== undefined) {
        if (!where.nbMaxJoueur) {
          where.nbMaxJoueur = {};
        }
        where.nbMaxJoueur = filters.maxPlayers;
      }

      const games = await this.prisma.jeu.findMany({
        where,
        include: {
          editeur: true,
          typeJeu: true,
        },
      });
      return games;
    } catch (error) {
      throw new AppError(500, 'Failed to fetch filtered games');
    }
  }

  async createGame(data: {
    libelle: string;
    auteur?: string;
    nbMinJoueur?: number;
    nbMaxJoueur?: number;
    duree?: number;
    image?: string;
    idEditeur?: number;
    idTypeJeu?: number;
    ageMin?: number;
    theme?: string;
    description?: string;
  }) {
    try {
      const game = await this.prisma.jeu.create({
        data: {
          libelle: data.libelle,
          auteur: data.auteur || null,
          nbMinJoueur: data.nbMinJoueur || null,
          nbMaxJoueur: data.nbMaxJoueur || null,
          duree: data.duree || null,
          image: data.image || null,
          idEditeur: data.idEditeur || null,
          idTypeJeu: data.idTypeJeu || null,
          ageMin: data.ageMin || null,
          theme: data.theme || null,
          description: data.description || null,
        },
        include: {
          editeur: true,
          typeJeu: true,
        },
      });
      return game;
    } catch (error) {
      throw new AppError(500, 'Failed to create game');
    }
  }

  async updateGame(id: number, data: {
    libelle?: string;
    auteur?: string;
    nbMinJoueur?: number;
    nbMaxJoueur?: number;
    duree?: number;
    image?: string;
    idEditeur?: number;
    idTypeJeu?: number;
    ageMin?: number;
    theme?: string;
    description?: string;
  }) {
    try {
      const game = await this.prisma.jeu.update({
        where: { id },
        data,
        include: {
          editeur: true,
          typeJeu: true,
        },
      });
      return game;
    } catch (error) {
      if ((error as any).code === 'P2025') {
        throw new AppError(404, 'Game not found');
      }
      throw new AppError(500, 'Failed to update game');
    }
  }

  async deleteGame(id: number) {
    try {
      await this.prisma.jeu.delete({
        where: { id },
      });
    } catch (error) {
      if ((error as any).code === 'P2025') {
        throw new AppError(404, 'Game not found');
      }
      throw new AppError(500, 'Failed to delete game');
    }
  }

  async getGamesByZonePlan(zonePlanId: number) {
    try {
      const games = await this.prisma.reservationJeu.findMany({
        where: { zonePlanId },
        include: {
          jeu: {
            include: {
              editeur: true,
              typeJeu: true,
            },
          },
        },
      });
      // Map to return just the game data
      return games.map(rj => rj.jeu);
    } catch (error) {
      throw new AppError(500, 'Failed to fetch games by zone plan');
    }
  }

  async getGamesByZoneTarifaire(zoneTarifaireId: number) {
    try {
      const games = await this.prisma.reservationJeu.findMany({
        where: {
          zonePlan: {
            zoneTarifaireId,
          },
        },
        include: {
          jeu: {
            include: {
              editeur: true,
              typeJeu: true,
            },
          },
        },
      });
      // Map to return just the game data, remove duplicates
      const uniqueGames = new Map();
      games.forEach(rj => {
        if (rj.jeu && !uniqueGames.has(rj.jeu.id)) {
          uniqueGames.set(rj.jeu.id, rj.jeu);
        }
      });
      return Array.from(uniqueGames.values());
    } catch (error) {
      throw new AppError(500, 'Failed to fetch games by zone tarifaire');
    }
  }
}

export default FestivalService;

