import { PrismaClient } from '@prisma/client';
import { AppError } from '../utils/errors/custom-errors';

class FestivalService {
  constructor(private prisma: PrismaClient) {}

  async getAllFestivals() {
    try {
      const festivals = await this.prisma.festival.findMany({
        include: {
          zoneTarifaires: true,
          zonePlans: true,
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
          zonePlans: true,
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
}

export default FestivalService;
