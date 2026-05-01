import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import type { DeliverIQ } from '@deliveriq/sdk';
import {
  VerifyEmailSchema,
  BatchVerifySchema,
  BatchStatusSchema,
  BatchDownloadSchema,
  ListJobsSchema,
} from '../schemas/verification.js';
import { handleSdkError, successResponse } from '../utils.js';

export function registerVerificationTools(server: McpServer, client: DeliverIQ): void {
  // ── 1. deliveriq_verify_email ─────────────────────────────────

  server.registerTool(
    'deliveriq_verify_email',
    {
      title: 'Verify Email Address',
      description: `Verify a single email address for deliverability. Returns reachability status (safe/risky/invalid/unknown), a 0-100 score, and detailed checks (syntax, MX, SMTP, disposable, role-based, etc.).

Args:
  - email (string): Email address to verify
  - skip_smtp (boolean): Skip SMTP check (faster, default: false)
  - check_gravatar (boolean): Check for Gravatar profile (default: false)
  - check_hibp (boolean): Check Have I Been Pwned breaches (default: false)
  - include_intelligence (boolean): Include DNSBL, spam trap, domain age, infrastructure analysis (default: false)

Returns:
  Markdown report with reachability, score, and check details.

Examples:
  - "Is john@acme.com a valid email?" -> { email: "john@acme.com" }
  - "Deep check on user@example.com" -> { email: "user@example.com", include_intelligence: true, check_hibp: true }

Credit cost: 1 credit (0 if syntax is invalid)

Error Handling:
  - Returns "Authentication failed..." if API key is invalid
  - Returns "Insufficient credits..." if balance is 0`,
      inputSchema: VerifyEmailSchema,
      annotations: {
        readOnlyHint: false,
        destructiveHint: false,
        idempotentHint: true,
        openWorldHint: true,
      },
    },
    async (params) => {
      try {
        const res = await client.verify({
          email: params.email,
          options: {
            skipSmtp: params.skip_smtp,
            checkGravatar: params.check_gravatar,
            checkHibp: params.check_hibp,
            includeIntelligence: params.include_intelligence,
          },
        });

        const r = res.result;
        const lines: string[] = [
          `# Email Verification: ${r.email}`,
          '',
          `**Reachability**: ${r.reachability.toUpperCase()} | **Score**: ${r.score}/100 | **Credits Used**: ${res.creditsUsed}`,
          '',
          '## Checks',
          `- **Syntax**: ${r.syntax.valid ? 'Valid' : 'Invalid'}${r.syntax.error ? ` (${r.syntax.error})` : ''}`,
          `- **MX Records**: ${r.mx.valid ? `Valid (${r.mx.records.length} records)` : 'No MX records'}`,
          `- **SMTP**: ${r.smtp.isDeliverable === true ? 'Deliverable' : r.smtp.isDeliverable === false ? 'Not deliverable' : 'Unknown'} | Catch-all: ${r.smtp.isCatchAll ? 'Yes' : 'No'}`,
          `- **Disposable**: ${r.misc.isDisposable ? 'Yes' : 'No'} | Role-based: ${r.misc.isRoleBased ? 'Yes' : 'No'} | Free provider: ${r.misc.isFreeProvider ? 'Yes' : 'No'}`,
        ];

        if (r.misc.hasGravatar) lines.push('- **Gravatar**: Found');
        if (r.suggestion) lines.push(`- **Did you mean**: ${r.suggestion}`);

        if (r.intelligence?.dnsbl) {
          const d = r.intelligence.dnsbl;
          lines.push(`- **DNSBL**: ${d.listed ? `Listed on ${d.hits.filter((h) => h.listed).length}/${d.checkedZones} zones` : `Clean (${d.checkedZones} zones checked)`}`);
        }
        if (r.intelligence?.spamTrapClassification) {
          const s = r.intelligence.spamTrapClassification;
          lines.push(`- **Spam Trap**: ${s.riskLevel} risk (type: ${s.trapType}, confidence: ${(s.confidence * 100).toFixed(0)}%)`);
        }
        if (r.intelligence?.infrastructure) {
          const i = r.intelligence.infrastructure;
          lines.push(`- **Infrastructure**: Score ${i.score}/100 | SPF: ${i.hasSpf ? 'Yes' : 'No'} | DKIM: ${i.hasDkim ? 'Yes' : 'No'} | DMARC: ${i.hasDmarc ? 'Yes' : 'No'}`);
        }
        if (r.intelligence?.hibp) {
          lines.push(`- **HIBP**: ${r.intelligence.hibp.breached ? `Breached (${r.intelligence.hibp.breachCount} breaches)` : 'No breaches found'}`);
        }

        lines.push('', `*Verified in ${r.durationMs}ms*`);
        return successResponse(lines.join('\n'));
      } catch (error) {
        return handleSdkError(error);
      }
    },
  );

  // ── 2. deliveriq_batch_verify ─────────────────────────────────

  server.registerTool(
    'deliveriq_batch_verify',
    {
      title: 'Submit Batch Verification',
      description: `Submit a batch of email addresses for asynchronous verification. Returns a job ID for tracking.

Use deliveriq_batch_status to poll progress, and deliveriq_batch_download to get results when complete.

Args:
  - emails (string[]): Array of 1-10,000 email addresses
  - skip_smtp (boolean): Skip SMTP verification (default: false)
  - callback_url (string, optional): Webhook URL for batch.completed/batch.failed events

Returns:
  Job ID, status, estimated completion time, and status polling URL.

Examples:
  - "Verify these 3 emails" -> { emails: ["a@ex.com", "b@ex.com", "c@ex.com"] }
  - "Batch verify with webhook" -> { emails: [...], callback_url: "https://my-app.com/webhook" }

Credit cost: 1 credit per email`,
      inputSchema: BatchVerifySchema,
      annotations: {
        readOnlyHint: false,
        destructiveHint: false,
        idempotentHint: false,
        openWorldHint: true,
      },
    },
    async (params) => {
      try {
        const res = await client.batch.create({
          emails: params.emails,
          options: { skipSmtp: params.skip_smtp },
          callbackUrl: params.callback_url,
        });

        const lines = [
          `# Batch Verification Submitted`,
          '',
          `- **Job ID**: ${res.jobId}`,
          `- **Status**: ${res.status}`,
          `- **Total Emails**: ${res.totalEmails}`,
          `- **Estimated Time**: ${res.estimatedTimeSeconds}s`,
          '',
          `Use \`deliveriq_batch_status\` with job_id "${res.jobId}" to check progress.`,
        ];
        return successResponse(lines.join('\n'));
      } catch (error) {
        return handleSdkError(error);
      }
    },
  );

  // ── 3. deliveriq_batch_status ─────────────────────────────────

  server.registerTool(
    'deliveriq_batch_status',
    {
      title: 'Check Batch Job Status',
      description: `Check the status and progress of a batch verification job.

Args:
  - job_id (string): The job ID from deliveriq_batch_verify

Returns:
  Job status, progress percentage, and summary when complete.

Examples:
  - "Check job abc123" -> { job_id: "abc123" }

Credit cost: Free`,
      inputSchema: BatchStatusSchema,
      annotations: {
        readOnlyHint: true,
        destructiveHint: false,
        idempotentHint: true,
        openWorldHint: true,
      },
    },
    async (params) => {
      try {
        const res = await client.batch.status(params.job_id);

        const lines = [
          `# Batch Job: ${res.jobId}`,
          '',
          `- **Status**: ${res.status.toUpperCase()}`,
          `- **Progress**: ${res.progress.percentage}% (${res.progress.processed}/${res.progress.total})`,
          `- **Created**: ${res.createdAt}`,
        ];

        if (res.startedAt) lines.push(`- **Started**: ${res.startedAt}`);
        if (res.completedAt) lines.push(`- **Completed**: ${res.completedAt}`);
        if (res.expiresAt) lines.push(`- **Expires**: ${res.expiresAt}`);

        if (res.summary) {
          const s = res.summary;
          lines.push(
            '',
            '## Summary',
            `| Category | Count |`,
            `|----------|-------|`,
            `| Safe | ${s.safe} |`,
            `| Risky | ${s.risky} |`,
            `| Invalid | ${s.invalid} |`,
            `| Unknown | ${s.unknown} |`,
            `| Catch-all | ${s.catchAll} |`,
            `| Spam trap | ${s.spamTrap} |`,
            `| **Total** | **${s.total}** |`,
          );
          if (s.duplicatesRemoved) lines.push(``, `*${s.duplicatesRemoved} duplicates removed*`);
        }

        if (res.downloadUrl) {
          lines.push('', `Use \`deliveriq_batch_download\` with job_id "${res.jobId}" to download results.`);
        }

        return successResponse(lines.join('\n'));
      } catch (error) {
        return handleSdkError(error);
      }
    },
  );

  // ── 4. deliveriq_batch_download ───────────────────────────────

  server.registerTool(
    'deliveriq_batch_download',
    {
      title: 'Download Batch Results',
      description: `Download the results of a completed batch verification job as CSV.

Args:
  - job_id (string): The completed job ID
  - category (string, optional): Filter to "safe", "risky", "invalid", or "unknown" only

Returns:
  CSV text with verification results. Large results may be truncated.

Examples:
  - "Download results for job abc123" -> { job_id: "abc123" }
  - "Get only safe emails from job abc123" -> { job_id: "abc123", category: "safe" }

Credit cost: Free`,
      inputSchema: BatchDownloadSchema,
      annotations: {
        readOnlyHint: true,
        destructiveHint: false,
        idempotentHint: true,
        openWorldHint: true,
      },
    },
    async (params) => {
      try {
        const csv = await client.batch.download(params.job_id, params.category);
        const rowCount = csv.split('\n').length - 1;
        const header = `# Batch Results: ${params.job_id}${params.category ? ` (${params.category} only)` : ''}\n\n${rowCount} rows\n\n`;
        return successResponse(header + '```csv\n' + csv + '\n```');
      } catch (error) {
        return handleSdkError(error);
      }
    },
  );

  // ── 5. deliveriq_list_jobs ────────────────────────────────────

  server.registerTool(
    'deliveriq_list_jobs',
    {
      title: 'List Verification Jobs',
      description: `List batch verification jobs with pagination and optional status filter.

Args:
  - page (number): Page number (default: 1)
  - limit (number): Results per page (default: 20, max: 100)
  - status (string, optional): Filter by "pending", "processing", "completed", "failed", or "cancelled"

Returns:
  Table of jobs with ID, status, email count, and dates.

Credit cost: Free`,
      inputSchema: ListJobsSchema,
      annotations: {
        readOnlyHint: true,
        destructiveHint: false,
        idempotentHint: true,
        openWorldHint: true,
      },
    },
    async (params) => {
      try {
        const res = await client.batch.list({
          page: params.page,
          limit: params.limit,
          status: params.status,
        });

        if (res.jobs.length === 0) {
          return successResponse('No verification jobs found.' + (params.status ? ` (filter: ${params.status})` : ''));
        }

        const lines = [
          `# Verification Jobs`,
          '',
          `Page ${res.pagination.page} of ${res.pagination.totalPages} (${res.pagination.total} total)`,
          '',
          '| Job ID | Status | Emails | Created |',
          '|--------|--------|--------|---------|',
        ];

        for (const job of res.jobs) {
          lines.push(`| ${job.id} | ${job.status} | ${job.processedEmails}/${job.totalEmails} | ${job.createdAt} |`);
        }

        if (res.pagination.page < res.pagination.totalPages) {
          lines.push('', `*Use page: ${res.pagination.page + 1} to see more results.*`);
        }

        return successResponse(lines.join('\n'));
      } catch (error) {
        return handleSdkError(error);
      }
    },
  );
}
