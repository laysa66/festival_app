import { FastifyRequest, FastifyReply } from 'fastify';
import { ReservationService } from '../services/reservation.service';
import { AppError } from '../utils/errors/custom-errors';
import {
  CreateReservationRequest,
  UpdateReservationRequest,
  AddReservationLineRequest,
  UpdateReservationLineRequest,
  AddReservationContactRequest,
  AddReservationJeuRequest,
  UpdateReservationJeuRequest,
  ReservationFilters,
} from '../models/reservation.models';

const createReservationService = (req: FastifyRequest) => {
  return new ReservationService(req.server.prisma);
};

// ============================================
// ENDPOINTS PRINCIPAUX RÉSERVATION
// ============================================

export const getAllReservations = async (req: FastifyRequest, reply: FastifyReply) => {
  try {
    const filters = req.query as ReservationFilters;
    const service = createReservationService(req);
    const result = await service.getAllReservations(filters);
    reply.code(200).send(result);
  } catch (error) {
    req.log.error(error, 'Error in getAllReservations');
    if (error instanceof AppError) {
      reply.code(error.statusCode).send({ success: false, message: error.message });
    } else {
      reply.code(500).send({
        success: false,
        message: 'Erreur serveur',
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }
};

export const getReservationById = async (req: FastifyRequest, reply: FastifyReply) => {
  try {
    const { id } = req.params as { id: string };
    const service = createReservationService(req);
    const reservation = await service.getReservationById(parseInt(id, 10));
    reply.code(200).send({ success: true, reservation });
  } catch (error) {
    req.log.error(error, 'Error in getReservationById');
    if (error instanceof AppError) {
      reply.code(error.statusCode).send({ success: false, message: error.message });
    } else {
      reply.code(500).send({
        success: false,
        message: 'Erreur serveur',
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }
};

export const createReservation = async (req: FastifyRequest, reply: FastifyReply) => {
  try {
    const body = req.body as CreateReservationRequest;
    const service = createReservationService(req);
    const result = await service.createReservation(body);
    reply.code(201).send(result);
  } catch (error) {
    req.log.error(error, 'Error in createReservation');
    if (error instanceof AppError) {
      reply.code(error.statusCode).send({ success: false, message: error.message });
    } else {
      reply.code(500).send({
        success: false,
        message: 'Erreur serveur',
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }
};

export const updateReservation = async (req: FastifyRequest, reply: FastifyReply) => {
  try {
    const { id } = req.params as { id: string };
    const body = req.body as UpdateReservationRequest;
    const service = createReservationService(req);
    const result = await service.updateReservation(parseInt(id, 10), body);
    reply.code(200).send(result);
  } catch (error) {
    req.log.error(error, 'Error in updateReservation');
    if (error instanceof AppError) {
      reply.code(error.statusCode).send({ success: false, message: error.message });
    } else {
      reply.code(500).send({
        success: false,
        message: 'Erreur serveur',
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }
};

export const deleteReservation = async (req: FastifyRequest, reply: FastifyReply) => {
  try {
    const { id } = req.params as { id: string };
    const service = createReservationService(req);
    const result = await service.deleteReservation(parseInt(id, 10));
    reply.code(200).send(result);
  } catch (error) {
    req.log.error(error, 'Error in deleteReservation');
    if (error instanceof AppError) {
      reply.code(error.statusCode).send({ success: false, message: error.message });
    } else {
      reply.code(500).send({
        success: false,
        message: 'Erreur serveur',
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }
};

// ============================================
// ENDPOINTS LIGNES DE RÉSERVATION
// ============================================

export const addReservationLine = async (req: FastifyRequest, reply: FastifyReply) => {
  try {
    const { id } = req.params as { id: string };
    const body = req.body as AddReservationLineRequest;
    const service = createReservationService(req);
    const result = await service.addReservationLine(parseInt(id, 10), body);
    reply.code(201).send(result);
  } catch (error) {
    req.log.error(error, 'Error in addReservationLine');
    if (error instanceof AppError) {
      reply.code(error.statusCode).send({ success: false, message: error.message });
    } else {
      reply.code(500).send({
        success: false,
        message: 'Erreur serveur',
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }
};

export const updateReservationLine = async (req: FastifyRequest, reply: FastifyReply) => {
  try {
    const { lineId } = req.params as { lineId: string };
    const body = req.body as UpdateReservationLineRequest;
    const service = createReservationService(req);
    const result = await service.updateReservationLine(parseInt(lineId, 10), body);
    reply.code(200).send(result);
  } catch (error) {
    req.log.error(error, 'Error in updateReservationLine');
    if (error instanceof AppError) {
      reply.code(error.statusCode).send({ success: false, message: error.message });
    } else {
      reply.code(500).send({
        success: false,
        message: 'Erreur serveur',
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }
};

export const deleteReservationLine = async (req: FastifyRequest, reply: FastifyReply) => {
  try {
    const { lineId } = req.params as { lineId: string };
    const service = createReservationService(req);
    const result = await service.deleteReservationLine(parseInt(lineId, 10));
    reply.code(200).send(result);
  } catch (error) {
    req.log.error(error, 'Error in deleteReservationLine');
    if (error instanceof AppError) {
      reply.code(error.statusCode).send({ success: false, message: error.message });
    } else {
      reply.code(500).send({
        success: false,
        message: 'Erreur serveur',
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }
};

// ============================================
// ENDPOINTS CONTACTS
// ============================================

export const addReservationContact = async (req: FastifyRequest, reply: FastifyReply) => {
  try {
    const { id } = req.params as { id: string };
    const body = req.body as AddReservationContactRequest;
    const service = createReservationService(req);
    const result = await service.addReservationContact(parseInt(id, 10), body);
    reply.code(201).send(result);
  } catch (error) {
    console.error('ERREUR AJOUT CONTACT:', error);
    req.log.error(error, 'Error in addReservationContact');
    if (error instanceof AppError) {
      reply.code(error.statusCode).send({ success: false, message: error.message });
    } else {
      reply.code(500).send({
        success: false,
        message: 'Erreur serveur',
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }
};

export const deleteReservationContact = async (
  req: FastifyRequest,
  reply: FastifyReply
) => {
  try {
    const { contactId } = req.params as { contactId: string };
    const service = createReservationService(req);
    const result = await service.deleteReservationContact(parseInt(contactId, 10));
    reply.code(200).send(result);
  } catch (error) {
    req.log.error(error, 'Error in deleteReservationContact');
    if (error instanceof AppError) {
      reply.code(error.statusCode).send({ success: false, message: error.message });
    } else {
      reply.code(500).send({
        success: false,
        message: 'Erreur serveur',
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }
};

// ============================================
// ENDPOINTS JEUX
// ============================================

export const addReservationJeu = async (req: FastifyRequest, reply: FastifyReply) => {
  try {
    const { id } = req.params as { id: string };
    const body = req.body as AddReservationJeuRequest;
    const service = createReservationService(req);
    const result = await service.addReservationJeu(parseInt(id, 10), body);
    reply.code(201).send(result);
  } catch (error) {
    req.log.error(error, 'Error in addReservationJeu');
    if (error instanceof AppError) {
      reply.code(error.statusCode).send({ success: false, message: error.message });
    } else {
      reply.code(500).send({
        success: false,
        message: 'Erreur serveur',
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }
};

export const updateReservationJeu = async (req: FastifyRequest, reply: FastifyReply) => {
  try {
    const { jeuId } = req.params as { jeuId: string };
    const body = req.body as UpdateReservationJeuRequest;
    const service = createReservationService(req);
    const result = await service.updateReservationJeu(parseInt(jeuId, 10), body);
    reply.code(200).send(result);
  } catch (error) {
    req.log.error(error, 'Error in updateReservationJeu');
    if (error instanceof AppError) {
      reply.code(error.statusCode).send({ success: false, message: error.message });
    } else {
      reply.code(500).send({
        success: false,
        message: 'Erreur serveur',
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }
};

export const deleteReservationJeu = async (req: FastifyRequest, reply: FastifyReply) => {
  try {
    const { jeuId } = req.params as { jeuId: string };
    const service = createReservationService(req);
    const result = await service.deleteReservationJeu(parseInt(jeuId, 10));
    reply.code(200).send(result);
  } catch (error) {
    req.log.error(error, 'Error in deleteReservationJeu');
    if (error instanceof AppError) {
      reply.code(error.statusCode).send({ success: false, message: error.message });
    } else {
      reply.code(500).send({
        success: false,
        message: 'Erreur serveur',
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }
};

// ============================================
// ENDPOINTS UTILITAIRES
// ============================================

export const calculatePrice = async (req: FastifyRequest, reply: FastifyReply) => {
  try {
    const { id } = req.params as { id: string };
    const service = createReservationService(req);
    const result = await service.calculatePrice(parseInt(id, 10));
    reply.code(200).send(result);
  } catch (error) {
    req.log.error(error, 'Error in calculatePrice');
    if (error instanceof AppError) {
      reply.code(error.statusCode).send({ success: false, message: error.message });
    } else {
      reply.code(500).send({
        success: false,
        message: 'Erreur serveur',
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }
};

export const checkStock = async (req: FastifyRequest, reply: FastifyReply) => {
  try {
    const { festivalId, zoneTarifaireId, nbTables } = req.query as {
      festivalId: string;
      zoneTarifaireId: string;
      nbTables: string;
    };
    const service = createReservationService(req);
    const result = await service.checkStockAvailable(
      parseInt(festivalId, 10),
      parseInt(zoneTarifaireId, 10),
      parseInt(nbTables, 10)
    );
    reply.code(200).send(result);
  } catch (error) {
    req.log.error(error, 'Error in checkStock');
    if (error instanceof AppError) {
      reply.code(error.statusCode).send({ success: false, message: error.message });
    } else {
      reply.code(500).send({
        success: false,
        message: 'Erreur serveur',
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }
};

export const autoSave = async (req: FastifyRequest, reply: FastifyReply) => {
  try {
    const { id } = req.params as { id: string };
    const body = req.body as Partial<UpdateReservationRequest>;
    const service = createReservationService(req);
    const result = await service.autoSave(parseInt(id, 10), body);
    reply.code(200).send(result);
  } catch (error) {
    req.log.error(error, 'Error in autoSave');
    if (error instanceof AppError) {
      reply.code(error.statusCode).send({ success: false, message: error.message });
    } else {
      reply.code(500).send({
        success: false,
        message: 'Erreur serveur',
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }
};
