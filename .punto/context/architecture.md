---
id: handoff-skill-architecture
status: canonical
version: 1
updated: 2026-08-17
---

# Handoff — Arquitectura

## Shape

`tool-only` MCP remoto desplegado en AppDeploy.

```text
ChatGPT Web
  ↓ tools/call
AppDeploy gateway
  ↓
POST /api/mcp
  ↓
handoff tool
  ↓
model-facing handoff directive
  ↓
ChatGPT genera Markdown usando la conversación actual
```

## Tool contract

Input:

- `request` requerido;
- `destination`: generic/chatgpt/codex/claude/human;
- `focus` opcional;
- `detail`: compact/standard/full.

Output estructurado:

- mode = handoff;
- destination;
- detail;
- request;
- focus;
- readOnly = true.

## Compatibilidad MCP

- modern discovery: `2026-07-28`;
- legacy initialize: `2025-11-25`, `2025-06-18`, `2025-03-26`;
- `server/discover` y `initialize` son caminos separados;
- validación de `MCP-Protocol-Version`, `Mcp-Method`, `Mcp-Name` y body `_meta` en requests modernos;
- `GET /api/mcp` devuelve 405 intencionalmente;
- `tools/list` expone security schemes, annotations, model visibility y output schema;
- errores normales de tool se devuelven como `isError: true` sin romper el transporte.

## Privacidad

El servidor no almacena el contenido de la conversación. El modelo host genera el documento utilizando el contexto que ya tiene visible. La directiva exige redacción de secretos, tokens, passwords y PII innecesaria.
