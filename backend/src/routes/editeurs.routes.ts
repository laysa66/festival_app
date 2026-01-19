import { FastifyInstance } from 'fastify';
import { getAllEditeurs, getEditeurById, updateEditeur, deleteEditeur, createEditeur } from '../controllers/editeurs.controller';

async function editeursRoutes(server: FastifyInstance) {
  // Get all editeurs
  server.get('/editeurs', async (req, reply) => {
    return getAllEditeurs(req, reply);
  });

  // Get editeur by id
  server.get('/editeurs/:id', async (req, reply) => {
    return getEditeurById(req, reply);
  });

  // Create editeur
  server.post('/editeurs', async (req, reply) => {
    return createEditeur(req, reply);
  });

  // Update editeur
  server.put('/editeurs/:id', async (req, reply) => {
    return updateEditeur(req, reply);
  });

  // Delete editeur
  server.delete('/editeurs/:id', async (req, reply) => {
    return deleteEditeur(req, reply);
  });
}

export default editeursRoutes;
