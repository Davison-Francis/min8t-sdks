#!/usr/bin/env node

/**
 * DeliverIQ MCP Server
 *
 * Provides 12 tools for AI agents to interact with the DeliverIQ email
 * verification API: single/batch verification, email finder, domain
 * intelligence (DNSBL, SPF/DKIM/DMARC, spam traps), and account management.
 */

import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { DeliverIQ } from '@deliveriq/sdk';
import { SERVER_NAME, SERVER_VERSION } from './constants.js';
import { registerVerificationTools } from './tools/verification.js';
import { registerIntelligenceTools } from './tools/intelligence.js';
import { registerAccountTools } from './tools/account.js';

async function main(): Promise<void> {
  const apiKey = process.env.DELIVERIQ_API_KEY;
  if (!apiKey) {
    console.error('ERROR: DELIVERIQ_API_KEY environment variable is required.');
    console.error('Set it with: export DELIVERIQ_API_KEY=lc_your_key_here');
    console.error('');
    console.error('Get your API key at: https://min8t.com/deliveriq');
    process.exit(1);
  }

  const client = new DeliverIQ({
    apiKey,
    baseUrl: process.env.DELIVERIQ_BASE_URL ?? undefined,
  });

  const server = new McpServer({
    name: SERVER_NAME,
    version: SERVER_VERSION,
  });

  registerVerificationTools(server, client);
  registerIntelligenceTools(server, client);
  registerAccountTools(server, client);

  const transport = new StdioServerTransport();
  await server.connect(transport);

  console.error(`${SERVER_NAME} v${SERVER_VERSION} running via stdio (12 tools)`);
}

main().catch((error: unknown) => {
  console.error('Server error:', error);
  process.exit(1);
});
