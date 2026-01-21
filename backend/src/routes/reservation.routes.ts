import { FastifyInstance } from 'fastify';
import {
  requireReservationAccess,
  requireSuperOrganizerAccess,
} from '../middlewares/role.middleware';
import * as reservationController from '../controllers/reservation.controller';

async function reservationRoutes(server: FastifyInstance) {
  // ============================================
  // ROUTES PRINCIPALES RÉSERVATIONS
  // ============================================

  // Liste des réservations avec filtres
  server.get(
    '/reservations',
    { preHandler: [requireReservationAccess] },
    reservationController.getAllReservations
  );

  // Détail d'une réservation
  server.get(
    '/reservations/:id',
    { preHandler: [requireReservationAccess] },
    reservationController.getReservationById
  );

  // Créer une réservation
  server.post(
    '/reservations',
    { preHandler: [requireReservationAccess] },
    reservationController.createReservation
  );

  // Mettre à jour une réservation
  server.put(
    '/reservations/:id',
    { preHandler: [requireReservationAccess] },
    reservationController.updateReservation
  );

  // Supprimer une réservation (SUPER_ORGANISATEUR+ seulement)
  server.delete(
    '/reservations/:id',
    { preHandler: [requireSuperOrganizerAccess] },
    reservationController.deleteReservation
  );

  // ============================================
  // ROUTES LIGNES DE RÉSERVATION (ZONES TARIFAIRES)
  // ============================================

  // Ajouter une ligne de réservation
  server.post(
    '/reservations/:id/lines',
    { preHandler: [requireReservationAccess] },
    reservationController.addReservationLine
  );

  // Mettre à jour une ligne de réservation
  server.put(
    '/reservations/lines/:lineId',
    { preHandler: [requireReservationAccess] },
    reservationController.updateReservationLine
  );

  // Supprimer une ligne de réservation
  server.delete(
    '/reservations/lines/:lineId',
    { preHandler: [requireReservationAccess] },
    reservationController.deleteReservationLine
  );

  // ============================================
  // ROUTES CONTACTS/RELANCES
  // ============================================

  // Ajouter un contact/relance
  server.post(
    '/reservations/:id/contacts',
    { preHandler: [requireReservationAccess] },
    reservationController.addReservationContact
  );

  // Supprimer un contact
  server.delete(
    '/reservations/contacts/:contactId',
    { preHandler: [requireReservationAccess] },
    reservationController.deleteReservationContact
  );

  // ============================================
  // ROUTES JEUX
  // ============================================

  // Ajouter un jeu à la réservation
  server.post(
    '/reservations/:id/jeux',
    { preHandler: [requireReservationAccess] },
    reservationController.addReservationJeu
  );

  // Mettre à jour un jeu de la réservation
  server.put(
    '/reservations/jeux/:jeuId',
    { preHandler: [requireReservationAccess] },
    reservationController.updateReservationJeu
  );

  // Supprimer un jeu de la réservation
  server.delete(
    '/reservations/jeux/:jeuId',
    { preHandler: [requireReservationAccess] },
    reservationController.deleteReservationJeu
  );

  // ============================================
  // ROUTES UTILITAIRES
  // ============================================

  // Calculer le prix d'une réservation
  server.get(
    '/reservations/:id/calculate-price',
    { preHandler: [requireReservationAccess] },
    reservationController.calculatePrice
  );

  // Vérifier la disponibilité du stock
  server.get(
    '/reservations/check-stock',
    { preHandler: [requireReservationAccess] },
    reservationController.checkStock
  );

  // Auto-sauvegarde (brouillon)
  server.patch(
    '/reservations/:id/autosave',
    { preHandler: [requireReservationAccess] },
    reservationController.autoSave
  );
}

export default reservationRoutes;
