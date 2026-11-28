import { createInterface } from 'node:readline';

const tool = {
  name: 'healthcheck',
  description: 'Return the fixed text MCP_OK.',
  inputSchema: { type: 'object', properties: {}, additionalProperties: false },
};

const lines = createInterface({ input: process.stdin, crlfDelay: Infinity });
for await (const line of lines) {
  let request;
  try {
    request = JSON.parse(line);
  } catch {
    continue;
  }
  if (!request || Array.isArray(request) || request.id === undefined) continue;
  if (process.env.MCP_SMOKE_TRACE === '1') process.stderr.write(request.method + '\n');

  let result;
  switch (request.method) {
    case 'initialize':
      result = { protocolVersion: '2025-11-25', capabilities: { tools: {} },
        serverInfo: { name: 'ipunk-mcp-smoke', version: '1.0.0' } };
      break;
    case 'ping':
      result = {};
      break;
    case 'tools/list':
      result = { tools: [tool] };
      break;
    case 'tools/call':
      if (request.params?.name === tool.name) {
        result = { content: [{ type: 'text', text: 'MCP_OK' }] };
      }
      break;
  }
  const reply = { jsonrpc: '2.0', id: request.id };
  if (result) reply.result = result;
  else reply.error = { code: -32601, message: 'Method or tool unavailable' };
  process.stdout.write(JSON.stringify(reply) + '\n');
}
