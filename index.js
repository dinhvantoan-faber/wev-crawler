import Fastify from 'fastify';
import crawlRoutes from './routes/crawl.js';

const fastify = Fastify({ logger: true });

// Register routes
fastify.register(crawlRoutes);

// Start server
const start = async () => {
  try {
    await fastify.listen({ port: 3000, host: '0.0.0.0' });
    fastify.log.info('Server running on http://localhost:3000');
  } catch (err) {
    fastify.log.error(err);
    process.exit(1);
  }
};

start();
