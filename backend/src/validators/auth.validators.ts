import { z } from 'zod';
import { zodToJsonSchema } from 'zod-to-json-schema';

// Register schemas
export const registerBodySchema = z.object({
  email: z.string().email('Email invalide'),
  password: z
    .string()
    .min(8, 'Le mot de passe doit contenir au moins 8 caractères')
    .regex(/[A-Z]/, 'Le mot de passe doit contenir au moins une majuscule')
    .regex(/[a-z]/, 'Le mot de passe doit contenir au moins une minuscule')
    .regex(/[0-9]/, 'Le mot de passe doit contenir au moins un chiffre')
    .regex(/[^A-Za-z0-9]/, 'Le mot de passe doit contenir au moins un caractère spécial'),
  nom: z.string().min(2, 'Le nom doit contenir au moins 2 caractères'),
  prenom: z.string().min(2, 'Le prénom doit contenir au moins 2 caractères'),
});

export const registerResponseSchema = z.object({
  success: z.boolean(),
  message: z.string(),
  user: z.object({
    id: z.number(),
    email: z.string(),
    nom: z.string(),
    prenom: z.string(),
    valide: z.boolean(),
    role: z.string(),
  }),
});
// --------------------------------------

// Login schemas
// pour le loginbodyschema on a besoin de email et password si non il renvoie une 
// erreur BOUM !!!!!
export const loginBodySchema = z.object({
  email: z.string().email('Email invalide'),
  password: z.string().min(1, 'Le mot de passe est requis'),
});

// schema pour la reponse apres le login 

export const loginResponseSchema = z.object({
  success: z.boolean(),
  message: z.string(),
  user: z.object({
    id: z.number(),
    email: z.string(),
    nom: z.string(),
    prenom: z.string(),
    role: z.string(),
    valide: z.boolean(),
  }),
});

// Me schema
export const meResponseSchema = z.object({
  success: z.boolean(),
  user: z.object({
    id: z.number(),
    email: z.string(),
    nom: z.string(),
    prenom: z.string(),
    role: z.string(),
    valide: z.boolean(),
  }),
});

// Error schema
export const errorResponseSchema = z.object({
  success: z.boolean(),
  error: z.string(),
});

// Swagger schemas
export const registerSwaggerSchema = {
  tags: ['auth'],
  summary: 'Créer un nouveau compte',
  body: zodToJsonSchema(registerBodySchema),
  response: {
    201: zodToJsonSchema(registerResponseSchema),
    400: zodToJsonSchema(errorResponseSchema),
    409: zodToJsonSchema(errorResponseSchema),
  },
};

export const loginSwaggerSchema = {
  tags: ['auth'],
  summary: 'Se connecter',
  body: zodToJsonSchema(loginBodySchema),
  response: {
    200: zodToJsonSchema(loginResponseSchema),
    401: zodToJsonSchema(errorResponseSchema),
    403: zodToJsonSchema(errorResponseSchema),
  },
};

export const meSwaggerSchema = {
  tags: ['auth'],
  summary: 'Récupérer les informations de l\'utilisateur connecté',
  security: [{ Bearer: [] }],
  response: {
    200: zodToJsonSchema(meResponseSchema),
    401: zodToJsonSchema(errorResponseSchema),
  },
};
