export { DeliverIQ } from './client';
export { WebhookVerifier } from './webhook';

// Errors
export {
  DeliverIQError,
  ValidationError,
  AuthenticationError,
  InsufficientCreditsError,
  NotFoundError,
  ConflictError,
  RateLimitError,
} from './errors';

// Types — re-export everything for consumer convenience
export type {
  DeliverIQConfig,
  RequestOptions,

  // Verification
  VerifyRequest,
  VerifyOptions,
  VerifyResponse,
  VerificationResult,
  Reachability,
  SyntaxResult,
  MxResult,
  SmtpResult,
  MiscResult,
  IntelligenceResult,
  DnsblResult,
  DnsblHit,
  DomainAgeResult,
  SpamTrapClassification,
  IspProfile,
  InfrastructureResult,
  SpfAnalysis,
  DmarcAnalysis,
  MxServerReputation,
  HibpResult,

  // Batch
  BatchCreateRequest,
  BatchCreateResponse,
  BatchOptions,
  BatchStatusResponse,
  BatchSummary,
  JobStatus,
  Job,
  JobListResponse,
  JobListParams,
  UploadResponse,

  // Domain Intelligence
  BlacklistCheckResponse,
  InfrastructureCheckResponse,
  SpamTrapAnalysisResponse,
  SpamTrapSignals,
  DomainIntelResponse,
  DomainTrust,
  OrgIntelResponse,
  OrgIntelligence,
  EnrichDomainResponse,

  // Email Finder
  EmailFinderRequest,
  EmailFinderResponse,
  EmailFinderResult,
  BulkEmailFinderResponse,
  ConfidenceLabel,
  VerificationMethod,
  DomainContext,

  // ESP
  EspProvider,
  EspList,
  EspSyncRequest,
  EspSyncResponse,
  EspPushResultsRequest,

  // Account
  ApiKey,
  ApiKeyCreateResponse,
  WebhookSecretMetadata,
  WebhookSecretRotateResponse,
  UsageResponse,

  // History
  ToolType,
  HistoryEntry,
  SaveHistoryRequest,

  // DMARC Monitor
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
  DmarcAlertType,
  DmarcAlertChannel,
  DmarcCreateAlertParams,

  // Errors
  ApiErrorBody,

  // Webhooks
  WebhookEvent,
  BatchCompletedEvent,
  BatchFailedEvent,
} from './types';
