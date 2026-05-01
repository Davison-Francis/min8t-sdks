# @deliveriq/sdk

Official Node.js SDK for the DeliverIQ email verification API.

## Installation

```bash
npm install @deliveriq/sdk
```

## Quick Start

```typescript
import { DeliverIQ } from '@deliveriq/sdk';

const client = new DeliverIQ('lc_your_api_key');

// Single verification (1 credit)
const { result } = await client.verify({ email: 'user@example.com' });
console.log(result.reachability, result.score);
```

## Resources

### Single Verification

```typescript
const response = await client.verify({
  email: 'user@example.com',
  options: {
    skipSmtp: false,
    checkGravatar: true,
    checkHibp: true,
    includeIntelligence: true,
  },
});
// response.result.reachability: 'safe' | 'risky' | 'invalid' | 'unknown'
// response.result.score: 0-100
// response.creditsUsed: 1 (0 if syntax invalid)
```

### Batch Verification

```typescript
// Submit batch (always async, returns 202)
const job = await client.batch.create({
  emails: ['a@example.com', 'b@example.com'],
  options: { checkHibp: true },
  callbackUrl: 'https://your-app.com/webhook',
});
console.log(job.jobId);

// Poll until complete
const final = await client.batch.waitForCompletion(job.jobId, 5000, (status) => {
  console.log(`${status.progress.percentage}% complete`);
});

// Download results as CSV
const csv = await client.batch.download(job.jobId);
// Or filter: await client.batch.download(job.jobId, 'safe');

// Upload a file
const csvBuffer = fs.readFileSync('emails.csv');
const uploadJob = await client.batch.upload(csvBuffer, 'emails.csv', {
  skipSmtp: false,
  callbackUrl: 'https://your-app.com/webhook',
});

// List jobs with pagination
const jobs = await client.batch.list({ page: 1, limit: 20, status: 'completed' });

// Cancel a job
await client.batch.cancel(job.jobId);
```

### Domain Intelligence

```typescript
// Blacklist check (50 DNSBL zones, 1 credit)
const bl = await client.tools.blacklistCheck('example.com');
console.log(bl.result.listed, bl.result.hits.length);

// Infrastructure analysis (SPF, DKIM, DMARC, 1 credit)
const infra = await client.tools.infrastructureCheck('example.com');
console.log(infra.result.infrastructure.score);

// Spam trap analysis (13 signals, 1 credit)
const trap = await client.tools.spamTrapAnalysis('user@example.com');
console.log(trap.result.riskLevel, trap.result.trapType);

// Comprehensive domain intel (1 credit)
const intel = await client.tools.domainIntel('example.com');
console.log(intel.result.domainTrust.score);

// Organization intelligence (free)
const org = await client.tools.orgIntel('example.com');
console.log(org.result?.primaryPattern);

// Trigger background enrichment (free)
await client.tools.enrichDomain('example.com');
```

### Email Finder

```typescript
// Find a business email (2 credits)
const found = await client.emailFinder.find({
  firstName: 'John',
  lastName: 'Doe',
  domain: 'acme.com',
});
console.log(found.result.email, found.result.confidence);

// Bulk find (up to 50, 2 credits each)
const bulk = await client.emailFinder.bulkFind([
  { firstName: 'John', lastName: 'Doe', domain: 'acme.com' },
  { firstName: 'Jane', lastName: 'Smith', companyName: 'Globex Corp' },
]);
```

### ESP Integration

```typescript
// List connected providers
const providers = await client.esp.providers();

// Fetch lists from a provider
const lists = await client.esp.lists('mailchimp');

// Sync and verify a list (1 credit per email)
const sync = await client.esp.sync({
  providerId: 'mailchimp',
  listId: 'list_001',
  options: { skipSmtp: false },
  callbackUrl: 'https://your-app.com/webhook',
});

// Push results back to ESP
await client.esp.pushResults({
  providerId: 'mailchimp',
  listId: 'list_001',
  jobId: sync.jobId,
});
```

### Account

```typescript
// API keys
const keys = await client.account.listApiKeys();
const newKey = await client.account.createApiKey('Production');
console.log(newKey.fullKey); // Shown only once
await client.account.revokeApiKey(newKey.key.id);

// Webhook secrets
const secret = await client.account.rotateWebhookSecret();
console.log(secret.webhookSecret.secret); // Shown only once

// Usage
const usage = await client.account.usage();
console.log(`${usage.remaining} of ${usage.limit} credits remaining`);
```

### Tool History

```typescript
// Save a lookup result
await client.history.save({
  toolType: 'blacklist',
  input: 'example.com',
  result: { listed: false },
});

// Get history (max 25 per tool type)
const entries = await client.history.get('blacklist');

// Clear history
await client.history.clear('blacklist');
```

## Webhook Verification

```typescript
import { WebhookVerifier } from '@deliveriq/sdk';

const verifier = new WebhookVerifier('whsec_your_secret');

// In your webhook handler:
app.post('/webhooks', (req, res) => {
  const signature = req.headers['x-listcleaner-signature'];

  try {
    const event = verifier.verifyAndParse(req.body, signature);

    if (event.event === 'batch.completed') {
      console.log('Job done:', event.summary);
      console.log('Download:', event.downloadUrl);
    } else if (event.event === 'batch.failed') {
      console.error('Job failed:', event.jobId);
    }

    res.sendStatus(200);
  } catch {
    res.status(401).send('Invalid signature');
  }
});
```

## Error Handling

```typescript
import {
  DeliverIQError,
  ValidationError,
  AuthenticationError,
  InsufficientCreditsError,
  NotFoundError,
  ConflictError,
  RateLimitError,
} from '@deliveriq/sdk';

try {
  await client.verify({ email: 'user@example.com' });
} catch (err) {
  if (err instanceof InsufficientCreditsError) {
    console.log(`Need ${err.required} credits, have ${err.balance}`);
  } else if (err instanceof RateLimitError) {
    console.log(`Retry after ${err.retryAfter}s`);
  } else if (err instanceof AuthenticationError) {
    console.log('Invalid API key');
  } else if (err instanceof ValidationError) {
    console.log('Bad input:', err.details);
  } else if (err instanceof ConflictError) {
    console.log('Resource conflict (e.g., job already cancelled)');
  } else if (err instanceof DeliverIQError) {
    console.log(`${err.status} ${err.code}: ${err.message}`);
  }
}
```

## Configuration

```typescript
const client = new DeliverIQ({
  apiKey: 'lc_your_api_key',
  baseUrl: 'https://api.deliveriq.com/v1', // default
  timeout: 30_000,                          // 30s default
  maxRetries: 3,                            // retries on 429/5xx
});
```

## Request Cancellation

```typescript
const controller = new AbortController();
setTimeout(() => controller.abort(), 5000);

const result = await client.verify(
  { email: 'user@example.com' },
  { signal: controller.signal },
);
```

## Requirements

- Node.js 18+ (uses native `fetch`)
- No external runtime dependencies

## Retry Behavior

The SDK automatically retries requests that fail with:

- **429 (Rate Limited)**: Waits for the `Retry-After` header duration (or 60s default)
- **5xx (Server Error)**: Exponential backoff (1s, 2s, 4s, ...) capped at 30s
- **Network errors**: Exponential backoff on timeouts and connection failures

Set `maxRetries: 0` to disable retries.

## License

MIT
