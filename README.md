# Min8T SDKs

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](./LICENSE)
[![@deliveriq/mcp version](https://img.shields.io/npm/v/@deliveriq/mcp.svg?label=%40deliveriq%2Fmcp)](https://www.npmjs.com/package/@deliveriq/mcp)
[![@deliveriq/mcp downloads](https://img.shields.io/npm/dm/@deliveriq/mcp.svg?label=downloads)](https://www.npmjs.com/package/@deliveriq/mcp)
[![@deliveriq/sdk version](https://img.shields.io/npm/v/@deliveriq/sdk.svg?label=%40deliveriq%2Fsdk)](https://www.npmjs.com/package/@deliveriq/sdk)
[![@min8t.com/plugin-sdk version](https://img.shields.io/npm/v/@min8t.com/plugin-sdk.svg?label=%40min8t.com%2Fplugin-sdk)](https://www.npmjs.com/package/@min8t.com/plugin-sdk)
[![MCP Registry](https://img.shields.io/badge/MCP%20Registry-active-brightgreen)](https://registry.modelcontextprotocol.io/)
[![Davison-Francis/min8t-sdks MCP server](https://glama.ai/mcp/servers/Davison-Francis/min8t-sdks/badges/score.svg)](https://glama.ai/mcp/servers/Davison-Francis/min8t-sdks)

Open-source SDKs and MCP server for the [DeliverIQ](https://min8t.com/deliveriq)
email verification platform and the [Min8T](https://min8t.com) email editor.

This repository hosts three published npm packages:

| Package | Description | Path |
|---|---|---|
| [`@deliveriq/mcp`](https://www.npmjs.com/package/@deliveriq/mcp) | MCP server — 12 tools for email deliverability inside Claude / Cursor / any MCP client | [`deliveriq-mcp/`](./deliveriq-mcp) |
| [`@deliveriq/sdk`](https://www.npmjs.com/package/@deliveriq/sdk) | Official Node.js SDK for the DeliverIQ API | [`deliveriq-sdk/`](./deliveriq-sdk) |
| [`@min8t.com/plugin-sdk`](https://www.npmjs.com/package/@min8t.com/plugin-sdk) | Embeddable email-editor SDK for web apps (UMD + ESM, framework-agnostic) | [`min8t-plugin-sdk/`](./min8t-plugin-sdk) |

---

## Quick start — DeliverIQ MCP server

The MCP server gives Claude (and any MCP-compatible client) tools for email
verification, sender reputation, DMARC analysis, and inbox-placement checks.

Add to `~/Library/Application Support/Claude/claude_desktop_config.json`:

```json
{
  "mcpServers": {
    "deliveriq": {
      "command": "npx",
      "args": ["-y", "@deliveriq/mcp"],
      "env": {
        "DELIVERIQ_API_KEY": "lc_your_api_key"
      }
    }
  }
}
```

Get an API key at [min8t.com/deliveriq](https://min8t.com/deliveriq)
(free tier available). Restart Claude Desktop. Done.

See [`deliveriq-mcp/README.md`](./deliveriq-mcp/README.md) for the full tool
reference, Cursor + Claude Code configs, and self-hosting notes.

---

## Quick start — DeliverIQ Node SDK

```bash
npm install @deliveriq/sdk
```

```ts
import { DeliverIQ } from '@deliveriq/sdk';

const client = new DeliverIQ({ apiKey: process.env.DELIVERIQ_API_KEY });

const result = await client.verify('alice@example.com');
console.log(result);  // { deliverable: true, reason: 'mailbox-exists', score: 0.97 }
```

See [`deliveriq-sdk/README.md`](./deliveriq-sdk/README.md) for the full
reference.

---

## Quick start — Min8T Plugin SDK

Embed the full Min8T email editor in any web app:

```html
<script src="https://unpkg.com/@min8t.com/plugin-sdk@latest/dist/plugin-sdk.umd.js"></script>
<div id="editor"></div>
<script>
  Min8T.init({
    container: '#editor',
    pluginToken: 'es_plugin_...',
  });
</script>
```

See [`min8t-plugin-sdk/README.md`](./min8t-plugin-sdk/README.md) for ESM,
React, Vue, and Angular bindings.

---

## License

MIT — see [LICENSE](./LICENSE). Each package directory ships its own copy
of the license and a per-package README for users who land via npm.

## Contributing

Issues and PRs welcome. See [`ROADMAP.md`](./ROADMAP.md) for what we'd love
help on.
