---
id: handoff-skill-current-state
status: proposal
version: 1
updated: 2026-08-17
---

# Handoff — Estado actual

## Estado funcional observado

- AppDeploy app id: `handoff-yocioi`;
- deployment: READY;
- QA: 3/3 passed;
- backend endpoint coverage: 100%;
- diagnostic frontend: `https://handoff-yocioi.v2.appdeploy.ai/`;
- ChatGPT registration endpoint: `https://api-v2.appdeploy.ai/app/handoff-yocioi/api/mcp`;
- tool `handoff`: noauth, read-only, model-visible, schema-backed.

## Estado canónico

Este Project Pack está propuesto en `agent/init-handoff-skill`. Debe ser mergeado a `main` antes de cualquier registro en `PuntoxPunto/Punto-x-Punto`.

## Próximo gate

1. merge de la inicialización;
2. validar manifest e identity desde `main`;
3. registrar `handoff-skill` en el Registry madre;
4. reconciliar este documento a estado `canonical`;
5. ejecutar health final.

La prueba de producto en ChatGPT debe hacerse desde un nuevo Chat normal que permita developer MCPs; un hilo que devuelva `FORBIDDEN: This conversation does not support developer MCPs` no constituye fallo del servidor.
