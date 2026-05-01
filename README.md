# Min8T SDKs

Open-source SDKs and MCP server for the [DeliverIQ](https://deliveriq.com) email
verification platform and the [Min8T](https://min8t.com) email editor.

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

Get an API key at [deliveriq.com](https://deliveriq.com) (free tier
available). Restart Claude Desktop. Done.

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
