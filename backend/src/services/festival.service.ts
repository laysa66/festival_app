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
      throw new AppError('Failed to fetch festivals', 500);
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
        throw new AppError('Festival not found', 404);
      }

      return festival;
    } catch (error) {
      if (error instanceof AppError) throw error;
      throw new AppError('Failed to fetch festival', 500);
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
      throw new AppError('Failed to create festival', 500);
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
        throw new AppError('Festival not found', 404);
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
      throw new AppError('Failed to update festival', 500);
    }
  }

  async deleteFestival(id: number) {
    try {
      const festival = await this.prisma.festival.findUnique({
        where: { id },
      });

      if (!festival) {
        throw new AppError('Festival not found', 404);
      }

      const deletedFestival = await this.prisma.festival.delete({
        where: { id },
      });

      return deletedFestival;
    } catch (error) {
      if (error instanceof AppError) throw error;
      throw new AppError('Failed to delete festival', 500);
    }
  }
}

export default FestivalService;
