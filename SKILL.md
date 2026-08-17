---
name: handoff

description: Compact the current conversation into a continuation-ready handoff for another agent or human. Invoke only when the user explicitly asks to hand off, transfer, compact, or prepare the current work for a new session.
---

# Handoff

Create a Markdown handoff from the **current visible conversation**. Do not execute pending work.

## Output

Include when applicable:

- Objective
- Current state
- Decisions already made
- Constraints
- Verified facts/evidence
- Important identifiers, URLs and SHAs
- Existing artifacts and where they live
- Work completed
- Pending work
- Immediate next actions
- Risks and open questions
- Relevant environment/tools
- Suggested skills/tools for continuation

Reference existing specs, files, PRs, issues, commits and artifacts by path or URL rather than duplicating their full contents. Clearly distinguish observed facts from assumptions. Preserve operationally important exact identifiers.

Redact secrets, API keys, passwords, tokens and unnecessary personally identifying information. Do not reveal private chain-of-thought.

Tailor the result to the requested destination. For a human recipient, minimize agent/tool jargon. For ChatGPT, Codex or Claude, end with concise continuation instructions.
