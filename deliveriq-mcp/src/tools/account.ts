import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import type { DeliverIQ } from '@deliveriq/sdk';
import { CheckCreditsSchema } from '../schemas/account.js';
import { handleSdkError, successResponse } from '../utils.js';

export function registerAccountTools(server: McpServer, client: DeliverIQ): void {
  // ── 12. deliveriq_check_credits ───────────────────────────────

  server.registerTool(
    'deliveriq_check_credits',
    {
      title: 'Check Credit Balance',
      description: `Check current credit balance, usage breakdown, and plan information. Use this before performing credit-consuming operations to verify sufficient balance.

Returns:
  Remaining credits, plan tier, billing period, and usage breakdown by category (single, batch, ESP sync).

Examples:
  - "How many credits do I have left?" -> {}
  - "What's my usage this month?" -> {}

Credit cost: Free`,
      inputSchema: CheckCreditsSchema,
      annotations: {
        readOnlyHint: true,
        destructiveHint: false,
        idempotentHint: true,
        openWorldHint: true,
      },
    },
    async () => {
      try {
        const res = await client.account.usage();

        const lines = [
          '# Credit Balance',
          '',
          `**Remaining**: ${res.remaining.toLocaleString()} of ${res.limit.toLocaleString()} credits`,
          `**Used**: ${res.used.toLocaleString()} (${((res.used / res.limit) * 100).toFixed(1)}%)`,
          `**Plan**: ${res.plan}`,
          `**Period**: ${res.periodStart} to ${res.periodEnd}`,
          '',
          '## Usage Breakdown',
          `| Category | Credits |`,
          `|----------|---------|`,
          `| Single verification | ${res.breakdown.single} |`,
          `| Batch verification | ${res.breakdown.batch} |`,
          `| ESP sync | ${res.breakdown.espSync} |`,
          `| **Total** | **${res.used}** |`,
        ];

        if (res.dailyUsage.length > 0) {
          lines.push('', '## Recent Daily Usage');
          const recent = res.dailyUsage.slice(-7);
          lines.push('| Date | Credits |', '|------|---------|');
          for (const day of recent) {
            lines.push(`| ${day.date} | ${day.count} |`);
          }
        }

        return successResponse(lines.join('\n'));
      } catch (error) {
        return handleSdkError(error);
      }
    },
  );
}
