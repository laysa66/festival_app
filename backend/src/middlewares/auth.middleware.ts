import { FastifyRequest, FastifyReply } from 'fastify';
import { UnauthorizedError } from '../utils/errors/custom-errors';

export interface JwtPayload {
  userId: number;
  email: string;
  role: string;
}

declare module 'fastify' {
  interface FastifyRequest {
    user?: JwtPayload;
  }
}

export const authMiddleware = async (request: FastifyRequest, reply: FastifyReply) => {
  try {
    // Récupérer le token depuis le cookie
    const token = request.cookies.auth_token;
    // il ya pas de token c'est pas normal je te laisse pas passer 
    if (!token) {
      throw new UnauthorizedError('Token manquant');
    }
    
    // Vérifier le token
    const decoded = await request.server.jwt.verify<JwtPayload>(token);// on va verifier le tokzn et le decoder  
    request.user = decoded; // attacher les infos au request object
  } catch (error) {
    throw new UnauthorizedError('Token invalide ou expiré');
  }
};

export const requireRoles = (allowedRoles: string[]) => {
  return async (request: FastifyRequest, reply: FastifyReply) => {
    if (!request.user) {
      throw new UnauthorizedError('Authentification requise');
    }

    if (!allowedRoles.includes(request.user.role)) {
      reply.code(403).send({
        success: false,
        error: 'Vous n\'avez pas les permissions nécessaires',
      });
      return;
    }
  };
};
