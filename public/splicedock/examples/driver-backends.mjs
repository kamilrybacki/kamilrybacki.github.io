import express from 'express';
import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { StreamableHTTPServerTransport } from '@modelcontextprotocol/sdk/server/streamableHttp.js';
import { z } from 'zod';

const app = express();
const product = { sku: 'P-100', name: 'Desk lamp' };
app.use(express.json());

app.get('/products/:sku', (req, res) => {
  if (req.params.sku !== product.sku) return res.sendStatus(404);
  res.json(product);
});

app.post('/mcp', async (req, res) => {
  const mcp = new McpServer({ name: 'demo-catalog', version: '1.0.0' });
  mcp.registerTool('lookup_product', {
    description: 'Look up a product by SKU',
    inputSchema: { sku: z.string() },
  }, async ({ sku }) => ({
    content: [{ type: 'text', text: sku === product.sku
      ? product.sku + ': ' + product.name
      : 'Product not found' }],
    isError: sku !== product.sku,
  }));
  const transport = new StreamableHTTPServerTransport({ sessionIdGenerator: undefined });
  res.on('close', () => { void mcp.close(); });
  await mcp.connect(transport);
  await transport.handleRequest(req, res, req.body);
});

// The demo uses stateless request/response transport.
app.all('/mcp', (_req, res) => res.sendStatus(405));
app.listen(9001, '127.0.0.1', () => console.log('Demo backends at http://127.0.0.1:9001'));
