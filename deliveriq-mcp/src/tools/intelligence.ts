import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import type { DeliverIQ } from '@deliveriq/sdk';
import {
  FindEmailSchema,
  BlacklistCheckSchema,
  InfrastructureCheckSchema,
  SpamTrapAnalysisSchema,
  DomainIntelSchema,
  OrgIntelSchema,
} from '../schemas/intelligence.js';
import { handleSdkError, successResponse } from '../utils.js';

export function registerIntelligenceTools(server: McpServer, client: DeliverIQ): void {
  // ── 6. deliveriq_find_email ───────────────────────────────────

  server.registerTool(
    'deliveriq_find_email',
    {
      title: 'Find Business Email',
      description: `Find a person's business email address by name and company domain. Uses pattern generation, SMTP probing, corroboration from public sources, and org intelligence.

Args:
  - first_name (string): Person's first name
  - last_name (string): Person's last name
  - domain (string, optional): Company domain (e.g. "acme.com"). Required if company_name is not set
  - middle_name (string, optional): Middle name for disambiguation
  - company_name (string, optional): Company name, used to resolve domain if domain is not provided

Returns:
  Found email address, confidence score and label, verification method, and domain context.

Examples:
  - "Find John Doe at acme.com" -> { first_name: "John", last_name: "Doe", domain: "acme.com" }
  - "Find Jane Smith at Globex Corp" -> { first_name: "Jane", last_name: "Smith", company_name: "Globex Corp" }

Credit cost: 2 credits per lookup`,
      inputSchema: FindEmailSchema,
      annotations: {
        readOnlyHint: false,
        destructiveHint: false,
        idempotentHint: true,
        openWorldHint: true,
      },
    },
    async (params) => {
      try {
        const res = await client.emailFinder.find({
          firstName: params.first_name,
          lastName: params.last_name,
          domain: params.domain,
          middleName: params.middle_name,
          companyName: params.company_name,
        });

        const r = res.result;
        const lines = [
          `# Email Finder: ${res.firstName} ${res.lastName} @ ${res.domain}`,
          '',
        ];

        if (r.email) {
          lines.push(
            `**Email**: ${r.email}`,
            `**Confidence**: ${r.confidence}% (${r.confidenceLabel})`,
            `**Method**: ${r.verificationMethod.replace(/_/g, ' ')}`,
          );
          if (r.pattern) lines.push(`**Pattern**: ${r.pattern}`);
        } else {
          lines.push('**Result**: No email found.');
          if (r.probeDetails?.failureReason) {
            lines.push(`**Reason**: ${r.probeDetails.failureReason}`);
          }
        }

        lines.push(
          '',
          '## Domain Context',
          `- MX Provider: ${r.domainContext.mxProvider ?? 'Unknown'}`,
          `- Catch-all: ${r.domainContext.isCatchAll ? 'Yes' : 'No'}`,
          `- Infrastructure Score: ${r.domainContext.infrastructureScore ?? 'N/A'}`,
        );

        if (r.corroboration && r.corroboration.signals.length > 0) {
          lines.push('', '## Corroboration');
          for (const sig of r.corroboration.signals) {
            lines.push(`- ${sig.source}: ${sig.found ? 'Found' : 'Not found'}${sig.matchedEmail ? ` (${sig.matchedEmail})` : ''}`);
          }
        }

        lines.push('', `*Completed in ${r.durationMs}ms*`);
        return successResponse(lines.join('\n'));
      } catch (error) {
        return handleSdkError(error);
      }
    },
  );

  // ── 7. deliveriq_blacklist_check ──────────────────────────────

  server.registerTool(
    'deliveriq_blacklist_check',
    {
      title: 'DNSBL Blacklist Check',
      description: `Check a domain's IP against 50 DNSBL (DNS-based Blackhole List) zones across 6 categories: spam, proxy, dynamic, domain reputation, backscatter, and general.

Args:
  - domain (string): Domain to check (e.g. "example.com")

Returns:
  Listed/clean status, number of hits, and details per zone.

Examples:
  - "Is example.com blacklisted?" -> { domain: "example.com" }

Credit cost: 1 credit`,
      inputSchema: BlacklistCheckSchema,
      annotations: {
        readOnlyHint: false,
        destructiveHint: false,
        idempotentHint: true,
        openWorldHint: true,
      },
    },
    async (params) => {
      try {
        const res = await client.tools.blacklistCheck(params.domain);
        const r = res.result;
        const listedHits = r.hits.filter((h) => h.listed);

        const lines = [
          `# DNSBL Check: ${res.domain}`,
          '',
          `**Status**: ${r.listed ? `LISTED on ${listedHits.length} of ${r.checkedZones} zones` : `CLEAN (${r.checkedZones} zones checked)`}`,
          `**MX Records**: ${res.hasMx ? 'Present' : 'Missing'}`,
        ];

        if (listedHits.length > 0) {
          lines.push('', '## Listings', '', '| Zone | Category | Meaning |', '|------|----------|---------|');
          for (const h of listedHits) {
            lines.push(`| ${h.zone} | ${h.category ?? '-'} | ${h.meaning ?? 'Listed'} |`);
          }
        }

        return successResponse(lines.join('\n'));
      } catch (error) {
        return handleSdkError(error);
      }
    },
  );

  // ── 8. deliveriq_infrastructure_check ─────────────────────────

  server.registerTool(
    'deliveriq_infrastructure_check',
    {
      title: 'Email Infrastructure Check',
      description: `Analyze a domain's email infrastructure: SPF, DKIM, DMARC, MTA-STS, BIMI, TLS-RPT records and MX configuration.

Args:
  - domain (string): Domain to analyze (e.g. "example.com")

Returns:
  Infrastructure score (0-100) and detailed analysis of each protocol.

Examples:
  - "Check example.com email setup" -> { domain: "example.com" }

Credit cost: 1 credit`,
      inputSchema: InfrastructureCheckSchema,
      annotations: {
        readOnlyHint: false,
        destructiveHint: false,
        idempotentHint: true,
        openWorldHint: true,
      },
    },
    async (params) => {
      try {
        const res = await client.tools.infrastructureCheck(params.domain);
        const infra = res.result.infrastructure;
        const mx = res.result.mx;

        const lines = [
          `# Infrastructure: ${res.domain}`,
          '',
          `**Score**: ${infra.score}/100`,
          '',
          '## Protocols',
          `- **SPF**: ${infra.hasSpf ? 'Present' : 'Missing'}${infra.spfAnalysis ? ` (${infra.spfAnalysis.allQualifier}, ${infra.spfAnalysis.dnsLookupCount} DNS lookups${infra.spfAnalysis.exceedsLookupLimit ? ' — EXCEEDS LIMIT' : ''})` : ''}`,
          `- **DKIM**: ${infra.hasDkim ? `Present (${infra.dkimKeyType ?? 'unknown'} ${infra.dkimKeyBits ?? '?'}-bit)` : 'Missing'}`,
          `- **DMARC**: ${infra.hasDmarc ? `Present (policy: ${infra.dmarcPolicy})` : 'Missing'}`,
          `- **MTA-STS**: ${infra.hasMtaSts ? 'Present' : 'Missing'}`,
          `- **BIMI**: ${infra.hasBimi ? 'Present' : 'Missing'}`,
          `- **TLS-RPT**: ${infra.hasTlsRpt ? 'Present' : 'Missing'}`,
          '',
          '## MX Records',
          `- **Valid**: ${mx.valid ? 'Yes' : 'No'}`,
        ];

        if (mx.records.length > 0) {
          lines.push('- **Records**:');
          for (const rec of mx.records) {
            lines.push(`  - ${rec.exchange} (priority: ${rec.priority})`);
          }
        }

        if (infra.dmarcAnalysis) {
          const d = infra.dmarcAnalysis;
          lines.push(
            '',
            '## DMARC Details',
            `- Policy: ${d.policy} | Subdomain: ${d.subdomainPolicy}`,
            `- DKIM alignment: ${d.dkimAlignment} | SPF alignment: ${d.spfAlignment}`,
            `- Reporting: ${d.reportingConfigured ? 'Configured' : 'Not configured'}`,
          );
          if (d.warnings.length > 0) {
            lines.push(`- Warnings: ${d.warnings.join('; ')}`);
          }
        }

        return successResponse(lines.join('\n'));
      } catch (error) {
        return handleSdkError(error);
      }
    },
  );

  // ── 9. deliveriq_spam_trap_analysis ───────────────────────────

  server.registerTool(
    'deliveriq_spam_trap_analysis',
    {
      title: 'Spam Trap Analysis',
      description: `Analyze an email address for spam trap risk using 13 signals including domain age, DNSBL listing, disposability, role-based detection, entropy, and email pattern trust.

Args:
  - email (string): Email address to analyze

Returns:
  Risk level (low/medium/high), trap type (pristine/recycled/typo/none), confidence score, and all 13 signals.

Examples:
  - "Is user@example.com a spam trap?" -> { email: "user@example.com" }

Credit cost: 1 credit`,
      inputSchema: SpamTrapAnalysisSchema,
      annotations: {
        readOnlyHint: false,
        destructiveHint: false,
        idempotentHint: true,
        openWorldHint: true,
      },
    },
    async (params) => {
      try {
        const res = await client.tools.spamTrapAnalysis(params.email);
        const r = res.result;

        const lines = [
          `# Spam Trap Analysis: ${res.email}`,
          '',
          `**Risk Level**: ${r.riskLevel.toUpperCase()} | **Trap Type**: ${r.trapType} | **Confidence**: ${(r.confidence * 100).toFixed(0)}%`,
          `**Score**: ${r.score.toFixed(3)}`,
          '',
          '## Signals',
          `| Signal | Value |`,
          `|--------|-------|`,
          `| Domain age | ${r.signals.domainAge ? `${r.signals.domainAge.ageDays} days (${r.signals.domainAge.riskLevel})` : 'Unknown'} |`,
          `| DNSBL listed | ${r.signals.dnsblListed ? `Yes (${r.signals.dnsblHitCount} hits)` : 'No'} |`,
          `| Disposable | ${r.signals.isDisposable ? 'Yes' : 'No'} |`,
          `| Role-based | ${r.signals.isRoleBased ? 'Yes' : 'No'} |`,
          `| Has Gravatar | ${r.signals.hasGravatar ? 'Yes' : 'No'} |`,
          `| Has MX | ${r.signals.hasMx ? 'Yes' : 'No'} |`,
          `| Local part entropy | ${r.signals.localPartEntropy.toFixed(2)} |`,
          `| Email pattern trust | ${(r.signals.emailPatternTrust * 100).toFixed(0)}% |`,
          `| Email pattern | ${r.signals.emailPattern ?? 'None detected'} |`,
          `| Has suggestion | ${r.signals.hasSuggestion ? 'Yes (possible typo)' : 'No'} |`,
          `| MX has PTR | ${r.signals.mxHasPtrRecord === null ? 'Unknown' : r.signals.mxHasPtrRecord ? 'Yes' : 'No'} |`,
          `| MX IP DNSBL listed | ${r.signals.mxIpDnsblListed === null ? 'Unknown' : r.signals.mxIpDnsblListed ? 'Yes' : 'No'} |`,
        ];

        return successResponse(lines.join('\n'));
      } catch (error) {
        return handleSdkError(error);
      }
    },
  );

  // ── 10. deliveriq_domain_intel ────────────────────────────────

  server.registerTool(
    'deliveriq_domain_intel',
    {
      title: 'Comprehensive Domain Intelligence',
      description: `Get a comprehensive intelligence report for a domain including MX records, DNSBL status, email infrastructure (SPF/DKIM/DMARC), domain age, ISP profile, and trust score.

This is a combined report — if you only need one aspect, use the more specific tools (deliveriq_blacklist_check, deliveriq_infrastructure_check) instead.

Args:
  - domain (string): Domain to analyze (e.g. "example.com")

Returns:
  Complete domain intelligence report with trust score.

Examples:
  - "Full report on example.com" -> { domain: "example.com" }

Credit cost: 1 credit (heavy rate limit: 10 req/min)`,
      inputSchema: DomainIntelSchema,
      annotations: {
        readOnlyHint: false,
        destructiveHint: false,
        idempotentHint: true,
        openWorldHint: true,
      },
    },
    async (params) => {
      try {
        const res = await client.tools.domainIntel(params.domain);
        const r = res.result;

        const lines = [
          `# Domain Intelligence: ${res.domain}`,
          '',
          `**Trust Score**: ${r.domainTrust.score}/100`,
          '',
          '## MX Records',
          `- Valid: ${r.mx.valid ? 'Yes' : 'No'}`,
        ];

        if (r.mx.records.length > 0) {
          for (const rec of r.mx.records) {
            lines.push(`- ${rec.exchange} (priority: ${rec.priority})`);
          }
        }

        const listedHits = r.dnsbl.hits.filter((h) => h.listed);
        lines.push(
          '',
          '## DNSBL',
          `- Status: ${r.dnsbl.listed ? `LISTED on ${listedHits.length}/${r.dnsbl.checkedZones} zones` : `Clean (${r.dnsbl.checkedZones} zones)`}`,
        );

        lines.push(
          '',
          '## Infrastructure',
          `- Score: ${r.infrastructure.score}/100`,
          `- SPF: ${r.infrastructure.hasSpf ? 'Yes' : 'No'} | DKIM: ${r.infrastructure.hasDkim ? 'Yes' : 'No'} | DMARC: ${r.infrastructure.hasDmarc ? 'Yes' : 'No'}`,
          `- MTA-STS: ${r.infrastructure.hasMtaSts ? 'Yes' : 'No'} | BIMI: ${r.infrastructure.hasBimi ? 'Yes' : 'No'}`,
        );

        lines.push(
          '',
          '## Domain Age',
          `- Age: ${r.domainAge.ageDays} days (${r.domainAge.riskLevel})`,
        );
        if (r.domainAge.registeredDate) {
          lines.push(`- Registered: ${r.domainAge.registeredDate}`);
        }

        if (r.ispProfile) {
          lines.push('', '## ISP Profile', `- Name: ${r.ispProfile.name}`, `- Category: ${r.ispProfile.category}`);
        }

        if (Object.keys(r.domainTrust.factors).length > 0) {
          lines.push('', '## Trust Factors');
          for (const [factor, score] of Object.entries(r.domainTrust.factors)) {
            lines.push(`- ${factor}: ${score}`);
          }
        }

        return successResponse(lines.join('\n'));
      } catch (error) {
        return handleSdkError(error);
      }
    },
  );

  // ── 11. deliveriq_org_intel ───────────────────────────────────

  server.registerTool(
    'deliveriq_org_intel',
    {
      title: 'Organization Intelligence',
      description: `Query the organization intelligence database for a domain. Returns email patterns, verified contact count, and company name. Free — no credits charged.

This data is populated by the enrichment system. If no data exists, use deliveriq_find_email to trigger enrichment for the domain.

Args:
  - domain (string): Company domain (e.g. "acme.com")

Returns:
  Primary email pattern, confidence, verified contact count, and all observed patterns.

Examples:
  - "What email patterns does acme.com use?" -> { domain: "acme.com" }

Credit cost: Free`,
      inputSchema: OrgIntelSchema,
      annotations: {
        readOnlyHint: true,
        destructiveHint: false,
        idempotentHint: true,
        openWorldHint: true,
      },
    },
    async (params) => {
      try {
        const res = await client.tools.orgIntel(params.domain);

        if (!res.result) {
          return successResponse(
            `# Organization Intelligence: ${res.domain}\n\nNo data available for this domain. ` +
            `Use \`deliveriq_find_email\` to trigger enrichment for this domain.`,
          );
        }

        const r = res.result;
        const lines = [
          `# Organization Intelligence: ${r.domain}`,
          '',
        ];

        if (r.companyName) lines.push(`**Company**: ${r.companyName}`);
        lines.push(
          `**Primary Pattern**: ${r.primaryPattern ?? 'Not determined'}`,
          `**Pattern Confidence**: ${(r.primaryPatternConfidence * 100).toFixed(0)}%`,
          `**Verified Contacts**: ${r.verifiedContactCount}`,
        );

        if (r.patterns.length > 0) {
          lines.push('', '## Email Patterns', '', '| Pattern | Confidence | Verified | Share |', '|---------|-----------|----------|-------|');
          for (const p of r.patterns) {
            lines.push(`| ${p.pattern} | ${(p.confidence * 100).toFixed(0)}% | ${p.verifiedCount} | ${(p.share * 100).toFixed(0)}% |`);
          }
        }

        if (r.lastEnrichedAt) {
          lines.push('', `*Last enriched: ${r.lastEnrichedAt}*`);
        }

        return successResponse(lines.join('\n'));
      } catch (error) {
        return handleSdkError(error);
      }
    },
  );
}
