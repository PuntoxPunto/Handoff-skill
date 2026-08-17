type Rpc = {
  jsonrpc?: string;
  id?: string | number | null;
  method?: string;
  params?: Record<string, unknown>;
};

type MpcContext = {
  body: unknown;
  event: { headers?: Record<string, unknown> };
};

const SERVER_INFO = { name: 'handoff-chat', version: '1.0.0' };
const MODERN_VERSION = '2026-07-28';
const LEGACY_VERSIONS = new Set(['2025-11-25', '2025-06-18', '2025-03-26']);
const MODERN_METHODS = new Set([
  'server/discover',
  'ping',
  'tools/list',
  'resources/list',
  'resources/read',
  'tools/call',
]);
const NOAUTH = [{ type: 'noauth' }];
const INSTRUCTIONS = 'Use Handoff when explicitly requested to compact the current conversation for another agent or human. The tool is read-only and never executes pending work.';

const tool = {
  name: 'handoff',
  title: 'Handoff',
  description: 'Use this when the user explicitly asks to hand off, transfer, compact, or prepare the current conversation so another agent or human can continue the work.',
  inputSchema: {
    type: 'object',
    properties: {
      request: { type: 'string', description: 'The handoff request or intended next-session focus.' },
      destination: { type: 'string', enum: ['generic', 'chatgpt', 'codex', 'claude', 'human'], default: 'generic' },
      focus: { type: 'string', description: 'Optional focus for the receiving session.' },
      detail: { type: 'string', enum: ['compact', 'standard', 'full'], default: 'standard' },
    },
    required: ['request'],
    additionalProperties: false,
  },
  outputSchema: {
    type: 'object',
    properties: {
      mode: { type: 'string', const: 'handoff' },
      destination: { type: 'string' },
      detail: { type: 'string' },
      request: { type: 'string' },
      focus: { type: 'string' },
      readOnly: { type: 'boolean' },
    },
    required: ['mode', 'destination', 'detail', 'request', 'focus', 'readOnly'],
    additionalProperties: false,
  },
  securitySchemes: NOAUTH,
  annotations: {
    readOnlyHint: true,
    destructiveHint: false,
    openWorldHint: false,
    idempotentHint: true,
  },
  _meta: {
    securitySchemes: NOAUTH,
    ui: { visibility: ['model'] },
  },
};

const metaResult = (result: Record<string, unknown>) => ({
  ...result,
  resultType: 'complete',
  _meta: {
    ...((result._meta as Record<string, unknown>) || {}),
    'io.modelcontextprotocol/serverInfo': SERVER_INFO,
  },
});

const response = (statusCode: number, value: unknown, extra: Record<string, string> = {}) => ({
  statusCode,
  headers: { 'Content-Type': 'application/json', 'Cache-Control': 'no-store', ...extra },
  body: value === null ? '' : JSON.stringify(value),
});

const rpcError = (id: unknown, code: number, message: string) => ({
  jsonrpc: '2.0',
  id,
  error: { code, message },
});

const directive = (destination: string, detail: string, focus: string) => `HANDOFF MODE — GENERATE\n\nCreate a handoff document from the CURRENT CONVERSATION for destination: ${destination}. Detail level: ${detail}.${focus ? ` Receiving-session focus: ${focus}` : ''}\n\nUse the visible conversation and available referenced artifacts as the source of truth. Do not execute pending work. Produce Markdown that lets a fresh recipient continue without reconstructing history. Include, when applicable: Objective; Current state; Decisions already made; Constraints; Verified facts/evidence; Important identifiers/URLs/SHAs; Existing artifacts and where they live; Work completed; Pending work; Immediate next actions; Risks/open questions; Relevant environment/tools; Suggested skills/tools for continuation. Reference existing specs, files, PRs, issues, commits or artifacts by path/URL instead of duplicating their full contents. Clearly distinguish observed facts from assumptions. Preserve operationally important exact identifiers. Redact secrets, API keys, passwords, tokens, and unnecessary personally identifying information. Do not reveal private chain-of-thought. For a human recipient, minimize agent/tool jargon. For Codex/Claude/ChatGPT, include concise continuation instructions.`;

const rpc = async (r: Rpc) => {
  const id = r.id ?? null;

  if (r.method === 'server/discover') {
    return {
      jsonrpc: '2.0',
      id,
      result: metaResult({
        supportedVersions: [MODERN_VERSION],
        capabilities: { tools: {}, resources: {} },
        instructions: INSTRUCTIONS,
        ttlMs: 60000,
        cacheScope: 'public',
      }),
    };
  }

  if (r.method === 'initialize') {
    const requested = String((r.params && r.params.protocolVersion) || '2025-11-25');
    const protocolVersion = LEGACY_VERSIONS.has(requested) ? requested : '2025-11-25';
    return {
      jsonrpc: '2.0',
      id,
      result: {
        protocolVersion,
        capabilities: { tools: { listChanged: false }, resources: { listChanged: false } },
        serverInfo: SERVER_INFO,
        instructions: INSTRUCTIONS,
      },
    };
  }

  if (r.method === 'ping') return { jsonrpc: '2.0', id, result: metaResult({}) };
  if (r.method === 'tools/list') return { jsonrpc: '2.0', id, result: metaResult({ tools: [tool], ttlMs: 60000, cacheScope: 'public' }) };
  if (r.method === 'resources/list') return { jsonrpc: '2.0', id, result: metaResult({ resources: [], ttlMs: 60000, cacheScope: 'public' }) };
  if (r.method === 'resources/read') return rpcError(id, -32002, 'Resource not found');

  if (r.method === 'tools/call') {
    const p = (r.params || {}) as { name?: string; arguments?: Record<string, unknown> };
    if (p.name !== 'handoff') {
      return { jsonrpc: '2.0', id, result: metaResult({ isError: true, content: [{ type: 'text', text: 'Tool error: unknown tool' }] }) };
    }

    const a = p.arguments || {};
    const request = String(a.request || '');
    if (!request) {
      return { jsonrpc: '2.0', id, result: metaResult({ isError: true, content: [{ type: 'text', text: 'Tool error: request is required' }] }) };
    }

    const destination = String(a.destination || 'generic');
    const detail = String(a.detail || 'standard');
    const focus = String(a.focus || '');
    return {
      jsonrpc: '2.0',
      id,
      result: metaResult({
        content: [{ type: 'text', text: directive(destination, detail, focus) }],
        structuredContent: { mode: 'handoff', destination, detail, request, focus, readOnly: true },
        isError: false,
      }),
    };
  }

  if (r.method === 'notifications/initialized') return null;
  return rpcError(id, -32601, `Method not found: ${r.method}`);
};

export const mcpGet = async () => response(405, { error: 'SSE stream not offered; use POST for MCP JSON-RPC.' }, { Allow: 'POST' });

export const mcpPost = async (ctx: MpcContext) => {
  const body = ctx.body;
  if (!body || typeof body !== 'object' || Array.isArray(body)) {
    return response(400, rpcError(null, -32600, 'Invalid JSON-RPC request'));
  }

  const request = body as Rpc;
  const raw = (ctx.event?.headers || {}) as Record<string, unknown>;
  const headers = Object.fromEntries(Object.entries(raw).map(([k, v]) => [k.toLowerCase(), String(v ?? '')]));
  const protocol = headers['mcp-protocol-version'] || '';
  const method = String(request.method || '');
  const params = (request.params || {}) as Record<string, unknown>;
  const bodyMeta = (params._meta || {}) as Record<string, unknown>;
  const bodyVersion = String(bodyMeta['io.modelcontextprotocol/protocolVersion'] || '');
  const modern = protocol === MODERN_VERSION || bodyVersion === MODERN_VERSION || method === 'server/discover';

  console.warn('MCP_REQUEST', JSON.stringify({
    method,
    protocol: protocol || null,
    bodyVersion: bodyVersion || null,
    mcpMethod: headers['mcp-method'] || null,
    mcpName: headers['mcp-name'] || null,
    userAgent: headers['user-agent'] || null,
    modern,
  }));

  if (modern) {
    if (protocol !== MODERN_VERSION || bodyVersion !== MODERN_VERSION) {
      return response(400, rpcError(request.id ?? null, -32020, 'Header mismatch: MCP-Protocol-Version and request _meta protocolVersion must both be 2026-07-28'));
    }
    if (headers['mcp-method'] !== method) {
      return response(400, rpcError(request.id ?? null, -32020, 'Header mismatch: Mcp-Method does not match JSON-RPC method'));
    }

    const expectedName = method === 'tools/call'
      ? String(params.name || '')
      : method === 'resources/read'
        ? String(params.uri || '')
        : '';
    if (expectedName && headers['mcp-name'] !== expectedName) {
      return response(400, rpcError(request.id ?? null, -32020, 'Header mismatch: Mcp-Name does not match request body'));
    }
    if (!MODERN_METHODS.has(method)) {
      return response(404, rpcError(request.id ?? null, -32601, `Method not found: ${method}`));
    }

    const out = await rpc(request);
    return out === null ? response(202, null) : response(200, out);
  }

  if (method !== 'initialize' && protocol && !LEGACY_VERSIONS.has(protocol)) {
    return response(400, rpcError(request.id ?? null, -32000, 'Unsupported MCP protocol version'));
  }

  const out = await rpc(request);
  return out === null ? response(202, null) : response(200, out);
};
