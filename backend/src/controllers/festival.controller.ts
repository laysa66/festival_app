import { FastifyRequest, FastifyReply } from 'fastify';
import FestivalService from '../services/festival.service';
import { AppError } from '../utils/errors/custom-errors';

const createFestivalService = (req: FastifyRequest) => {
  return new FestivalService(req.server.prisma);
};

export const getAllFestivals = async (req: FastifyRequest, reply: FastifyReply) => {
  try {
    const service = createFestivalService(req);
    const festivals = await service.getAllFestivals();
    reply.code(200).send(festivals);
  } catch (error) {
    if (error instanceof AppError) {
      reply.code(error.statusCode).send({ message: error.message });
    } else {
      reply.code(500).send({ message: 'Internal server error' });
    }
  }
};

export const getFestivalById = async (req: FastifyRequest, reply: FastifyReply) => {
  try {
    const { id } = req.params as { id: string };
    const service = createFestivalService(req);
    const festival = await service.getFestivalById(parseInt(id, 10));
    reply.code(200).send(festival);
  } catch (error) {
    if (error instanceof AppError) {
      reply.code(error.statusCode).send({ message: error.message });
    } else {
      reply.code(500).send({ message: 'Internal server error' });
    }
  }
};

export const createFestival = async (req: FastifyRequest, reply: FastifyReply) => {
  try {
    const body = req.body as any;
    const service = createFestivalService(req);
    const festival = await service.createFestival(body);
    reply.code(201).send(festival);
  } catch (error) {
    if (error instanceof AppError) {
      reply.code(error.statusCode).send({ message: error.message });
    } else {
      reply.code(500).send({ message: 'Internal server error' });
    }
  }
};

export const updateFestival = async (req: FastifyRequest, reply: FastifyReply) => {
  try {
    const { id } = req.params as { id: string };
    const body = req.body as any;
    const service = createFestivalService(req);
    const festival = await service.updateFestival(parseInt(id, 10), body);
    reply.code(200).send(festival);
  } catch (error) {
    if (error instanceof AppError) {
      reply.code(error.statusCode).send({ message: error.message });
    } else {
      reply.code(500).send({ message: 'Internal server error' });
    }
  }
};

export const deleteFestival = async (req: FastifyRequest, reply: FastifyReply) => {
  try {
    const { id } = req.params as { id: string };
    const service = createFestivalService(req);
    const festival = await service.deleteFestival(parseInt(id, 10));
    reply.code(200).send(festival);
  } catch (error) {
    if (error instanceof AppError) {
      reply.code(error.statusCode).send({ message: error.message });
    } else {
      reply.code(500).send({ message: 'Internal server error' });
    }
  }
};
