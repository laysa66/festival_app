import app from './app';
import pool from './config/database';
import { Server } from 'http';

const PORT = parseInt(process.env.PORT || '3000', 10);

// Test database connection before starting server
pool.query('SELECT NOW()', (err, _res) => {
  if (err) {
    console.error('Failed to connect to database:', err.message);
    console.log(' Server starting without database connection');
  } else {
    console.log(' Database connection successful');
  }
});

const server: Server = app.listen(PORT, () => {
  console.log(` Server is running on port ${PORT}`);
  console.log(` http://localhost:${PORT}`);
  console.log(` Health check: http://localhost:${PORT}/health`);
  console.log(` Environment: ${process.env.NODE_ENV || 'development'}`);
});

// Graceful shutdown
const shutdown = (signal: string) => {
  console.log(`👋 ${signal} signal received: closing HTTP server`);
  server.close(() => {
    console.log(' HTTP server closed');
    pool.end(() => {
      console.log(' Database pool closed');
      process.exit(0);
    });
  });
};

process.on('SIGTERM', () => shutdown('SIGTERM'));
process.on('SIGINT', () => shutdown('SIGINT'));
