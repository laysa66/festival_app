import { z } from 'zod';
import { zodToJsonSchema } from 'zod-to-json-schema';

// Update user schema
export const updateUserBodySchema = z.object({
  valide: z.boolean().optional(),
  roleId: z.number().int().min(1).optional(),
});

// User response schema
export const userResponseSchema = z.object({
  id: z.number(),
  email: z.string(),
  nom: z.string(),
  prenom: z.string(),
  role: z.string(),
  valide: z.boolean(),
  createdAt: z.string(),
});

// List users response
export const listUsersResponseSchema = z.object({
  success: z.boolean(),
  users: z.array(userResponseSchema),
  total: z.number(),
});

// Update user response
export const updateUserResponseSchema = z.object({
  success: z.boolean(),
  message: z.string(),
  user: userResponseSchema,
});

// Error schema
export const errorResponseSchema = z.object({
  success: z.boolean(),
  error: z.string(),
});

// Swagger schemas
export const listUsersSwaggerSchema = {
  tags: ['users'],
  summary: 'Liste tous les utilisateurs (Admin uniquement)',
  security: [{ Bearer: [] }],
  response: {
    200: zodToJsonSchema(listUsersResponseSchema),
    401: zodToJsonSchema(errorResponseSchema),
    403: zodToJsonSchema(errorResponseSchema),
  },
};

export const updateUserSwaggerSchema = {
  tags: ['users'],
  summary: 'Mettre à jour un utilisateur (Admin uniquement)',
  security: [{ Bearer: [] }],
  params: {
    type: 'object',
    properties: {
      id: { type: 'integer' },
    },
  },
  body: zodToJsonSchema(updateUserBodySchema),
  response: {
    200: zodToJsonSchema(updateUserResponseSchema),
    400: zodToJsonSchema(errorResponseSchema),
    401: zodToJsonSchema(errorResponseSchema),
    403: zodToJsonSchema(errorResponseSchema),
    404: zodToJsonSchema(errorResponseSchema),
  },
};
