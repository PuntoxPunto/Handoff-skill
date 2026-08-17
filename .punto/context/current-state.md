---
id: handoff-skill-current-state
status: canonical
version: 2
updated: 2026-08-17
---

# Handoff — Estado actual

## Canonical baseline

La inicialización completa de Handoff fue incorporada a `main` mediante PR #1.

Merge SHA observado:

`c0f351ef6b010ed157f53547cd9f635464df4bb5`

Ese baseline contiene el MCP remoto, companion skill, frontend diagnóstico, QA, documentación, Project Pack y atribución/licencia de Matt Pocock.

## Estado funcional observado

- AppDeploy app id: `handoff-yocioi`;
- deployment: READY;
- QA: 3/3 passed;
- backend endpoint coverage: 100%;
- diagnostic frontend: `https://handoff-yocioi.v2.appdeploy.ai/`;
- ChatGPT registration endpoint: `https://api-v2.appdeploy.ai/app/handoff-yocioi/api/mcp`;
- tool `handoff`: noauth, read-only, model-visible, schema-backed;
- el servidor no persiste contenido de conversación y la directiva exige redacción de secretos y PII innecesaria.

## Integración con Punto por Punto

- `project_id: handoff-skill` está registrado en `PuntoxPunto/Punto-x-Punto`;
- el alta fue incorporada mediante Registry PR #34;
- Registry merge SHA observado: `e9efad7ffdbf187dd353bdc4d6154e2020c8b4ed`;
- el Registry referencia `.punto/project.yaml`, `canonical_ref: main` e `identity_node_id: handoff-skill-identity`;
- no se añadió ninguna relación cross-project implícita durante el registro.

## Verificación de producto

El MCP está listo para registrarse/probarse desde un nuevo Chat normal que permita developer MCPs. Un hilo que devuelva `FORBIDDEN: This conversation does not support developer MCPs` refleja una restricción del hilo, no un fallo del servidor.

## Próximo gate

Cualquier cambio funcional posterior debe entrar por branch → PR → revisión/merge. El Project Pack y el Registry ya pueden utilizarse como contexto canónico del proyecto.
