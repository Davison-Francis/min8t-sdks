// ── Client Configuration ────────────────────────────────────

export interface DeliverIQConfig {
  /** API key (format: lc_{prefix}_{secret}) */
  apiKey: string;
  /** Base URL override (default: https://api.deliveriq.com/v1) */
  baseUrl?: string;
  /** Request timeout in ms (default: 30000) */
  timeout?: number;
  /** Max retries on 429/5xx (default: 3) */
  maxRetries?: number;
}

export interface RequestOptions {
  /** AbortSignal for request cancellation */
  signal?: AbortSignal;
}

// ── Verification ────────────────────────────────────────────

export interface VerifyOptions {
  skipSmtp?: boolean;
  checkGravatar?: boolean;
  checkHibp?: boolean;
  includeIntelligence?: boolean;
}

export interface VerifyRequest {
  email: string;
  options?: VerifyOptions;
}

export type Reachability = 'safe' | 'risky' | 'invalid' | 'unknown';

export interface SyntaxResult {
  valid: boolean;
  localPart: string;
  domain: string;
  normalizedEmail: string;
  error?: string;
}

export interface MxResult {
  valid: boolean;
  records: Array<{ exchange: string; priority: number }>;
  error?: string;
}

export interface SmtpResult {
  canConnect: boolean;
  isDeliverable: boolean | null;
  isCatchAll: boolean;
  hasFullInbox: boolean;
  isDisabled: boolean;
  responseCode?: number;
  responseMessage?: string;
  error?: string;
}

export interface MiscResult {
  isDisposable: boolean;
  isRoleBased: boolean;
  isFreeProvider: boolean;
  hasGravatar: boolean;
  isAliased: boolean;
  aliasOf?: string;
  emailPattern?: string;
  emailPatternTrust?: number;
}

export interface DnsblHit {
  zone: string;
  listed: boolean;
  returnCode?: string;
  meaning?: string;
  category?: 'spam' | 'proxy' | 'dynamic' | 'domain' | 'backscatter' | 'general';
}

export interface DnsblResult {
  listed: boolean;
  hits: DnsblHit[];
  checkedZones: number;
  error?: string;
  warning?: string;
}

export interface DomainAgeResult {
  ageDays: number;
  registeredDate?: string;
  riskLevel: 'new' | 'young' | 'normal' | 'established';
}

export interface SpamTrapClassification {
  score: number;
  riskLevel: 'low' | 'medium' | 'high';
  trapType: 'pristine' | 'recycled' | 'typo' | 'none' | 'unknown';
  confidence: number;
}

export interface IspProfile {
  name: string;
  category: string;
}

export interface SpfAnalysis {
  raw: string;
  valid: boolean;
  allQualifier: string;
  dnsLookupCount: number;
  exceedsLookupLimit: boolean;
  includes: string[];
  mechanisms: string[];
  warnings: string[];
}

export interface DmarcAnalysis {
  raw: string;
  valid: boolean;
  policy: string;
  subdomainPolicy: string;
  dkimAlignment: string;
  spfAlignment: string;
  reportingConfigured: boolean;
  forensicReporting: boolean;
  reportUris: string[];
  pct: number;
  warnings: string[];
}

export interface InfrastructureResult {
  hasSpf: boolean;
  spfAnalysis: SpfAnalysis | null;
  hasDkim: boolean;
  dkimSelector: string | null;
  dkimKeyType: string | null;
  dkimKeyBits: number | null;
  hasDmarc: boolean;
  dmarcPolicy: string | null;
  dmarcAnalysis: DmarcAnalysis | null;
  hasMtaSts: boolean;
  hasBimi: boolean;
  hasTlsRpt: boolean;
  score: number;
}

export interface MxServerReputation {
  hasPtrRecord: boolean;
  ipDnsblListed: boolean;
}

export interface HibpResult {
  breached: boolean;
  breachCount: number;
}

export interface IntelligenceResult {
  dnsbl: DnsblResult | null;
  spamTrapScore: number;
  spamTrapClassification?: SpamTrapClassification;
  domainAge: DomainAgeResult | null;
  hibp: HibpResult | null;
  ispProfile: IspProfile | null;
  infrastructure: InfrastructureResult | null;
  mxServerReputation: MxServerReputation | null;
}

export interface VerificationResult {
  email: string;
  reachability: Reachability;
  score: number;
  syntax: SyntaxResult;
  mx: MxResult;
  smtp: SmtpResult;
  misc: MiscResult;
  intelligence: IntelligenceResult;
  suggestion?: string;
  verifiedAt: string;
  durationMs: number;
}

export interface VerifyResponse {
  success: true;
  result: VerificationResult;
  creditsUsed: number;
}

// ── Batch Verification ──────────────────────────────────────

export interface BatchOptions {
  skipSmtp?: boolean;
  checkGravatar?: boolean;
  checkHibp?: boolean;
  skipIntelligence?: boolean;
}

export interface BatchCreateRequest {
  emails: string[];
  options?: BatchOptions;
  callbackUrl?: string;
}

export interface BatchCreateResponse {
  success: true;
  jobId: string;
  status: 'processing' | 'pending';
  totalEmails: number;
  estimatedTimeSeconds: number;
  statusUrl: string;
  message: string;
}

export interface BatchSummary {
  total: number;
  safe: number;
  risky: number;
  invalid: number;
  unknown: number;
  catchAll: number;
  spamTrap: number;
  abuse: number;
  doNotMail: number;
  duplicates?: number;
  duplicatesRemoved?: number;
}

export type JobStatus = 'pending' | 'processing' | 'completed' | 'failed' | 'cancelled';

export interface BatchStatusResponse {
  success: true;
  jobId: string;
  status: JobStatus;
  progress: {
    processed: number;
    total: number;
    percentage: number;
  };
  summary?: BatchSummary;
  downloadUrl?: string;
  espSource?: {
    providerId: string;
    listId: string;
    listName: string;
  };
  createdAt: string;
  startedAt?: string;
  completedAt?: string;
  expiresAt?: string;
}

export interface Job {
  id: string;
  status: JobStatus;
  totalEmails: number;
  processedEmails: number;
  fileName: string | null;
  summary?: BatchSummary;
  downloadUrl?: string;
  espSource?: {
    providerId: string;
    listId: string;
    listName: string;
  };
  createdAt: string;
  completedAt?: string;
}

export interface JobListResponse {
  success: true;
  jobs: Job[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface JobListParams {
  page?: number;
  limit?: number;
  status?: JobStatus;
}

// ── File Upload ─────────────────────────────────────────────

export interface UploadResponse {
  success: true;
  jobId: string;
  status: 'processing' | 'pending';
  totalEmails: number;
  estimatedTimeSeconds: number;
  parseInfo: {
    totalRows: number;
    duplicatesRemoved: number;
    invalidSkipped: number;
    detectedColumn: string;
  };
  statusUrl: string;
  message: string;
}

// ── Domain Intelligence ─────────────────────────────────────

export interface BlacklistCheckResponse {
  success: true;
  domain: string;
  hasMx: boolean;
  result: DnsblResult;
}

export interface InfrastructureCheckResponse {
  success: true;
  domain: string;
  result: {
    infrastructure: InfrastructureResult;
    mx: MxResult;
  };
}

export interface SpamTrapSignals {
  hasSuggestion: boolean;
  domainAge: DomainAgeResult | null;
  dnsblListed: boolean;
  dnsblHitCount: number;
  isDisposable: boolean;
  isRoleBased: boolean;
  hasGravatar: boolean;
  hasMx: boolean;
  localPartEntropy: number;
  emailPatternTrust: number;
  emailPattern: string | null;
  mxHasPtrRecord: boolean | null;
  mxIpDnsblListed: boolean | null;
}

export interface SpamTrapAnalysisResponse {
  success: true;
  email: string;
  result: {
    score: number;
    riskLevel: 'low' | 'medium' | 'high';
    trapType: 'pristine' | 'recycled' | 'typo' | 'none' | 'unknown';
    confidence: number;
    signals: SpamTrapSignals;
  };
}

export interface DomainTrust {
  score: number;
  factors: Record<string, number>;
}

export interface DomainIntelResponse {
  success: true;
  domain: string;
  result: {
    mx: MxResult;
    dnsbl: DnsblResult;
    infrastructure: InfrastructureResult;
    domainAge: DomainAgeResult;
    ispProfile: IspProfile | null;
    domainTrust: DomainTrust;
  };
}

export interface OrgIntelligence {
  domain: string;
  companyName?: string;
  primaryPattern: string | null;
  primaryPatternConfidence: number;
  patterns: Array<{
    pattern: string;
    verifiedCount: number;
    failedCount: number;
    observedCount: number;
    confidence: number;
    share: number;
    lastSeenAt: string;
  }>;
  verifiedContactCount: number;
  lastEnrichedAt: string | null;
}

export interface OrgIntelResponse {
  success: true;
  domain: string;
  result: OrgIntelligence | null;
  message?: string;
}

export interface EnrichDomainResponse {
  success: true;
  domain: string;
  message: string;
}

// ── Email Finder ────────────────────────────────────────────

export interface EmailFinderRequest {
  firstName: string;
  lastName: string;
  domain?: string;
  middleName?: string;
  companyName?: string;
}

export interface DomainContext {
  valid: boolean;
  mxProvider: string | null;
  ispCategory: string | null;
  isCatchAll: boolean;
  infrastructureScore: number | null;
  domainAgeDays: number | null;
}

export type ConfidenceLabel = 'verified' | 'likely' | 'probable' | 'uncertain' | 'low';
export type VerificationMethod = 'smtp_verified' | 'catch_all_pattern' | 'pattern_only' | 'org_pattern_match' | 'unverifiable';

export interface EmailFinderResult {
  email: string | null;
  confidence: number;
  confidenceLabel: ConfidenceLabel;
  verificationMethod: VerificationMethod;
  pattern: string | null;
  domain: string;
  domainContext: DomainContext;
  alternates: never[];
  probeDetails?: {
    testedCount: number;
    results: Array<{ email: string; accepted: boolean; possibleUnverified?: boolean }>;
    failureReason?: string;
  };
  corroboration?: {
    signals: Array<{
      source: string;
      found: boolean;
      matchedEmail?: string;
      modifier: number;
      durationMs: number;
    }>;
    totalModifier: number;
  };
  sourceAttribution?: {
    sourceCount: number;
    sources: Array<{ type: string; url: string; title: string; discoveredAt: string }>;
  };
  durationMs: number;
}

export interface EmailFinderResponse {
  success: true;
  firstName: string;
  lastName: string;
  domain: string;
  result: EmailFinderResult;
}

export interface BulkEmailFinderResponse {
  success: true;
  results: Array<{
    firstName: string;
    lastName: string;
    domain: string;
    result?: EmailFinderResult;
    error?: string;
  }>;
}

// ── ESP Integration ─────────────────────────────────────────

export interface EspProvider {
  id: string;
  name: string;
  category: string;
}

export interface EspList {
  id: string;
  name: string;
  subscriberCount: number;
}

export interface EspSyncRequest {
  providerId: string;
  listId: string;
  listName?: string;
  options?: BatchOptions;
  callbackUrl?: string;
}

export interface EspSyncResponse {
  success: true;
  jobId: string;
  statusUrl: string;
  message: string;
}

export interface EspPushResultsRequest {
  providerId: string;
  listId: string;
  jobId: string;
}

// ── Account ─────────────────────────────────────────────────

export interface ApiKey {
  id: string;
  name: string;
  prefix: string;
  active: boolean;
  createdAt: string;
  lastUsed: string | null;
}

export interface ApiKeyCreateResponse {
  success: true;
  key: ApiKey;
  fullKey: string;
}

export interface WebhookSecretMetadata {
  prefix: string;
  createdAt: string;
  updatedAt: string;
}

export interface WebhookSecretRotateResponse {
  success: true;
  webhookSecret: {
    secret: string;
    prefix: string;
    message: string;
  };
}

export interface UsageResponse {
  used: number;
  limit: number;
  remaining: number;
  plan: string;
  periodStart: string;
  periodEnd: string;
  breakdown: {
    single: number;
    batch: number;
    espSync: number;
  };
  dailyUsage: Array<{ date: string; count: number }>;
}

// ── Tool History ────────────────────────────────────────────

export type ToolType = 'blacklist' | 'infrastructure' | 'spam-trap' | 'domain-intel' | 'email-finder';

export interface HistoryEntry {
  id: number;
  input: string;
  result: unknown;
  timestamp: number;
}

export interface SaveHistoryRequest {
  toolType: ToolType;
  input: string;
  result: unknown;
}

// ── DMARC Monitor ──────────────────────────────────────────

export interface DmarcMonitoredDomain {
  id: string;
  domain: string;
  status: string;
  dmarcPolicy: string | null;
  spfRecord: string | null;
  ruaConfigured: boolean;
  lastDnsCheck: string | null;
  createdAt: string;
}

export interface DmarcDomainSummary extends DmarcMonitoredDomain {
  totalReports?: number;
  totalMessages?: number;
  compliancePercent?: number;
  lastReportDate?: string | null;
  trend?: 'improving' | 'declining' | 'stable' | 'unknown';
}

export interface DmarcDnsCheckResult {
  dmarcFound: boolean;
  dmarcPolicy: string | null;
  dmarcRecord: string | null;
  spfFound: boolean;
  spfRecord: string | null;
  dkimFound: boolean;
  warnings: string[];
  ruaConfigured: boolean;
  ruaAddresses?: string[];
  dkimSelectors?: string[];
}

export interface DmarcDomainVerification {
  verified: boolean;
  status: string;
  dns: DmarcDnsCheckResult;
  issues: string[];
}

export interface DmarcGenerateRecordParams {
  domain: string;
  policy: 'none' | 'quarantine' | 'reject';
  subdomainPolicy?: 'none' | 'quarantine' | 'reject';
  dkimAlignment?: 'relaxed' | 'strict';
  spfAlignment?: 'relaxed' | 'strict';
  reportEmail?: string;
  percentage?: number;
  existingRuaAddresses?: string[];
  existingRufAddresses?: string[];
  fo?: string;
}

export interface DmarcGeneratedRecord {
  record: string;
  hostname: string;
  txtHost: string;
  txtType: string;
  fullValue: string;
  instructions: string[];
}

export interface DmarcDomainAnalysis {
  dns: DmarcDnsCheckResult;
  generatedRecord: DmarcGeneratedRecord;
  existingDmarcFound: boolean;
  existingSettings: {
    policy: 'none' | 'quarantine' | 'reject';
    subdomainPolicy?: 'none' | 'quarantine' | 'reject';
    dkimAlignment: 'relaxed' | 'strict';
    spfAlignment: 'relaxed' | 'strict';
    percentage: number;
    fo?: string;
    existingRuaAddresses: string[];
    existingRufAddresses: string[];
  } | null;
  message: string;
}

export interface DmarcReportSummary {
  id: string;
  reportId: string;
  orgName: string;
  beginDate: string;
  endDate: string;
  totalMessages: number;
  passCount: number;
  failCount: number;
}

export interface DmarcReportsPage {
  reports: DmarcReportSummary[];
  total: number;
  page: number;
  limit: number;
}

export interface DmarcReportListParams {
  page?: number;
  limit?: number;
}

export interface DmarcAnalytics {
  domain: string;
  range: string;
  compliance: {
    dmarcPass: number;
    dmarcFail: number;
    dmarcPercent: number;
    spfAlignPercent: number;
    dkimAlignPercent: number;
  };
  volume: {
    total: number;
    delivered: number;
    quarantined: number;
    rejected: number;
  };
  reporters: Array<{ orgName: string; reportCount: number; messageCount: number }>;
}

export interface DmarcAnalyticsParams {
  days?: number;
}

export interface DmarcSendingSource {
  sourceIp: string;
  hostname: string | null;
  org: string | null;
  country: string | null;
  totalMessages: number;
  dmarcPass: number;
  dmarcFail: number;
  dkimPassPercent: number;
  spfPassPercent: number;
  disposition: { none: number; quarantine: number; reject: number };
  firstSeen: string;
  lastSeen: string;
}

export interface DmarcSourceIpDetail {
  sourceIp: string;
  hostname: string | null;
  org: string | null;
  country: string | null;
  firstSeen: string;
  lastSeen: string;
  totalMessages: number;
  dkimPassPercent: number;
  spfPassPercent: number;
  reports: Array<{
    reportId: string;
    orgName: string;
    beginDate: string;
    endDate: string;
    count: number;
    disposition: string;
    dmarcDkim: string;
    dmarcSpf: string;
    dkimResults: unknown;
    spfResults: unknown;
    overrideReasons: unknown;
  }>;
}

export interface DmarcSourcesParams {
  days?: number;
}

export interface DmarcTimelinePoint {
  date: string;
  totalMessages: number;
  passCount: number;
  failCount: number;
  complianceRate: number;
}

export interface DmarcTimelineParams {
  days?: number;
  granularity?: 'day' | 'week' | 'month';
}

export interface DmarcDnsHistoryParams {
  limit?: number;
}

export type DmarcAlertType = 'auth_failure' | 'policy_change' | 'new_source' | 'volume_spike' | 'dns_change';
export type DmarcAlertChannel = 'email' | 'webhook';

export interface DmarcAlertConfig {
  id: string;
  alertType: string;
  channel: string;
  destination: string;
  enabled: boolean;
}

export interface DmarcCreateAlertParams {
  alertType: DmarcAlertType;
  channel: DmarcAlertChannel;
  destination: string;
}

// ── Errors ──────────────────────────────────────────────────

export interface ApiErrorBody {
  success: false;
  error: {
    code: string;
    message: string;
    details?: Array<{ path: string; message: string; code: string }>;
    balance?: number;
    required?: number;
    monthlyUsed?: number;
    monthlyQuota?: number;
    retryAfter?: number;
  };
}

// ── Webhook Events ──────────────────────────────────────────

export interface BatchCompletedEvent {
  event: 'batch.completed';
  jobId: string;
  status: 'completed';
  timestamp: string;
  summary: BatchSummary;
  downloadUrl: string;
}

export interface BatchFailedEvent {
  event: 'batch.failed';
  jobId: string;
  status: 'failed';
  timestamp: string;
}

export type WebhookEvent = BatchCompletedEvent | BatchFailedEvent;
