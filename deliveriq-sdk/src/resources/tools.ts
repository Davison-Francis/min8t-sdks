import type { HttpClient } from '../http';
import type {
  BlacklistCheckResponse,
  InfrastructureCheckResponse,
  SpamTrapAnalysisResponse,
  DomainIntelResponse,
  OrgIntelResponse,
  EnrichDomainResponse,
  RequestOptions,
} from '../types';

export class Tools {
  constructor(private readonly http: HttpClient) {}

  /** Check a domain against 47 DNSBL zones. Costs 1 credit. */
  async blacklistCheck(domain: string, opts?: RequestOptions): Promise<BlacklistCheckResponse> {
    return this.http.post<BlacklistCheckResponse>('/tools/blacklist-check', { domain }, opts);
  }

  /** Analyze SPF, DKIM, DMARC, MTA-STS, BIMI, TLS-RPT records. Costs 1 credit. */
  async infrastructureCheck(domain: string, opts?: RequestOptions): Promise<InfrastructureCheckResponse> {
    return this.http.post<InfrastructureCheckResponse>('/tools/infrastructure-check', { domain }, opts);
  }

  /** Evaluate an email against 13 spam trap signals. Costs 1 credit. */
  async spamTrapAnalysis(email: string, opts?: RequestOptions): Promise<SpamTrapAnalysisResponse> {
    return this.http.post<SpamTrapAnalysisResponse>('/tools/spam-trap-analysis', { email }, opts);
  }

  /** Get comprehensive domain intelligence (MX, DNSBL, infra, age, trust). Costs 1 credit. */
  async domainIntel(domain: string, opts?: RequestOptions): Promise<DomainIntelResponse> {
    return this.http.post<DomainIntelResponse>('/tools/domain-intel', { domain }, opts);
  }

  /** Get organization intelligence for a domain. Free — no credit charge. */
  async orgIntel(domain: string, opts?: RequestOptions): Promise<OrgIntelResponse> {
    return this.http.get<OrgIntelResponse>(`/tools/org-intel/${encodeURIComponent(domain)}`, opts);
  }

  /** Trigger background domain enrichment. Free — no credit charge. */
  async enrichDomain(domain: string, opts?: RequestOptions): Promise<EnrichDomainResponse> {
    return this.http.post<EnrichDomainResponse>('/tools/enrich-domain', { domain }, opts);
  }
}
