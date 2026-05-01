export const SERVER_NAME = 'deliveriq-mcp-server';
export const SERVER_VERSION = '1.0.0';
export const CHARACTER_LIMIT = 25_000;

export const CREDIT_COSTS: Record<string, number | string> = {
  deliveriq_verify_email: 1,
  deliveriq_batch_verify: '1 per email',
  deliveriq_batch_status: 0,
  deliveriq_batch_download: 0,
  deliveriq_list_jobs: 0,
  deliveriq_find_email: 2,
  deliveriq_blacklist_check: 1,
  deliveriq_infrastructure_check: 1,
  deliveriq_spam_trap_analysis: 1,
  deliveriq_domain_intel: 1,
  deliveriq_org_intel: 0,
  deliveriq_check_credits: 0,
};
