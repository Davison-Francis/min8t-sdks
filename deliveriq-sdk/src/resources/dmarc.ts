import type { HttpClient } from '../http';
import type {
  DmarcMonitoredDomain,
  DmarcDomainSummary,
  DmarcDomainVerification,
  DmarcGenerateRecordParams,
  DmarcGeneratedRecord,
  DmarcDnsCheckResult,
  DmarcDomainAnalysis,
  DmarcReportsPage,
  DmarcReportListParams,
  DmarcAnalytics,
  DmarcAnalyticsParams,
  DmarcSendingSource,
  DmarcSourceIpDetail,
  DmarcSourcesParams,
  DmarcTimelinePoint,
  DmarcTimelineParams,
  DmarcDnsHistoryParams,
  DmarcAlertConfig,
  DmarcCreateAlertParams,
  RequestOptions,
} from '../types';

export class Dmarc {
  constructor(private readonly http: HttpClient) {}

  // ── Domain Management ──────────────────────────────────────

  /** Add a domain for DMARC monitoring. */
  async addDomain(domain: string, opts?: RequestOptions): Promise<{ success: true; data: DmarcMonitoredDomain }> {
    return this.http.post('/dmarc/domains', { domain }, opts);
  }

  /** List all monitored domains with compliance summaries. */
  async listDomains(opts?: RequestOptions): Promise<{ success: true; data: DmarcDomainSummary[] }> {
    return this.http.get('/dmarc/domains', opts);
  }

  /** Get a single monitored domain by ID. */
  async getDomain(domainId: string, opts?: RequestOptions): Promise<{ success: true; data: DmarcMonitoredDomain }> {
    return this.http.get(`/dmarc/domains/${enc(domainId)}`, opts);
  }

  /** Remove a domain from monitoring. */
  async removeDomain(domainId: string, opts?: RequestOptions): Promise<{ success: true; data: { message: string } }> {
    return this.http.delete(`/dmarc/domains/${enc(domainId)}`, opts);
  }

  /** Trigger DNS verification for a monitored domain. */
  async verifyDomain(domainId: string, opts?: RequestOptions): Promise<{ success: true; data: DmarcDomainVerification }> {
    return this.http.post(`/dmarc/domains/${enc(domainId)}/verify`, {}, opts);
  }

  // ── Wizard ─────────────────────────────────────────────────

  /** Generate a DMARC TXT record from parameters. */
  async generateRecord(params: DmarcGenerateRecordParams, opts?: RequestOptions): Promise<{ success: true; data: DmarcGeneratedRecord }> {
    return this.http.post('/dmarc/wizard/generate', params, opts);
  }

  /** Check current DMARC/SPF/DKIM DNS records for a domain. */
  async checkDns(domain: string, opts?: RequestOptions): Promise<{ success: true; data: DmarcDnsCheckResult }> {
    return this.http.post('/dmarc/wizard/check-dns', { domain }, opts);
  }

  /** Full domain analysis: DNS check + smart record generation. */
  async analyzeDomain(domain: string, opts?: RequestOptions): Promise<{ success: true; data: DmarcDomainAnalysis }> {
    return this.http.post('/dmarc/wizard/analyze-domain', { domain }, opts);
  }

  // ── Reports & Analytics ────────────────────────────────────

  /** List DMARC aggregate reports for a domain (paginated). */
  async getReports(domainId: string, params?: DmarcReportListParams, opts?: RequestOptions): Promise<{ success: true; data: DmarcReportsPage }> {
    const qs = buildQuery({ page: params?.page, limit: params?.limit });
    return this.http.get(`/dmarc/domains/${enc(domainId)}/reports${qs}`, opts);
  }

  /** Get DMARC compliance analytics for a domain. */
  async getAnalytics(domainId: string, params?: DmarcAnalyticsParams, opts?: RequestOptions): Promise<{ success: true; data: DmarcAnalytics }> {
    const qs = buildQuery({ days: params?.days });
    return this.http.get(`/dmarc/domains/${enc(domainId)}/analytics${qs}`, opts);
  }

  /** List sending sources (IPs) for a domain. */
  async getSources(domainId: string, params?: DmarcSourcesParams, opts?: RequestOptions): Promise<{ success: true; data: DmarcSendingSource[] }> {
    const qs = buildQuery({ days: params?.days });
    return this.http.get(`/dmarc/domains/${enc(domainId)}/sources${qs}`, opts);
  }

  /** Get detailed info about a specific sending source IP. */
  async getSourceDetail(domainId: string, ip: string, opts?: RequestOptions): Promise<{ success: true; data: DmarcSourceIpDetail }> {
    return this.http.get(`/dmarc/domains/${enc(domainId)}/sources/${enc(ip)}`, opts);
  }

  /** Get DMARC compliance timeline data points. */
  async getTimeline(domainId: string, params?: DmarcTimelineParams, opts?: RequestOptions): Promise<{ success: true; data: DmarcTimelinePoint[] }> {
    const qs = buildQuery({ days: params?.days, granularity: params?.granularity });
    return this.http.get(`/dmarc/domains/${enc(domainId)}/timeline${qs}`, opts);
  }

  /** Get DNS check history snapshots for a domain. */
  async getDnsHistory(domainId: string, params?: DmarcDnsHistoryParams, opts?: RequestOptions): Promise<{ success: true; data: DmarcDnsCheckResult[] }> {
    const qs = buildQuery({ limit: params?.limit });
    return this.http.get(`/dmarc/domains/${enc(domainId)}/dns-history${qs}`, opts);
  }

  // ── Alerts ─────────────────────────────────────────────────

  /** Create an alert configuration for a domain. */
  async createAlert(domainId: string, params: DmarcCreateAlertParams, opts?: RequestOptions): Promise<{ success: true; data: DmarcAlertConfig }> {
    return this.http.post(`/dmarc/domains/${enc(domainId)}/alerts`, params, opts);
  }

  /** List alert configurations for a domain. */
  async listAlerts(domainId: string, opts?: RequestOptions): Promise<{ success: true; data: DmarcAlertConfig[] }> {
    return this.http.get(`/dmarc/domains/${enc(domainId)}/alerts`, opts);
  }

  /** Send a test notification for an alert. */
  async testAlert(domainId: string, alertId: string, opts?: RequestOptions): Promise<{ success: true; data: { message: string } }> {
    return this.http.post(`/dmarc/domains/${enc(domainId)}/alerts/${enc(alertId)}/test`, {}, opts);
  }

  /** Delete an alert configuration. */
  async deleteAlert(domainId: string, alertId: string, opts?: RequestOptions): Promise<{ success: true; data: { message: string } }> {
    return this.http.delete(`/dmarc/domains/${enc(domainId)}/alerts/${enc(alertId)}`, opts);
  }
}

function enc(s: string): string {
  return encodeURIComponent(s);
}

function buildQuery(params: Record<string, string | number | undefined>): string {
  const qs = new URLSearchParams();
  for (const [k, v] of Object.entries(params)) {
    if (v !== undefined) qs.set(k, String(v));
  }
  const str = qs.toString();
  return str ? `?${str}` : '';
}
