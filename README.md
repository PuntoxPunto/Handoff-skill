# Handoff

A remote, read-only MCP capability for ChatGPT Web that compacts the current conversation into a continuation-ready handoff for another agent or human.

## ChatGPT Web

Current deployment:

- AppDeploy app id: `handoff-yocioi`
- Diagnostic frontend: `https://handoff-yocioi.v2.appdeploy.ai/`
- MCP registration URL: `https://api-v2.appdeploy.ai/app/handoff-yocioi/api/mcp`
- Authentication: none
- Tool: `handoff`
- Side effects: none; read-only

After registering the custom app in ChatGPT Developer Mode, open a new normal Chat, select Handoff from Tools/Apps and invoke it with a request such as:

```text
@Handoff
Prepare a full handoff for Codex. The next session should continue the MCP publishing work.
```

The tool supports destinations `generic`, `chatgpt`, `codex`, `claude`, and `human`, plus `compact`, `standard`, and `full` detail levels.

## What it preserves

A good handoff captures the objective, current state, decisions, constraints, verified facts, identifiers and URLs, existing artifacts, completed work, pending work, immediate next actions, risks, open questions, and useful tools/skills. Existing artifacts are referenced rather than copied wholesale. Secrets, tokens, passwords and unnecessary PII are redacted.

The MCP never executes pending work and does not store conversation data.

## Architecture

This repository contains:

- `backend/mcp.ts` — ChatGPT-compatible modern discovery + legacy MCP transport and the `handoff` tool.
- `backend/index.ts` — AppDeploy router entry point.
- `SKILL.md` — portable companion skill/fallback behavior.
- `src/` and `index.html` — small diagnostic frontend.
- `tests/tests.txt` — AppDeploy QA contract.
- `.punto/` — canonical Punto por Punto Project Pack.

The compatibility layer follows the AppDeploy pattern validated with working ChatGPT Web developer MCPs: modern `server/discover` on `2026-07-28`, legacy `initialize` fallback, `Mcp-Method`/`Mcp-Name` consistency, model-visible `noauth` tool metadata, and `resultType: complete` server metadata.

## Attribution

Handoff is inspired by and adapted from the original [`handoff` skill](https://github.com/mattpocock/skills/tree/main/skills/productivity/handoff) by **Matt Pocock**. His work provided the core idea: compact the conversation for another agent, avoid duplicating existing artifacts, tailor the handoff to the next session, and redact sensitive information.

See `THIRD_PARTY_NOTICES.md` for the upstream MIT notice.

## Status

The hosted MCP has passed AppDeploy QA (3/3) with 100% coverage of the app-owned MCP endpoint family. Registration in a fresh ChatGPT Web conversation remains the final product-level verification for each deployment revision.
