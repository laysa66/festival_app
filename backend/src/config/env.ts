import dotenv from 'dotenv';
import { z } from 'zod';

dotenv.config();

// zod c'est une bibliotheque typescript, elle sert a valider des schemas, donc ici c'est pour valider les donnees envoyeres au backend 
// par example: l'inscription 


const envSchema = z.object({
  DATABASE_URL: z.string(),
  JWT_SECRET: z.string().min(32),
  PORT: z.string().default('3000'),
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  HOST: z.string().default('0.0.0.0'),
  CORS_ORIGIN: z.string().default('http://localhost:4200'),
});

const parseEnv = () => {
  try {
    return envSchema.parse(process.env);
  } catch (error) {
    console.error('Invalid environment variables:', error);
    process.exit(1);
  }
};

export const env = parseEnv();
