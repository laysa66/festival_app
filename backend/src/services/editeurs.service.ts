import { PrismaClient } from '@prisma/client';
import { NotFoundError } from '../utils/errors/custom-errors';

export interface EditeurListItem {
  id: number;
  libelle: string;
  exposant: boolean;
  distributeur: boolean;
  logo: string | null;
  phone: string | null;
  email: string | null;
  notes: string | null;
}

export interface EditeurDetail extends EditeurListItem {}

export interface EditeurUpdateRequest {
  phone?: string;
  email?: string;
  notes?: string;
}

export interface EditeurCreateRequest {
  libelle: string;
  exposant?: boolean;
  distributeur?: boolean;
  phone?: string;
  email?: string;
  notes?: string;
}

export class EditeursService {
  prisma: PrismaClient;

  constructor(prisma: PrismaClient) {
    this.prisma = prisma;
  }

  async getAllEditeurs(): Promise<{ success: true; editeurs: EditeurListItem[]; total: number }> {
    const editeurs = await this.prisma.editeur.findMany({
      select: {
        id: true,
        libelle: true,
        exposant: true,
        distributeur: true,
        logo: true,
        phone: true,
        email: true,
        notes: true,
      },
      orderBy: {
        libelle: 'asc',
      },
    });

    return {
      success: true,
      editeurs,
      total: editeurs.length,
    };
  }

  async getEditeurById(id: number): Promise<{ success: true; editeur: EditeurListItem }> {
    const editeur = await this.prisma.editeur.findUnique({
      where: { id },
      select: {
        id: true,
        libelle: true,
        exposant: true,
        distributeur: true,
        logo: true,
        phone: true,
        email: true,
        notes: true,
      },
    });

    if (!editeur) {
      throw new NotFoundError(`Éditeur avec l'ID ${id} non trouvé`);
    }

    return {
      success: true,
      editeur,
    };
  }

  async updateEditeur(
    id: number,
    data: EditeurUpdateRequest
  ): Promise<{ success: true; message: string; editeur: EditeurListItem }> {
    // Vérifier que l'éditeur existe
    const editeur = await this.prisma.editeur.findUnique({
      where: { id },
    });

    if (!editeur) {
      throw new NotFoundError(`Éditeur avec l'ID ${id} non trouvé`);
    }

    // Mettre à jour l'éditeur
    const updatedEditeur = await this.prisma.editeur.update({
      where: { id },
      data: {
        ...(data.phone !== undefined && { phone: data.phone }),
        ...(data.email !== undefined && { email: data.email }),
        ...(data.notes !== undefined && { notes: data.notes }),
      },
      select: {
        id: true,
        libelle: true,
        exposant: true,
        distributeur: true,
        logo: true,
        phone: true,
        email: true,
        notes: true,
      },
    });

    return {
      success: true,
      message: 'Éditeur mis à jour avec succès',
      editeur: updatedEditeur,
    };
  }

  async deleteEditeur(id: number): Promise<{ success: true; message: string }> {
    // Vérifier que l'éditeur existe
    const editeur = await this.prisma.editeur.findUnique({
      where: { id },
    });

    if (!editeur) {
      throw new NotFoundError(`Éditeur avec l'ID ${id} non trouvé`);
    }

    // Supprimer l'éditeur
    await this.prisma.editeur.delete({
      where: { id },
    });

    return {
      success: true,
      message: 'Éditeur supprimé avec succès',
    };
  }

  async createEditeur(
    data: EditeurCreateRequest
  ): Promise<{ success: true; message: string; editeur: EditeurListItem }> {
    // Créer un nouvel éditeur
    const newEditeur = await this.prisma.editeur.create({
      data: {
        libelle: data.libelle,
        exposant: data.exposant || false,
        distributeur: data.distributeur || false,
        phone: data.phone,
        email: data.email,
        notes: data.notes,
      },
      select: {
        id: true,
        libelle: true,
        exposant: true,
        distributeur: true,
        logo: true,
        phone: true,
        email: true,
        notes: true,
      },
    });

    return {
      success: true,
      message: 'Éditeur créé avec succès',
      editeur: newEditeur,
    };
  }
}
