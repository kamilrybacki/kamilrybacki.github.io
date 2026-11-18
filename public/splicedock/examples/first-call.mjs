import { setTimeout as delay } from 'node:timers/promises';
import { Client } from '@modelcontextprotocol/sdk/client/index.js';
import { StreamableHTTPClientTransport } from '@modelcontextprotocol/sdk/client/streamableHttp.js';

const admin = 'http://127.0.0.1:8789';
const mcp = new URL('http://127.0.0.1:8788/mcp');
const adminToken = process.env.SPLICEDOCK_ADMIN_TOKEN;
if (!adminToken) throw new Error('Set SPLICEDOCK_ADMIN_TOKEN in this terminal.');

async function waitForGateway() {
  for (let attempt = 0; attempt < 50; attempt++) {
    const ready = await fetch(admin + '/api/v1/health', {
      signal: AbortSignal.timeout(500),
    }).then(response => response.ok, () => false);
    if (ready) return;
    await delay(200);
  }
  throw new Error('The gateway did not become ready. Check its startup output.');
}

await waitForGateway();
const response = await fetch(admin + '/api/v1/profile-tokens', {
  method: 'POST',
  headers: { Authorization: 'Bearer ' + adminToken, 'Content-Type': 'application/json' },
  body: JSON.stringify({ profile: 'demo', agent: 'quickstart', expires_in_seconds: 600 }),
  signal: AbortSignal.timeout(5000),
});
if (response.status !== 201) throw new Error('Profile token request returned HTTP ' + response.status);
const { data } = await response.json();

const client = new Client({ name: 'splicedock-quickstart', version: '1.0.0' });
try {
  await client.connect(new StreamableHTTPClientTransport(mcp, {
    requestInit: { headers: { Authorization: 'Bearer ' + data.token } },
  }));
  const { tools } = await client.listTools();
  if (!tools.some(tool => tool.name === 'demo__version')) {
    throw new Error('The demo profile does not expose demo__version.');
  }
  const result = await client.callTool({ name: 'demo__version', arguments: {} });
  const version = result.content?.find(item => item.type === 'text')?.text?.trim();
  if (result.isError || !/^v\d+\.\d+\.\d+/.test(version ?? '')) {
    throw new Error('demo__version did not return a Node.js version.');
  }
  console.log('demo__version:', version);
} finally {
  try {
    await client.close();
  } finally {
    const revoke = await fetch(admin + '/api/v1/profile-tokens/' + encodeURIComponent(data.id) + '/revoke', {
      method: 'POST',
      headers: { Authorization: 'Bearer ' + adminToken, 'Content-Type': 'application/json' },
      body: JSON.stringify({ reason: 'manual' }),
      signal: AbortSignal.timeout(3000),
    }).catch(() => undefined);
    if (revoke?.status !== 204) console.warn('The demo token expires after ten minutes.');
  }
}
