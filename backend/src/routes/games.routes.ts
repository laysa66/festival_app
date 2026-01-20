import { FastifyInstance } from 'fastify';
import { getAllGames, getGamesByEditeur, getFilteredGames, createGame, updateGame, deleteGame } from '../controllers/games.controller';

async function gamesRoutes(server: FastifyInstance) {
  // Get filtered games
  server.get('/jeux/filter', async (req, reply) => {
    return getFilteredGames(req, reply);
  });

  // Get all games
  server.get('/jeux', async (req, reply) => {
    return getAllGames(req, reply);
  });

  // Get games by editeur
  server.get('/jeux/editeur/:editeurId', async (req, reply) => {
    return getGamesByEditeur(req, reply);
  });

  // Create game
  server.post('/jeux', async (req, reply) => {
    return createGame(req, reply);
  });

  // Update game
  server.put('/jeux/:id', async (req, reply) => {
    return updateGame(req, reply);
  });

  // Delete game
  server.delete('/jeux/:id', async (req, reply) => {
    return deleteGame(req, reply);
  });
}

export default gamesRoutes;
