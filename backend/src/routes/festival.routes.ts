import { FastifyInstance } from 'fastify';
import {
  getAllFestivals,
  getFestivalById,
  createFestival,
  updateFestival,
  deleteFestival,
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
}

export default festivalRoutes;
