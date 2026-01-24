import { buildApp } from './app';
import { env } from './config/env';

async function start() {
  try {
    const server = await buildApp();

    await server.listen({
      port: parseInt(env.PORT),
      host: env.HOST,
    });

    console.log('Server is running on port', env.PORT);
    console.log(`http://localhost:${env.PORT}`);
    console.log(`Health check: http://localhost:${env.PORT}/health`);
    console.log(`Swagger documentation: http://localhost:${env.PORT}/documentation`);
    console.log(`Environment: ${env.NODE_ENV}`);
  } catch (error) {
    console.error('Error starting server:', error);
    process.exit(1);
  }
}

start();
