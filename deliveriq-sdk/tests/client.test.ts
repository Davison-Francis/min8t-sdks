import { DeliverIQ, DeliverIQError, AuthenticationError, RateLimitError, InsufficientCreditsError, ValidationError, WebhookVerifier } from '../src';

// ── Mock fetch ──────────────────────────────────────────────

let mockResponses: Array<{ status: number; body: unknown; headers?: Record<string, string> }> = [];
let fetchCalls: Array<{ url: string; init: RequestInit }> = [];

const mockFetch = jest.fn(async (url: string | URL, init?: RequestInit) => {
  fetchCalls.push({ url: url.toString(), init: init! });
  const next = mockResponses.shift();
  if (!next) throw new Error('No mock response configured');
  return {
    ok: next.status >= 200 && next.status < 300,
    status: next.status,
    headers: new Headers(next.headers ?? {}),
    json: async () => next.body,
    text: async () => typeof next.body === 'string' ? next.body : JSON.stringify(next.body),
  } as Response;
});

beforeAll(() => {
  (globalThis as any).fetch = mockFetch;
});

beforeEach(() => {
  mockResponses = [];
  fetchCalls = [];
  mockFetch.mockClear();
});

function enqueue(status: number, body: unknown, headers?: Record<string, string>) {
  mockResponses.push({ status, body, headers });
}

// ── Constructor ─────────────────────────────────────────────

describe('DeliverIQ constructor', () => {
  it('accepts a string API key', () => {
    const client = new DeliverIQ('lc_test_key');
    expect(client).toBeDefined();
    expect(client.batch).toBeDefined();
    expect(client.tools).toBeDefined();
    expect(client.emailFinder).toBeDefined();
    expect(client.esp).toBeDefined();
    expect(client.account).toBeDefined();
    expect(client.history).toBeDefined();
  });

  it('accepts a config object', () => {
    const client = new DeliverIQ({
      apiKey: 'lc_test_key',
      baseUrl: 'http://localhost:3019/api/v1',
      timeout: 10000,
      maxRetries: 1,
    });
    expect(client).toBeDefined();
  });

  it('throws without an API key', () => {
    expect(() => new DeliverIQ('')).toThrow('API key is required');
  });
});

// ── Single Verification ─────────────────────────────────────

describe('verify()', () => {
  const client = new DeliverIQ({ apiKey: 'lc_test_key', baseUrl: 'http://test', maxRetries: 0 });

  it('sends correct request and returns result', async () => {
    const mockResult = {
      success: true,
      result: {
        email: 'john@example.com',
        reachability: 'safe',
        score: 95,
        syntax: { valid: true, localPart: 'john', domain: 'example.com', normalizedEmail: 'john@example.com' },
        mx: { valid: true, records: [{ exchange: 'mail.example.com', priority: 10 }] },
        smtp: { canConnect: true, isDeliverable: true, isCatchAll: false, hasFullInbox: false, isDisabled: false },
        misc: { isDisposable: false, isRoleBased: false, isFreeProvider: false, hasGravatar: false, isAliased: false },
        intelligence: { dnsbl: null, spamTrapScore: 0.02, domainAge: null, hibp: null, ispProfile: null, infrastructure: null, mxServerReputation: null },
        verifiedAt: '2026-03-04T00:00:00Z',
        durationMs: 1200,
      },
      creditsUsed: 1,
    };

    enqueue(200, mockResult);
    const res = await client.verify({ email: 'john@example.com' });

    expect(res.success).toBe(true);
    expect(res.result.email).toBe('john@example.com');
    expect(res.result.reachability).toBe('safe');
    expect(res.result.score).toBe(95);
    expect(res.creditsUsed).toBe(1);

    // Verify request
    expect(fetchCalls[0].url).toBe('http://test/verify');
    const body = JSON.parse(fetchCalls[0].init.body as string);
    expect(body.email).toBe('john@example.com');
    expect((fetchCalls[0].init.headers as Record<string, string>)['MiN8T-Api-Auth']).toBe('lc_test_key');
  });

  it('passes verification options', async () => {
    enqueue(200, { success: true, result: {}, creditsUsed: 1 });
    await client.verify({
      email: 'test@example.com',
      options: { skipSmtp: true, checkGravatar: true },
    });

    const body = JSON.parse(fetchCalls[0].init.body as string);
    expect(body.options.skipSmtp).toBe(true);
    expect(body.options.checkGravatar).toBe(true);
  });
});

// ── Batch Operations ────────────────────────────────────────

describe('batch', () => {
  const client = new DeliverIQ({ apiKey: 'lc_test_key', baseUrl: 'http://test', maxRetries: 0 });

  it('create() sends emails array and returns jobId', async () => {
    enqueue(202, {
      success: true,
      jobId: 'job_123',
      status: 'processing',
      totalEmails: 3,
      estimatedTimeSeconds: 15,
      statusUrl: '/api/v1/verify/batch/job_123',
      message: 'Batch verification queued',
    });

    const res = await client.batch.create({
      emails: ['a@test.com', 'b@test.com', 'c@test.com'],
    });

    expect(res.jobId).toBe('job_123');
    expect(res.status).toBe('processing');
    expect(res.totalEmails).toBe(3);
  });

  it('status() polls job progress', async () => {
    enqueue(200, {
      success: true,
      jobId: 'job_123',
      status: 'processing',
      progress: { processed: 2, total: 3, percentage: 67 },
    });

    const res = await client.batch.status('job_123');
    expect(res.progress.percentage).toBe(67);
    expect(fetchCalls[0].url).toBe('http://test/verify/batch/job_123');
  });

  it('download() returns CSV text', async () => {
    enqueue(200, 'email,reachability,score\njohn@test.com,safe,95');
    const csv = await client.batch.download('job_123');
    expect(csv).toContain('email,reachability');
  });

  it('download() supports category filter', async () => {
    enqueue(200, 'john@test.com');
    await client.batch.download('job_123', 'safe');
    expect(fetchCalls[0].url).toBe('http://test/verify/batch/job_123/download?category=safe');
  });

  it('cancel() sends DELETE', async () => {
    enqueue(200, { success: true, jobId: 'job_123', status: 'cancelled' });
    const res = await client.batch.cancel('job_123');
    expect(res.status).toBe('cancelled');
    expect(fetchCalls[0].init.method).toBe('DELETE');
  });

  it('list() passes pagination params', async () => {
    enqueue(200, { success: true, jobs: [], pagination: { page: 2, limit: 10, total: 50, totalPages: 5 } });
    await client.batch.list({ page: 2, limit: 10, status: 'completed' });
    expect(fetchCalls[0].url).toContain('page=2');
    expect(fetchCalls[0].url).toContain('limit=10');
    expect(fetchCalls[0].url).toContain('status=completed');
  });
});

// ── Domain Intelligence ─────────────────────────────────────

describe('tools', () => {
  const client = new DeliverIQ({ apiKey: 'lc_test_key', baseUrl: 'http://test', maxRetries: 0 });

  it('blacklistCheck() posts domain', async () => {
    enqueue(200, { success: true, domain: 'example.com', hasMx: true, result: { listed: false, hits: [], checkedZones: 47 } });
    const res = await client.tools.blacklistCheck('example.com');
    expect(res.result.checkedZones).toBe(47);
    expect(res.result.listed).toBe(false);
  });

  it('infrastructureCheck() returns score', async () => {
    enqueue(200, { success: true, domain: 'example.com', result: { infrastructure: { score: 85 }, mx: { valid: true, records: [] } } });
    const res = await client.tools.infrastructureCheck('example.com');
    expect(res.result.infrastructure.score).toBe(85);
  });

  it('spamTrapAnalysis() sends email', async () => {
    enqueue(200, { success: true, email: 'test@example.com', result: { score: 0.1, riskLevel: 'low', trapType: 'none', confidence: 0.9, signals: {} } });
    const res = await client.tools.spamTrapAnalysis('test@example.com');
    expect(res.result.riskLevel).toBe('low');
  });

  it('domainIntel() returns comprehensive report', async () => {
    enqueue(200, { success: true, domain: 'example.com', result: { mx: {}, dnsbl: {}, infrastructure: {}, domainAge: {}, ispProfile: null, domainTrust: { score: 87 } } });
    const res = await client.tools.domainIntel('example.com');
    expect(res.result.domainTrust.score).toBe(87);
  });

  it('orgIntel() uses GET with path param', async () => {
    enqueue(200, { success: true, domain: 'acme.com', result: { companyName: 'Acme Inc.' } });
    const res = await client.tools.orgIntel('acme.com');
    expect(fetchCalls[0].url).toBe('http://test/tools/org-intel/acme.com');
    expect(fetchCalls[0].init.method).toBe('GET');
  });

  it('enrichDomain() returns 200', async () => {
    enqueue(200, { success: true, domain: 'acme.com', message: 'Enrichment job queued' });
    const res = await client.tools.enrichDomain('acme.com');
    expect(res.message).toContain('queued');
  });
});

// ── Email Finder ────────────────────────────────────────────

describe('emailFinder', () => {
  const client = new DeliverIQ({ apiKey: 'lc_test_key', baseUrl: 'http://test', maxRetries: 0 });

  it('find() sends name and domain', async () => {
    enqueue(200, {
      success: true,
      firstName: 'John',
      lastName: 'Doe',
      domain: 'acme.com',
      result: { email: 'john.doe@acme.com', confidence: 95, confidenceLabel: 'verified' },
    });

    const res = await client.emailFinder.find({
      firstName: 'John',
      lastName: 'Doe',
      domain: 'acme.com',
    });

    expect(res.result.email).toBe('john.doe@acme.com');
    expect(res.result.confidence).toBe(95);
  });

  it('bulkFind() sends contacts array', async () => {
    enqueue(200, { success: true, results: [{ firstName: 'John', lastName: 'Doe', domain: 'acme.com', result: {} }] });
    const res = await client.emailFinder.bulkFind([
      { firstName: 'John', lastName: 'Doe', domain: 'acme.com' },
    ]);
    expect(res.results).toHaveLength(1);
    const body = JSON.parse(fetchCalls[0].init.body as string);
    expect(body.contacts).toHaveLength(1);
  });
});

// ── ESP ─────────────────────────────────────────────────────

describe('esp', () => {
  const client = new DeliverIQ({ apiKey: 'lc_test_key', baseUrl: 'http://test', maxRetries: 0 });

  it('providers() lists connectors', async () => {
    enqueue(200, { success: true, providers: [{ id: 'mailchimp', name: 'Mailchimp', category: 'esp' }] });
    const res = await client.esp.providers();
    expect(res.providers[0].id).toBe('mailchimp');
  });

  it('lists() fetches from provider', async () => {
    enqueue(200, { success: true, lists: [{ id: 'list_001', name: 'Newsletter', subscriberCount: 5000 }] });
    const res = await client.esp.lists('mailchimp');
    expect(fetchCalls[0].url).toBe('http://test/esp/mailchimp/lists');
  });

  it('sync() queues verification job', async () => {
    enqueue(202, { success: true, jobId: 'job_esp', statusUrl: '/api/v1/verify/batch/job_esp', message: 'queued' });
    const res = await client.esp.sync({ providerId: 'mailchimp', listId: 'list_001' });
    expect(res.jobId).toBe('job_esp');
  });
});

// ── Account ─────────────────────────────────────────────────

describe('account', () => {
  const client = new DeliverIQ({ apiKey: 'lc_test_key', baseUrl: 'http://test', maxRetries: 0 });

  it('listApiKeys() returns keys', async () => {
    enqueue(200, { success: true, keys: [{ id: '1', name: 'Prod', prefix: 'lc_abc', active: true }] });
    const res = await client.account.listApiKeys();
    expect(res.keys[0].prefix).toBe('lc_abc');
  });

  it('createApiKey() returns full key', async () => {
    enqueue(201, { success: true, key: { id: '2', name: 'Test' }, fullKey: 'lc_abc_secret123' });
    const res = await client.account.createApiKey('Test');
    expect(res.fullKey).toBe('lc_abc_secret123');
  });

  it('revokeApiKey() sends DELETE', async () => {
    enqueue(200, { success: true });
    await client.account.revokeApiKey('key_1');
    expect(fetchCalls[0].init.method).toBe('DELETE');
    expect(fetchCalls[0].url).toBe('http://test/account/api-keys/key_1');
  });

  it('usage() returns stats', async () => {
    enqueue(200, { used: 500, limit: 5000, remaining: 4500, plan: 'Pro', periodStart: '2026-03-01', periodEnd: '2026-03-31', breakdown: {}, dailyUsage: [] });
    const res = await client.account.usage();
    expect(res.remaining).toBe(4500);
  });

  it('rotateWebhookSecret() returns new secret', async () => {
    enqueue(200, { success: true, webhookSecret: { secret: 'whsec_abc123', prefix: 'whsec_abc', message: 'Store securely' } });
    const res = await client.account.rotateWebhookSecret();
    expect(res.webhookSecret.secret).toBe('whsec_abc123');
  });
});

// ── History ─────────────────────────────────────────────────

describe('history', () => {
  const client = new DeliverIQ({ apiKey: 'lc_test_key', baseUrl: 'http://test', maxRetries: 0 });

  it('get() fetches by tool type', async () => {
    enqueue(200, { success: true, entries: [{ id: 1, input: 'example.com', result: {}, timestamp: 123 }] });
    const res = await client.history.get('blacklist');
    expect(fetchCalls[0].url).toBe('http://test/tools/history/blacklist');
    expect(res.entries[0].input).toBe('example.com');
  });

  it('save() posts entry', async () => {
    enqueue(200, { success: true, entry: { id: 2, input: 'test.com', result: {}, timestamp: 456 } });
    await client.history.save({ toolType: 'blacklist', input: 'test.com', result: {} });
    expect(fetchCalls[0].init.method).toBe('POST');
  });

  it('clear() sends DELETE', async () => {
    enqueue(200, { success: true });
    await client.history.clear('infrastructure');
    expect(fetchCalls[0].init.method).toBe('DELETE');
    expect(fetchCalls[0].url).toBe('http://test/tools/history/infrastructure');
  });
});

// ── Error Handling ──────────────────────────────────────────

describe('error handling', () => {
  const client = new DeliverIQ({ apiKey: 'lc_test_key', baseUrl: 'http://test', maxRetries: 0 });

  it('throws AuthenticationError on 401', async () => {
    enqueue(401, { success: false, error: { code: 'UNAUTHORIZED', message: 'Invalid API key' } });
    await expect(client.verify({ email: 'a@b.com' })).rejects.toThrow(AuthenticationError);
  });

  it('throws InsufficientCreditsError on 402 with balance info', async () => {
    enqueue(402, { success: false, error: { code: 'INSUFFICIENT_CREDITS', message: 'No credits', balance: 0, required: 1 } });
    try {
      await client.verify({ email: 'a@b.com' });
      fail('Should have thrown');
    } catch (err) {
      expect(err).toBeInstanceOf(InsufficientCreditsError);
      expect((err as InsufficientCreditsError).balance).toBe(0);
      expect((err as InsufficientCreditsError).required).toBe(1);
    }
  });

  it('throws RateLimitError on 429 with retryAfter', async () => {
    enqueue(429, { success: false, error: { code: 'RATE_LIMIT_EXCEEDED', message: 'Rate limited', retryAfter: 60 } }, { 'Retry-After': '60' });
    try {
      await client.verify({ email: 'a@b.com' });
      fail('Should have thrown');
    } catch (err) {
      expect(err).toBeInstanceOf(RateLimitError);
      expect((err as RateLimitError).retryAfter).toBe(60);
    }
  });

  it('throws ValidationError on 400', async () => {
    enqueue(400, { success: false, error: { code: 'VALIDATION_ERROR', message: 'Invalid', details: [{ path: 'email', message: 'bad', code: 'invalid_string' }] } });
    try {
      await client.verify({ email: '' });
      fail('Should have thrown');
    } catch (err) {
      expect(err).toBeInstanceOf(ValidationError);
      expect((err as ValidationError).details).toHaveLength(1);
    }
  });

  it('all errors have status, code, and message', async () => {
    enqueue(500, { success: false, error: { code: 'SERVER_ERROR', message: 'Oops' } });
    try {
      await client.verify({ email: 'a@b.com' });
      fail('Should have thrown');
    } catch (err) {
      expect(err).toBeInstanceOf(DeliverIQError);
      expect((err as DeliverIQError).status).toBe(500);
      expect((err as DeliverIQError).code).toBe('SERVER_ERROR');
      expect((err as DeliverIQError).message).toBe('Oops');
    }
  });
});

// ── Retry Logic ─────────────────────────────────────────────

describe('retry logic', () => {
  it('retries 429 responses using Retry-After header', async () => {
    const client = new DeliverIQ({ apiKey: 'lc_test_key', baseUrl: 'http://test', maxRetries: 1 });
    enqueue(429, { success: false, error: { code: 'RATE_LIMIT_EXCEEDED', message: 'Rate limited', retryAfter: 0 } }, { 'Retry-After': '0' });
    enqueue(200, { success: true, result: { email: 'a@b.com', reachability: 'safe' }, creditsUsed: 1 });

    const res = await client.verify({ email: 'a@b.com' });
    expect(res.success).toBe(true);
    expect(fetchCalls).toHaveLength(2);
  });

  it('retries 500 with exponential backoff', async () => {
    const client = new DeliverIQ({ apiKey: 'lc_test_key', baseUrl: 'http://test', maxRetries: 1 });
    enqueue(500, { success: false, error: { code: 'SERVER_ERROR', message: 'Oops' } });
    enqueue(200, { success: true, result: {}, creditsUsed: 1 });

    const res = await client.verify({ email: 'a@b.com' });
    expect(res.success).toBe(true);
    expect(fetchCalls).toHaveLength(2);
  });

  it('gives up after maxRetries', async () => {
    const client = new DeliverIQ({ apiKey: 'lc_test_key', baseUrl: 'http://test', maxRetries: 2 });
    enqueue(500, { success: false, error: { code: 'SERVER_ERROR', message: 'Fail 1' } });
    enqueue(500, { success: false, error: { code: 'SERVER_ERROR', message: 'Fail 2' } });
    enqueue(500, { success: false, error: { code: 'SERVER_ERROR', message: 'Fail 3' } });

    await expect(client.verify({ email: 'a@b.com' })).rejects.toThrow(DeliverIQError);
    expect(fetchCalls).toHaveLength(3); // initial + 2 retries
  });
});

// ── Webhook Verification ────────────────────────────────────

describe('WebhookVerifier', () => {
  const secret = 'whsec_abc123def456';
  const verifier = new WebhookVerifier(secret);

  it('throws on invalid secret format', () => {
    expect(() => new WebhookVerifier('bad_secret')).toThrow('must start with "whsec_"');
  });

  it('signs payload correctly', () => {
    const payload = { event: 'batch.completed', jobId: 'job_1' };
    const sig = verifier.sign(payload);
    expect(sig).toMatch(/^[0-9a-f]{64}$/);
  });

  it('verify() returns true for valid signature', () => {
    const payload = { event: 'batch.completed', jobId: 'job_1' };
    const sig = verifier.sign(payload);
    expect(verifier.verify(payload, sig)).toBe(true);
  });

  it('verify() returns false for invalid signature', () => {
    const payload = { event: 'batch.completed', jobId: 'job_1' };
    expect(verifier.verify(payload, 'invalid_signature_here')).toBe(false);
  });

  it('verify() returns false for tampered payload', () => {
    const payload = { event: 'batch.completed', jobId: 'job_1' };
    const sig = verifier.sign(payload);
    const tampered = { event: 'batch.completed', jobId: 'job_2' };
    expect(verifier.verify(tampered, sig)).toBe(false);
  });

  it('verifyAndParse() returns typed event on valid signature', () => {
    const payload = { event: 'batch.completed', jobId: 'job_1', status: 'completed', timestamp: '2026-03-04T00:00:00Z', summary: {}, downloadUrl: '/download' };
    const sig = verifier.sign(payload);
    const event = verifier.verifyAndParse(payload, sig);
    expect(event.event).toBe('batch.completed');
  });

  it('verifyAndParse() throws on invalid signature', () => {
    const payload = { event: 'batch.failed', jobId: 'job_1' };
    expect(() => verifier.verifyAndParse(payload, 'bad')).toThrow('Invalid webhook signature');
  });
});
