import { FastifyInstance } from 'fastify';
import { UsersService } from '../services/users.service';
import { UsersController } from '../controllers/users.controller';
import { authMiddleware, requireRoles } from '../middlewares/auth.middleware';
import { listUsersSwaggerSchema, updateUserSwaggerSchema } from '../validators/users.validators';

export default async function usersRoutes(server: FastifyInstance) {
  const usersService = new UsersService(server);
  const usersController = new UsersController(usersService);

  // GET /api/users - Liste tous les utilisateurs (Admin uniquement)
  server.get(
    '/',
    {
      schema: listUsersSwaggerSchema,
      preHandler: [authMiddleware, requireRoles(['ADMIN'])],
    },
    async (request, reply) => usersController.listUsers(request, reply)
  );

  // PUT /api/users/:id - Mettre à jour un utilisateur (Admin uniquement)
  server.put(
    '/:id',
    {
      schema: updateUserSwaggerSchema,
      preHandler: [authMiddleware, requireRoles(['ADMIN'])],
    },
    async (request, reply) => usersController.updateUser(request, reply)
  );
}
