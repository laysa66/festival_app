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

// Zone Tarifaire Controllers
export const addZoneTarifaire = async (req: FastifyRequest, reply: FastifyReply) => {
  try {
    const { festivalId } = req.params as { festivalId: string };
    const body = req.body as any;
    const service = createFestivalService(req);
    const zone = await service.addZoneTarifaire(parseInt(festivalId, 10), body);
    reply.code(201).send(zone);
  } catch (error) {
    if (error instanceof AppError) {
      reply.code(error.statusCode).send({ message: error.message });
    } else {
      reply.code(500).send({ message: 'Internal server error' });
    }
  }
};

export const updateZoneTarifaire = async (req: FastifyRequest, reply: FastifyReply) => {
  try {
    const { zoneId } = req.params as { zoneId: string };
    const body = req.body as any;
    const service = createFestivalService(req);
    const zone = await service.updateZoneTarifaire(parseInt(zoneId, 10), body);
    reply.code(200).send(zone);
  } catch (error) {
    if (error instanceof AppError) {
      reply.code(error.statusCode).send({ message: error.message });
    } else {
      reply.code(500).send({ message: 'Internal server error' });
    }
  }
};

export const deleteZoneTarifaire = async (req: FastifyRequest, reply: FastifyReply) => {
  try {
    const { zoneId } = req.params as { zoneId: string };
    const service = createFestivalService(req);
    const zone = await service.deleteZoneTarifaire(parseInt(zoneId, 10));
    reply.code(200).send(zone);
  } catch (error) {
    if (error instanceof AppError) {
      reply.code(error.statusCode).send({ message: error.message });
    } else {
      reply.code(500).send({ message: 'Internal server error' });
    }
  }
};

// Zone Plan Controllers
export const addZonePlan = async (req: FastifyRequest, reply: FastifyReply) => {
  try {
    const { festivalId } = req.params as { festivalId: string };
    const body = req.body as any;
    const service = createFestivalService(req);
    const zonePlan = await service.addZonePlan(parseInt(festivalId, 10), body);
    reply.code(201).send(zonePlan);
  } catch (error) {
    if (error instanceof AppError) {
      reply.code(error.statusCode).send({ message: error.message });
    } else {
      reply.code(500).send({ message: 'Internal server error' });
    }
  }
};

export const updateZonePlan = async (req: FastifyRequest, reply: FastifyReply) => {
  try {
    const { zonePlanId } = req.params as { zonePlanId: string };
    const body = req.body as any;
    const service = createFestivalService(req);
    const zonePlan = await service.updateZonePlan(parseInt(zonePlanId, 10), body);
    reply.code(200).send(zonePlan);
  } catch (error) {
    if (error instanceof AppError) {
      reply.code(error.statusCode).send({ message: error.message });
    } else {
      reply.code(500).send({ message: 'Internal server error' });
    }
  }
};

export const deleteZonePlan = async (req: FastifyRequest, reply: FastifyReply) => {
  try {
    const { zonePlanId } = req.params as { zonePlanId: string };
    const service = createFestivalService(req);
    const zonePlan = await service.deleteZonePlan(parseInt(zonePlanId, 10));
    reply.code(200).send(zonePlan);
  } catch (error) {
    if (error instanceof AppError) {
      reply.code(error.statusCode).send({ message: error.message });
    } else {
      reply.code(500).send({ message: 'Internal server error' });
    }
  }
};
