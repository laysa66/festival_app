import { FastifyRequest, FastifyReply } from 'fastify';
import FestivalService from '../services/festival.service';
import { AppError } from '../utils/errors/custom-errors';

const createFestivalService = (req: FastifyRequest) => {
  return new FestivalService(req.server.prisma);
};

export const getAllGames = async (req: FastifyRequest, reply: FastifyReply) => {
  try {
    const service = createFestivalService(req);
    const games = await service.getAllGames();
    reply.code(200).send({
      success: true,
      jeux: games,
      total: games.length
    });
  } catch (error) {
    if (error instanceof AppError) {
      reply.code(error.statusCode).send({ success: false, message: error.message });
    } else {
      reply.code(500).send({ success: false, message: 'Internal server error' });
    }
  }
};

export const getGamesByEditeur = async (req: FastifyRequest, reply: FastifyReply) => {
  try {
    const { editeurId } = req.params as { editeurId: string };
    const service = createFestivalService(req);
    const games = await service.getGamesByEditeur(parseInt(editeurId, 10));
    reply.code(200).send({
      success: true,
      jeux: games,
      total: games.length
    });
  } catch (error) {
    if (error instanceof AppError) {
      reply.code(error.statusCode).send({ success: false, message: error.message });
    } else {
      reply.code(500).send({ success: false, message: 'Internal server error' });
    }
  }
};

export const getFilteredGames = async (req: FastifyRequest, reply: FastifyReply) => {
  try {
    const query = req.query as {
      typeJeu?: string;
      minDuration?: string;
      maxDuration?: string;
      minPlayers?: string;
      maxPlayers?: string;
    };

    const service = createFestivalService(req);
    const games = await service.getFilteredGames({
      typeJeuId: query.typeJeu ? parseInt(query.typeJeu, 10) : undefined,
      minDuration: query.minDuration ? parseInt(query.minDuration, 10) : undefined,
      maxDuration: query.maxDuration ? parseInt(query.maxDuration, 10) : undefined,
      minPlayers: query.minPlayers ? parseInt(query.minPlayers, 10) : undefined,
      maxPlayers: query.maxPlayers ? parseInt(query.maxPlayers, 10) : undefined,
    });
    reply.code(200).send({
      success: true,
      jeux: games,
      total: games.length
    });
  } catch (error) {
    if (error instanceof AppError) {
      reply.code(error.statusCode).send({ success: false, message: error.message });
    } else {
      reply.code(500).send({ success: false, message: 'Internal server error' });
    }
  }
};

export const createGame = async (req: FastifyRequest, reply: FastifyReply) => {
  try {
    const body = req.body as any;
    const service = createFestivalService(req);
    const game = await service.createGame(body);
    reply.code(201).send({
      success: true,
      message: 'Game created successfully',
      jeu: game
    });
  } catch (error) {
    if (error instanceof AppError) {
      reply.code(error.statusCode).send({ success: false, message: error.message });
    } else {
      reply.code(500).send({ success: false, message: 'Internal server error' });
    }
  }
};

export const updateGame = async (req: FastifyRequest, reply: FastifyReply) => {
  try {
    const { id } = req.params as { id: string };
    const body = req.body as any;
    const service = createFestivalService(req);
    const game = await service.updateGame(parseInt(id, 10), body);
    reply.code(200).send({
      success: true,
      jeu: game
    });
  } catch (error) {
    if (error instanceof AppError) {
      reply.code(error.statusCode).send({ success: false, message: error.message });
    } else {
      reply.code(500).send({ success: false, message: 'Internal server error' });
    }
  }
};

export const deleteGame = async (req: FastifyRequest, reply: FastifyReply) => {
  try {
    const { id } = req.params as { id: string };
    const service = createFestivalService(req);
    await service.deleteGame(parseInt(id, 10));
    reply.code(204).send();
  } catch (error) {
    if (error instanceof AppError) {
      reply.code(error.statusCode).send({ success: false, message: error.message });
    } else {
      reply.code(500).send({ success: false, message: 'Internal server error' });
    }
  }
};

export const getGamesByZonePlan = async (req: FastifyRequest, reply: FastifyReply) => {
  try {
    const { zonePlanId } = req.params as { zonePlanId: string };
    const service = createFestivalService(req);
    const games = await service.getGamesByZonePlan(parseInt(zonePlanId, 10));
    reply.code(200).send({
      success: true,
      jeux: games,
      total: games.length
    });
  } catch (error) {
    if (error instanceof AppError) {
      reply.code(error.statusCode).send({ success: false, message: error.message });
    } else {
      reply.code(500).send({ success: false, message: 'Internal server error' });
    }
  }
};

export const getGamesByZoneTarifaire = async (req: FastifyRequest, reply: FastifyReply) => {
  try {
    const { zoneTarifaireId } = req.params as { zoneTarifaireId: string };
    const service = createFestivalService(req);
    const games = await service.getGamesByZoneTarifaire(parseInt(zoneTarifaireId, 10));
    reply.code(200).send({
      success: true,
      jeux: games,
      total: games.length
    });
  } catch (error) {
    if (error instanceof AppError) {
      reply.code(error.statusCode).send({ success: false, message: error.message });
    } else {
      reply.code(500).send({ success: false, message: 'Internal server error' });
    }
  }
};
