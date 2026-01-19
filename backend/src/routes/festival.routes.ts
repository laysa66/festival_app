import { FastifyInstance } from 'fastify';
import {
  getAllFestivals,
  getFestivalById,
  createFestival,
  updateFestival,
  deleteFestival,
  addZoneTarifaire,
  updateZoneTarifaire,
  deleteZoneTarifaire,
  addZonePlan,
  updateZonePlan,
  deleteZonePlan,
} from '../controllers/festival.controller';

async function festivalRoutes(server: FastifyInstance) {
  // Get all festivals
  server.get('/festivals', async (req, reply) => {
    return getAllFestivals(req, reply);
  });

  // Get festival by id
  server.get('/festivals/:id', async (req, reply) => {
    return getFestivalById(req, reply);
  });

  // Create festival
  server.post('/festivals', async (req, reply) => {
    return createFestival(req, reply);
  });

  // Update festival
  server.put('/festivals/:id', async (req, reply) => {
    return updateFestival(req, reply);
  });

  // Delete festival
  server.delete('/festivals/:id', async (req, reply) => {
    return deleteFestival(req, reply);
  });

  // Zone Tarifaire Routes
  server.post('/festivals/:festivalId/zones-tarifaires', async (req, reply) => {
    return addZoneTarifaire(req, reply);
  });

  server.put('/zones-tarifaires/:zoneId', async (req, reply) => {
    return updateZoneTarifaire(req, reply);
  });

  server.delete('/zones-tarifaires/:zoneId', async (req, reply) => {
    return deleteZoneTarifaire(req, reply);
  });

  // Zone Plan Routes
  server.post('/festivals/:festivalId/zone-plans', async (req, reply) => {
    return addZonePlan(req, reply);
  });

  server.put('/zone-plans/:zonePlanId', async (req, reply) => {
    return updateZonePlan(req, reply);
  });

  server.delete('/zone-plans/:zonePlanId', async (req, reply) => {
    return deleteZonePlan(req, reply);
  });
}

export default festivalRoutes;
