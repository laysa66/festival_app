import { FastifyInstance } from 'fastify';
import { UserListItem, UpdateUserRequest, UsersListResponse, UpdateUserResponse } from '../models/user.models';
import { NotFoundError } from '../utils/errors/custom-errors';

export class UsersService {
  constructor(private server: FastifyInstance) {}

  async listUsers(): Promise<UsersListResponse> {
    const users = await this.server.prisma.user.findMany({
      include: {
        role: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    const usersList: UserListItem[] = users.map(user => ({
      id: user.id,
      email: user.email,
      nom: user.nom,
      prenom: user.prenom,
      role: user.role.type,
      valide: user.valide,
      createdAt: user.createdAt.toISOString(),
    }));

    return {
      success: true,
      users: usersList,
      total: users.length,
    };
  }

  async updateUser(userId: number, data: UpdateUserRequest): Promise<UpdateUserResponse> {
    // Vérifier que l'utilisateur existe
    const user = await this.server.prisma.user.findUnique({
      where: { id: userId },
      include: { role: true },
    });

    if (!user) {
      throw new NotFoundError('Utilisateur non trouvé');
    }

    // Mettre à jour l'utilisateur
    const updatedUser = await this.server.prisma.user.update({
      where: { id: userId },
      data: {
        ...(data.valide !== undefined && { valide: data.valide }),
        ...(data.roleId !== undefined && { roleId: data.roleId }),
      },
      include: {
        role: true,
      },
    });

    return {
      success: true,
      message: 'Utilisateur mis à jour avec succès',
      user: {
        id: updatedUser.id,
        email: updatedUser.email,
        nom: updatedUser.nom,
        prenom: updatedUser.prenom,
        role: updatedUser.role.type,
        valide: updatedUser.valide,
        createdAt: updatedUser.createdAt.toISOString(),
      },
    };
  }
}
