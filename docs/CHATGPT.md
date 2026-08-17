# Register Handoff in ChatGPT Web

Use the current ChatGPT Web custom-app/developer-MCP flow.

## Connection

- Name: `Handoff`
- Connection: Server URL
- Authentication: No authentication
- URL: `https://api-v2.appdeploy.ai/app/handoff-yocioi/api/mcp`

After creation, open a **new normal Chat** and select Handoff from Tools/Apps. A useful smoke test is:

```text
@Handoff
Prepare a compact handoff for Codex focused on the remaining work in this project.
```

The expected behavior is a call to the `handoff` tool followed by a Markdown handoff generated from the current conversation. The MCP itself does not have access to private chain-of-thought and must not execute the pending work it records.

The visible AppDeploy frontend (`https://handoff-yocioi.v2.appdeploy.ai/`) is a diagnostic page, not the ChatGPT registration URL.
