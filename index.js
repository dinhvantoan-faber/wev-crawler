import Fastify from 'fastify';
import crawlRoutes from './routes/crawl.js';
import { browserManager } from './utils/browserManager.js';

const fastify = Fastify({ logger: true });

// Register routes
fastify.register(crawlRoutes);

// Graceful shutdown handler
const gracefulShutdown = async () => {
  fastify.log.info('Shutting down gracefully...');
  
  try {
    await browserManager.closeBrowser();
    fastify.log.info('Browser closed successfully');
  } catch (error) {
    fastify.log.error('Error closing browser:', error);
  }
  
  try {
    await fastify.close();
    fastify.log.info('Server closed successfully');
  } catch (error) {
    fastify.log.error('Error closing server:', error);
  }
  
  process.exit(0);
};

// Handle shutdown signals
process.on('SIGTERM', gracefulShutdown);
process.on('SIGINT', gracefulShutdown);

// Start server
const start = async () => {
  try {
    await fastify.listen({ port: 3000, host: '0.0.0.0' });
    fastify.log.info('Server running on http://localhost:3000');
  } catch (err) {
    fastify.log.error(err);
    await browserManager.closeBrowser();
    process.exit(1);
  }
};

start();
