import { crawlHTML } from '../utils/crawler.js';

async function crawlRoutes(fastify, options) {
  fastify.post('/crawl', async (request, reply) => {
    const { url } = request.body;

    if (!url) {
      return reply.status(400).send({ error: 'URL is required' });
    }

    const result = await crawlHTML(url);

    if (!result.success) {
      return reply.status(500).send(result);
    }

    return reply.send(result);
  });
}

export default crawlRoutes;
