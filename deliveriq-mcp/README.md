# @deliveriq/mcp

Official MCP (Model Context Protocol) server for the
[DeliverIQ](https://deliveriq.com) email verification API. Provides
**12 tools** for AI agents in Claude Desktop, Claude Code, Cursor, and any
other MCP-compatible client.

[![npm](https://img.shields.io/npm/v/@deliveriq/mcp.svg)](https://www.npmjs.com/package/@deliveriq/mcp)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](./LICENSE)

## Installation

No separate install step needed — `npx -y @deliveriq/mcp` will fetch and run
the server on demand.

### Claude Desktop

Add to `~/Library/Application Support/Claude/claude_desktop_config.json`
(macOS) or `%APPDATA%\Claude\claude_desktop_config.json` (Windows):

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

Restart Claude Desktop. You should see the 12 DeliverIQ tools available.

### Claude Code

```bash
claude mcp add deliveriq npx -y @deliveriq/mcp \
  -e DELIVERIQ_API_KEY=lc_your_api_key
```

### Cursor

Add to `.cursor/mcp.json`:

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

### Get an API key

Sign up at [deliveriq.com](https://deliveriq.com). The free tier includes
enough credits for the demo flow + ongoing low-volume use. Keys are issued
in the format `lc_prefix_secret`.

## Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `DELIVERIQ_API_KEY` | Yes | API key (format: `lc_prefix_secret`) |
| `DELIVERIQ_BASE_URL` | No | Override API URL (default: `https://api.deliveriq.com/v1`) |

## Tools (12)

### Verification

| Tool | Description | Credits |
|------|-------------|---------|
| `deliveriq_verify_email` | Verify a single email for deliverability | 1 |
| `deliveriq_batch_verify` | Submit batch of emails for async verification | 1/email |
| `deliveriq_batch_status` | Check batch job status and progress | Free |
| `deliveriq_batch_download` | Download completed batch results as CSV | Free |
| `deliveriq_list_jobs` | List verification jobs with pagination | Free |

### Intelligence

| Tool | Description | Credits |
|------|-------------|---------|
| `deliveriq_find_email` | Find business email by name + domain | 2 |
| `deliveriq_blacklist_check` | Check domain against 50 DNSBL zones | 1 |
| `deliveriq_infrastructure_check` | Analyze SPF/DKIM/DMARC/MTA-STS/BIMI | 1 |
| `deliveriq_spam_trap_analysis` | Evaluate spam trap risk (13 signals) | 1 |
| `deliveriq_domain_intel` | Comprehensive domain trust report | 1 |
| `deliveriq_org_intel` | Query organization email patterns | Free |

### Account

| Tool | Description | Credits |
|------|-------------|---------|
| `deliveriq_check_credits` | Check credit balance and usage stats | Free |

## Why MCP?

Email deliverability is one of those problems where the right answer needs
6–8 API calls (verify → reputation → DMARC → blocklist → infrastructure → ...).
Letting Claude orchestrate these as tools is ~10× more useful than shipping
another dashboard — the model can plan, branch on results, and explain the
verdict in plain English.

## Development

```bash
# Clone the monorepo
git clone https://github.com/Davison-Francis/min8t-sdks.git
cd min8t-sdks/deliveriq-mcp

# Install + build
npm install
npm run build

# Watch mode
npm run dev

# Run directly against the published API
DELIVERIQ_API_KEY=lc_your_key node dist/index.js

# Or against a local DeliverIQ service
DELIVERIQ_API_KEY=lc_test \
  DELIVERIQ_BASE_URL=http://localhost:3019/api/v1 \
  node dist/index.js
```

## Requirements

- Node.js 18+
- DeliverIQ API key

## Roadmap

See [`../ROADMAP.md`](../ROADMAP.md) for upcoming work, or open an issue to
propose a tool.

## License

MIT — see [LICENSE](./LICENSE).
