import type { DeliverIQConfig, VerifyRequest, VerifyResponse, RequestOptions } from './types';
import { HttpClient } from './http';
import { Verification } from './resources/verification';
import { Batch } from './resources/batch';
import { Tools } from './resources/tools';
import { EmailFinder } from './resources/email-finder';
import { Esp } from './resources/esp';
import { Account } from './resources/account';
import { History } from './resources/history';
import { Dmarc } from './resources/dmarc';

const DEFAULT_BASE_URL = 'https://api.deliveriq.com/v1';
const DEFAULT_TIMEOUT = 30_000;
const DEFAULT_MAX_RETRIES = 3;

export class DeliverIQ {
  /** Batch verification — submit, poll, download, cancel. */
  readonly batch: Batch;
  /** Domain intelligence — blacklist, infrastructure, spam traps, trust scores. */
  readonly tools: Tools;
  /** Email finder — find and verify business email addresses. */
  readonly emailFinder: EmailFinder;
  /** ESP integrations — import lists from 80+ providers. */
  readonly esp: Esp;
  /** Account management — API keys, webhook secrets, usage. */
  readonly account: Account;
  /** Tool lookup history — save and retrieve past results. */
  readonly history: History;
  /** DMARC monitoring — domains, reports, analytics, alerts. */
  readonly dmarc: Dmarc;

  private readonly verification: Verification;

  constructor(config: string | DeliverIQConfig) {
    const cfg: DeliverIQConfig = typeof config === 'string'
      ? { apiKey: config }
      : config;

    if (!cfg.apiKey) {
      throw new Error('DeliverIQ API key is required. Pass it as a string or in config.apiKey.');
    }

    const http = new HttpClient({
      baseUrl: cfg.baseUrl ?? DEFAULT_BASE_URL,
      apiKey: cfg.apiKey,
      timeout: cfg.timeout ?? DEFAULT_TIMEOUT,
      maxRetries: cfg.maxRetries ?? DEFAULT_MAX_RETRIES,
    });

    this.verification = new Verification(http);
    this.batch = new Batch(http);
    this.tools = new Tools(http);
    this.emailFinder = new EmailFinder(http);
    this.esp = new Esp(http);
    this.account = new Account(http);
    this.history = new History(http);
    this.dmarc = new Dmarc(http);
  }

  /** Verify a single email address. Shorthand for the full verification pipeline. Costs 1 credit. */
  async verify(params: VerifyRequest, opts?: RequestOptions): Promise<VerifyResponse> {
    return this.verification.verify(params, opts);
  }
}
