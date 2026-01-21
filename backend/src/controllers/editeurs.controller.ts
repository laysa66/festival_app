import { FastifyRequest, FastifyReply } from 'fastify';
import { EditeursService } from '../services/editeurs.service';
import { AppError } from '../utils/errors/custom-errors';

const createEditeursService = (req: FastifyRequest) => {
  return new EditeursService(req.server.prisma);
};

export const getAllEditeurs = async (req: FastifyRequest, reply: FastifyReply) => {
  try {
    const service = createEditeursService(req);
    const result = await service.getAllEditeurs();
    reply.code(200).send(result);
  } catch (error) {
    req.log.error(error, 'Error in getAllEditeurs');
    if (error instanceof AppError) {
      reply.code(error.statusCode).send({ success: false, message: error.message });
    } else {
      reply.code(500).send({ success: false, message: 'Internal server error', error: error instanceof Error ? error.message : 'Unknown error' });
    }
  }
};

export const getEditeurById = async (req: FastifyRequest, reply: FastifyReply) => {
  try {
    const { id } = req.params as { id: string };
    const service = createEditeursService(req);
    const result = await service.getEditeurById(parseInt(id, 10));
    reply.code(200).send(result);
  } catch (error) {
    if (error instanceof AppError) {
      reply.code(error.statusCode).send({ success: false, message: error.message });
    } else {
      reply.code(500).send({ success: false, message: 'Internal server error' });
    }
  }
};

export const updateEditeur = async (req: FastifyRequest, reply: FastifyReply) => {
  try {
    const { id } = req.params as { id: string };
    const body = req.body as any;
    const service = createEditeursService(req);
    const result = await service.updateEditeur(parseInt(id, 10), body);
    reply.code(200).send(result);
  } catch (error) {
    if (error instanceof AppError) {
      reply.code(error.statusCode).send({ success: false, message: error.message });
    } else {
      reply.code(500).send({ success: false, message: 'Internal server error' });
    }
  }
};

export const deleteEditeur = async (req: FastifyRequest, reply: FastifyReply) => {
  try {
    const { id } = req.params as { id: string };
    const service = createEditeursService(req);
    const result = await service.deleteEditeur(parseInt(id, 10));
    reply.code(200).send(result);
  } catch (error) {
    if (error instanceof AppError) {
      reply.code(error.statusCode).send({ success: false, message: error.message });
    } else {
      reply.code(500).send({ success: false, message: 'Internal server error' });
    }
  }
};
export const createEditeur = async (req: FastifyRequest, reply: FastifyReply) => {
  try {
    const body = req.body as any;
    const service = createEditeursService(req);
    const result = await service.createEditeur(body);
    reply.code(201).send(result);
  } catch (error) {
    if (error instanceof AppError) {
      reply.code(error.statusCode).send({ success: false, message: error.message });
    } else {
      reply.code(500).send({ success: false, message: 'Internal server error' });
    }
  }
};