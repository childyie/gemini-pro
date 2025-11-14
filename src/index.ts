import { Hono } from 'hono';
import { GeminiProxy } from './handler';

// Define the environment bindings
type Env = {
  GEMINI_PROXY: DurableObjectNamespace<GeminiProxy>;
};

const app = new Hono<{ Bindings: Env }>();

// Handle all requests by forwarding them to the Durable Object
app.all('*', async (c) => {
  // Always use the same DO instance to ensure egress from a consistent location
  const id = c.env.GEMINI_PROXY.idFromName('gemini-proxy');
  
  // Specify 'wnam' to hint that we want to run in North America
  const stub = c.env.GEMINI_PROXY.get(id, { locationHint: 'wnam' });

  // Forward the request to the Durable Object
  return stub.fetch(c.req.raw);
});

export default {
  fetch: app.fetch,
};

// Re-export the Durable Object class
export { GeminiProxy };
