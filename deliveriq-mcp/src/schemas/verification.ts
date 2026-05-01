import { z } from 'zod';

export const VerifyEmailSchema = z.object({
  email: z.string().email('Must be a valid email address')
    .describe('Email address to verify (e.g. "user@example.com")'),
  skip_smtp: z.boolean().default(false)
    .describe('Skip SMTP verification step (faster but less accurate)'),
  check_gravatar: z.boolean().default(false)
    .describe('Check if email has a Gravatar profile'),
  check_hibp: z.boolean().default(false)
    .describe('Check if email appears in Have I Been Pwned breach data'),
  include_intelligence: z.boolean().default(false)
    .describe('Include deep intelligence (DNSBL, spam trap, domain age, infrastructure)'),
}).strict();

export const BatchVerifySchema = z.object({
  emails: z.array(z.string().email()).min(1).max(10000)
    .describe('Array of email addresses to verify (1-10,000)'),
  skip_smtp: z.boolean().default(false)
    .describe('Skip SMTP verification for all emails'),
  callback_url: z.string().url().optional()
    .describe('Webhook URL to receive batch.completed or batch.failed event'),
}).strict();

export const BatchStatusSchema = z.object({
  job_id: z.string().min(1)
    .describe('Batch job ID returned by deliveriq_batch_verify'),
}).strict();

export const BatchDownloadSchema = z.object({
  job_id: z.string().min(1)
    .describe('Batch job ID to download results for'),
  category: z.enum(['safe', 'risky', 'invalid', 'unknown']).optional()
    .describe('Filter results to a specific category (omit to get full CSV)'),
}).strict();

export const ListJobsSchema = z.object({
  page: z.number().int().min(1).default(1)
    .describe('Page number (default: 1)'),
  limit: z.number().int().min(1).max(100).default(20)
    .describe('Results per page (default: 20, max: 100)'),
  status: z.enum(['pending', 'processing', 'completed', 'failed', 'cancelled']).optional()
    .describe('Filter by job status'),
}).strict();
