import { router } from '@appdeploy/sdk';
import { mcpGet, mcpPost } from './mcp';

export const handler = router({
  'GET /api/mcp': [mcpGet],
  'POST /api/mcp': [mcpPost],
});
