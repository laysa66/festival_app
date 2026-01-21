import { FastifyRequest, FastifyReply } from 'fastify';
import { UnauthorizedError, ForbiddenError } from '../utils/errors/custom-errors';
import { authMiddleware } from './auth.middleware';

// Rôles autorisés pour accéder aux réservations
const ALLOWED_ROLES_RESERVATION = ['ORGANISATEUR', 'SUPER_ORGANISATEUR', 'ADMIN'];
const SUPER_ROLES = ['SUPER_ORGANISATEUR', 'ADMIN'];

/**
 * Middleware pour vérifier que l'utilisateur a un des rôles autorisés
 */
export const requireReservationAccess = async (
  request: FastifyRequest,
  reply: FastifyReply
) => {
  try {
    // Vérifier que l'utilisateur est authentifié avec le cookie
    await authMiddleware(request, reply);
    
    const user = request.user as any;
    
    if (!user || !user.role) {
      throw new UnauthorizedError('Utilisateur non authentifié');
    }
    
    // Vérifier que l'utilisateur a un rôle autorisé
    if (!ALLOWED_ROLES_RESERVATION.includes(user.role)) {
      throw new ForbiddenError(
        'Accès refusé. Seuls les organisateurs peuvent accéder aux réservations.'
      );
    }
  } catch (error) {
    if (error instanceof UnauthorizedError || error instanceof ForbiddenError) {
      throw error;
    }
    throw new UnauthorizedError('Token invalide ou expiré');
  }
};

/**
 * Middleware pour vérifier que l'utilisateur a les droits de SUPER_ORGANISATEUR ou ADMIN
 * (pour les opérations sensibles comme la suppression)
 */
export const requireSuperOrganizerAccess = async (
  request: FastifyRequest,
  reply: FastifyReply
) => {
  try {
    await authMiddleware(request, reply);
    
    const user = request.user as any;
    
    if (!user || !user.role) {
      throw new UnauthorizedError('Utilisateur non authentifié');
    }
    
    if (!SUPER_ROLES.includes(user.role)) {
      throw new ForbiddenError(
        'Accès refusé. Cette opération nécessite les droits de SUPER_ORGANISATEUR ou ADMIN.'
      );
    }
  } catch (error) {
    if (error instanceof UnauthorizedError || error instanceof ForbiddenError) {
      throw error;
    }
    throw new UnauthorizedError('Token invalide ou expiré');
  }
};

/**
 * Middleware pour vérifier un rôle spécifique
 */
export const requireRole = (allowedRoles: string[]) => {
  return async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      await authMiddleware(request, reply);
      
      const user = request.user as any;
      
      if (!user || !user.role) {
        throw new UnauthorizedError('Utilisateur non authentifié');
      }
      
      if (!allowedRoles.includes(user.role)) {
        throw new ForbiddenError(
          `Accès refusé. Rôles autorisés: ${allowedRoles.join(', ')}`
        );
      }
    } catch (error) {
      if (error instanceof UnauthorizedError || error instanceof ForbiddenError) {
        throw error;
      }
      throw new UnauthorizedError('Token invalide ou expiré');
    }
  };
};
