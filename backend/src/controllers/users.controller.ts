import { FastifyRequest, FastifyReply } from 'fastify';
import { UsersService } from '../services/users.service';
import { updateUserBodySchema } from '../validators/users.validators';
import { UpdateUserRequest } from '../models/user.models';

export class UsersController {
  constructor(private usersService: UsersService) {}

  async listUsers(request: FastifyRequest, reply: FastifyReply) {
    const result = await this.usersService.listUsers();
    reply.code(200).send(result);
  }

  async updateUser(
    request: FastifyRequest<{ Params: { id: string }; Body: UpdateUserRequest }>,
    reply: FastifyReply
  ) {
    const userId = parseInt(request.params.id, 10);
    
    // Valider le body avec Zod
    const validatedData = updateUserBodySchema.parse(request.body);
    
    const result = await this.usersService.updateUser(userId, validatedData);
    reply.code(200).send(result);
  }
}
