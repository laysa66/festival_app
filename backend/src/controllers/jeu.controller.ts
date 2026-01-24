import { FastifyRequest, FastifyReply } from 'fastify';
import { JeuService, JeuSearchParams, JeuCreateRequest } from '../services/jeu.service';
import { AppError } from '../utils/errors/custom-errors';

const createJeuService = (req: FastifyRequest) => {
  return new JeuService(req.server.prisma);
};

/**
 * Recherche de jeux
 * GET /jeux?search=xxx&limit=50&offset=0
 */
export const searchJeux = async (req: FastifyRequest, reply: FastifyReply) => {
  try {
    const { search, limit, offset } = req.query as { search?: string; limit?: string; offset?: string };
    
    const params: JeuSearchParams = {
      search,
      limit: limit ? parseInt(limit, 10) : 50,
      offset: offset ? parseInt(offset, 10) : 0,
    };

    const service = createJeuService(req);
    const result = await service.searchJeux(params);
    reply.code(200).send(result);
  } catch (error) {
    req.log.error(error, 'Error in searchJeux');
    if (error instanceof AppError) {
      reply.code(error.statusCode).send({ success: false, message: error.message });
    } else {
      reply.code(500).send({ 
        success: false, 
        message: 'Internal server error', 
        error: error instanceof Error ? error.message : 'Unknown error' 
      });
    }
  }
};

/**
 * Récupérer un jeu par ID
 * GET /jeux/:id
 */
export const getJeuById = async (req: FastifyRequest, reply: FastifyReply) => {
  try {
    const { id } = req.params as { id: string };
    const service = createJeuService(req);
    const result = await service.getJeuById(parseInt(id, 10));
    reply.code(200).send(result);
  } catch (error) {
    if (error instanceof AppError) {
      reply.code(error.statusCode).send({ success: false, message: error.message });
    } else {
      reply.code(500).send({ success: false, message: 'Internal server error' });
    }
  }
};

/**
 * Créer un nouveau jeu
 * POST /jeux
 */
export const createJeu = async (req: FastifyRequest, reply: FastifyReply) => {
  try {
    const body = req.body as JeuCreateRequest;
    const service = createJeuService(req);
    const result = await service.createJeu(body);
    reply.code(201).send(result);
  } catch (error) {
    req.log.error(error, 'Error in createJeu');
    if (error instanceof AppError) {
      reply.code(error.statusCode).send({ success: false, message: error.message });
    } else {
      reply.code(500).send({ 
        success: false, 
        message: 'Internal server error', 
        error: error instanceof Error ? error.message : 'Unknown error' 
      });
    }
  }
};
