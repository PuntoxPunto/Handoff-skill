import './styles.css';
import { api } from '@appdeploy/client';

const status = document.querySelector<HTMLElement>('#status')!;
const detail = document.querySelector<HTMLElement>('#detail')!;
const dot = document.querySelector<HTMLElement>('#dot')!;
const button = document.querySelector<HTMLButtonElement>('#test')!;

const rpc = (method: string, id: number, params: Record<string, unknown> = {}) =>
  api.post('/api/mcp', { jsonrpc: '2.0', id, method, params }).then(r => r.data);

button.addEventListener('click', async () => {
  button.disabled = true;
  status.textContent = 'Testing MCP…';
  detail.textContent = 'Checking legacy compatibility, tool metadata, and a safe tool call.';
  dot.className = 'dot pending';

  try {
    let getRejected = false;
    try { await api.get('/api/mcp'); } catch { getRejected = true; }

    const init = await rpc('initialize', 1, { protocolVersion: '2025-11-25', capabilities: {}, clientInfo: { name: 'handoff-self-test', version: '1' } });
    const list = await rpc('tools/list', 2, {});
    const call = await rpc('tools/call', 3, { name: 'handoff', arguments: { request: 'Create a test handoff', destination: 'generic', detail: 'compact' } });
    const tool = list?.result?.tools?.[0];
    const ok = getRejected && init?.result?.serverInfo?.name === 'handoff-chat' && tool?.name === 'handoff' && tool?.annotations?.readOnlyHint === true && tool?._meta?.ui?.visibility?.includes('model') && Array.isArray(tool?.securitySchemes) && call?.result?.structuredContent?.mode === 'handoff';
    if (!ok) throw new Error('Compatibility assertion failed');

    status.textContent = 'MCP endpoint ready';
    detail.textContent = 'Handoff is noauth, model-visible, read-only, schema-backed, and responds to tools/call.';
    dot.className = 'dot ready';
  } catch (e) {
    status.textContent = 'MCP endpoint error';
    detail.textContent = e instanceof Error ? e.message : 'Unknown MCP error';
    dot.className = 'dot error';
  } finally {
    button.disabled = false;
  }
});
