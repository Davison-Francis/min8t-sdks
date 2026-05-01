import type { HttpClient } from '../http';
import type {
  ApiKey,
  ApiKeyCreateResponse,
  WebhookSecretMetadata,
  WebhookSecretRotateResponse,
  UsageResponse,
  RequestOptions,
} from '../types';

export class Account {
  constructor(private readonly http: HttpClient) {}

  /** List all API keys for the authenticated account. */
  async listApiKeys(opts?: RequestOptions): Promise<{ success: true; keys: ApiKey[] }> {
    return this.http.get('/account/api-keys', opts);
  }

  /** Create a new API key. The full key is only returned once. */
  async createApiKey(name: string, opts?: RequestOptions): Promise<ApiKeyCreateResponse> {
    return this.http.post<ApiKeyCreateResponse>('/account/api-keys', { name }, opts);
  }

  /** Revoke an API key (soft delete). */
  async revokeApiKey(keyId: string, opts?: RequestOptions): Promise<{ success: true }> {
    return this.http.delete(`/account/api-keys/${encodeURIComponent(keyId)}`, opts);
  }

  /** Get webhook secret metadata (prefix only — full secret is never returned). */
  async getWebhookSecret(opts?: RequestOptions): Promise<{ success: true; webhookSecret: WebhookSecretMetadata | null }> {
    return this.http.get('/account/webhook-secret', opts);
  }

  /** Generate or rotate the webhook signing secret. The full secret is only returned once. */
  async rotateWebhookSecret(opts?: RequestOptions): Promise<WebhookSecretRotateResponse> {
    return this.http.post<WebhookSecretRotateResponse>('/account/webhook-secret/rotate', {}, opts);
  }

  /** Get current month's usage statistics including daily breakdown. */
  async usage(opts?: RequestOptions): Promise<UsageResponse> {
    return this.http.get<UsageResponse>('/account/usage', opts);
  }
}
