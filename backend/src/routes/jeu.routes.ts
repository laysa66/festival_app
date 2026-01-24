import { FastifyInstance } from 'fastify';
import { searchJeux, getJeuById, createJeu } from '../controllers/jeu.controller';

async function jeuRoutes(server: FastifyInstance) {
  // Search/list games
  // GET /jeux?search=xxx&limit=50&offset=0
  server.get('/jeux', async (req, reply) => {
    return searchJeux(req, reply);
  });

  // Get game by ID
  server.get('/jeux/:id', async (req, reply) => {
    return getJeuById(req, reply);
  });

  // Create new game
  server.post('/jeux', async (req, reply) => {
    return createJeu(req, reply);
  });
}

export default jeuRoutes;
