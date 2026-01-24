import { PrismaClient } from '@prisma/client';
import { NotFoundError } from '../utils/errors/custom-errors';

export interface JeuListItem {
  id: number;
  libelle: string;
  auteur: string | null;
  nbMinJoueur: number | null;
  nbMaxJoueur: number | null;
  ageMin: number | null;
  duree: number | null;
  prototype: boolean;
  editeur: { id: number; libelle: string } | null;
  typeJeu: { id: number; libelle: string } | null;
}

export interface JeuCreateRequest {
  libelle: string;
  auteur?: string;
  nbMinJoueur?: number;
  nbMaxJoueur?: number;
  ageMin?: number;
  duree?: number;
  prototype?: boolean;
  idEditeur?: number;
  idTypeJeu?: number;
  theme?: string;
  description?: string;
}

export interface JeuSearchParams {
  search?: string;
  limit?: number;
  offset?: number;
}

export class JeuService {
  prisma: PrismaClient;

  constructor(prisma: PrismaClient) {
    this.prisma = prisma;
  }

  /**
   * Recherche de jeux avec filtre optionnel
   */
  async searchJeux(params: JeuSearchParams): Promise<{ success: true; jeux: JeuListItem[]; total: number }> {
    const { search, limit = 50, offset = 0 } = params;

    const whereClause = search
      ? {
          OR: [
            { libelle: { contains: search, mode: 'insensitive' as const } },
            { auteur: { contains: search, mode: 'insensitive' as const } },
          ],
        }
      : {};

    const [jeux, total] = await Promise.all([
      this.prisma.jeu.findMany({
        where: whereClause,
        select: {
          id: true,
          libelle: true,
          auteur: true,
          nbMinJoueur: true,
          nbMaxJoueur: true,
          ageMin: true,
          duree: true,
          prototype: true,
          editeur: {
            select: {
              id: true,
              libelle: true,
            },
          },
          typeJeu: {
            select: {
              id: true,
              libelle: true,
            },
          },
        },
        orderBy: { libelle: 'asc' },
        take: limit,
        skip: offset,
      }),
      this.prisma.jeu.count({ where: whereClause }),
    ]);

    return {
      success: true,
      jeux,
      total,
    };
  }

  /**
   * Récupérer un jeu par ID
   */
  async getJeuById(id: number): Promise<{ success: true; jeu: JeuListItem }> {
    const jeu = await this.prisma.jeu.findUnique({
      where: { id },
      select: {
        id: true,
        libelle: true,
        auteur: true,
        nbMinJoueur: true,
        nbMaxJoueur: true,
        ageMin: true,
        duree: true,
        prototype: true,
        editeur: {
          select: {
            id: true,
            libelle: true,
          },
        },
        typeJeu: {
          select: {
            id: true,
            libelle: true,
          },
        },
      },
    });

    if (!jeu) {
      throw new NotFoundError(`Jeu avec l'ID ${id} non trouvé`);
    }

    return {
      success: true,
      jeu,
    };
  }

  /**
   * Créer un nouveau jeu
   */
  async createJeu(data: JeuCreateRequest): Promise<{ success: true; message: string; jeu: JeuListItem }> {
    const newJeu = await this.prisma.jeu.create({
      data: {
        libelle: data.libelle,
        auteur: data.auteur,
        nbMinJoueur: data.nbMinJoueur,
        nbMaxJoueur: data.nbMaxJoueur,
        ageMin: data.ageMin,
        duree: data.duree,
        prototype: data.prototype ?? false,
        idEditeur: data.idEditeur,
        idTypeJeu: data.idTypeJeu,
        theme: data.theme,
        description: data.description,
      },
      select: {
        id: true,
        libelle: true,
        auteur: true,
        nbMinJoueur: true,
        nbMaxJoueur: true,
        ageMin: true,
        duree: true,
        prototype: true,
        editeur: {
          select: {
            id: true,
            libelle: true,
          },
        },
        typeJeu: {
          select: {
            id: true,
            libelle: true,
          },
        },
      },
    });

    return {
      success: true,
      message: 'Jeu créé avec succès',
      jeu: newJeu,
    };
  }
}
