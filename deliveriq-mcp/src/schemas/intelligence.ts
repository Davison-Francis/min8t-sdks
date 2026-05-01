import { z } from 'zod';

export const FindEmailSchema = z.object({
  first_name: z.string().min(1)
    .describe('First name of the person (e.g. "John")'),
  last_name: z.string().min(1)
    .describe('Last name of the person (e.g. "Doe")'),
  domain: z.string().optional()
    .describe('Company domain (e.g. "acme.com"). Required if company_name is not provided'),
  middle_name: z.string().optional()
    .describe('Middle name (improves accuracy for common names)'),
  company_name: z.string().optional()
    .describe('Company name (e.g. "Acme Corp"). Used if domain is not provided'),
}).strict();

export const BlacklistCheckSchema = z.object({
  domain: z.string().min(1)
    .describe('Domain to check against 50 DNSBL zones (e.g. "example.com")'),
}).strict();

export const InfrastructureCheckSchema = z.object({
  domain: z.string().min(1)
    .describe('Domain to analyze for SPF, DKIM, DMARC, MTA-STS, BIMI, and TLS-RPT (e.g. "example.com")'),
}).strict();

export const SpamTrapAnalysisSchema = z.object({
  email: z.string().email('Must be a valid email address')
    .describe('Email address to analyze for spam trap risk (e.g. "user@example.com")'),
}).strict();

export const DomainIntelSchema = z.object({
  domain: z.string().min(1)
    .describe('Domain for comprehensive intelligence report (e.g. "example.com")'),
}).strict();

export const OrgIntelSchema = z.object({
  domain: z.string().min(1)
    .describe('Domain to query organization intelligence (e.g. "acme.com")'),
}).strict();
