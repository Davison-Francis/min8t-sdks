import type { RequestOptions, ApiErrorBody } from './types';
import { classifyError } from './errors';

export interface HttpClientConfig {
  baseUrl: string;
  apiKey: string;
  timeout: number;
  maxRetries: number;
}

export class HttpClient {
  private readonly baseUrl: string;
  private readonly apiKey: string;
  private readonly timeout: number;
  private readonly maxRetries: number;

  constructor(config: HttpClientConfig) {
    this.baseUrl = config.baseUrl.replace(/\/+$/, '');
    this.apiKey = config.apiKey;
    this.timeout = config.timeout;
    this.maxRetries = config.maxRetries;
  }

  async get<T>(path: string, opts?: RequestOptions): Promise<T> {
    return this.request<T>('GET', path, undefined, opts);
  }

  async post<T>(path: string, body?: unknown, opts?: RequestOptions): Promise<T> {
    return this.request<T>('POST', path, body, opts);
  }

  async delete<T = { success: true }>(path: string, opts?: RequestOptions): Promise<T> {
    return this.request<T>('DELETE', path, undefined, opts);
  }

  async getText(path: string, opts?: RequestOptions): Promise<string> {
    const url = `${this.baseUrl}${path}`;
    const res = await this.fetchWithRetry(url, {
      method: 'GET',
      headers: this.headers(),
      signal: opts?.signal,
    });

    if (!res.ok) {
      const body = await res.json() as ApiErrorBody;
      throw classifyError(res.status, body, res.headers);
    }

    return res.text();
  }

  async upload<T>(
    path: string,
    file: Buffer | Uint8Array,
    filename: string,
    options?: Record<string, unknown>,
    opts?: RequestOptions,
  ): Promise<T> {
    const url = `${this.baseUrl}${path}`;

    // Build multipart form body manually for Node.js without external deps
    const boundary = `----DeliverIQ${Date.now()}${Math.random().toString(36).slice(2)}`;
    const parts: Buffer[] = [];

    // File part
    parts.push(Buffer.from(
      `--${boundary}\r\nContent-Disposition: form-data; name="file"; filename="${filename}"\r\nContent-Type: application/octet-stream\r\n\r\n`
    ));
    parts.push(Buffer.from(file));
    parts.push(Buffer.from('\r\n'));

    // Optional fields
    if (options) {
      for (const [key, value] of Object.entries(options)) {
        if (value !== undefined && value !== null) {
          parts.push(Buffer.from(
            `--${boundary}\r\nContent-Disposition: form-data; name="${key}"\r\n\r\n${String(value)}\r\n`
          ));
        }
      }
    }

    parts.push(Buffer.from(`--${boundary}--\r\n`));
    const body = Buffer.concat(parts);

    const res = await this.fetchWithRetry(url, {
      method: 'POST',
      headers: {
        'MiN8T-Api-Auth': this.apiKey,
        'Content-Type': `multipart/form-data; boundary=${boundary}`,
      },
      body,
      signal: opts?.signal,
    });

    if (!res.ok) {
      const errBody = await res.json() as ApiErrorBody;
      throw classifyError(res.status, errBody, res.headers);
    }

    return res.json() as Promise<T>;
  }

  private headers(): Record<string, string> {
    return {
      'MiN8T-Api-Auth': this.apiKey,
      'Content-Type': 'application/json',
    };
  }

  private async request<T>(method: string, path: string, body?: unknown, opts?: RequestOptions): Promise<T> {
    const url = `${this.baseUrl}${path}`;
    const init: RequestInit = {
      method,
      headers: this.headers(),
      signal: opts?.signal,
    };

    if (body !== undefined) {
      init.body = JSON.stringify(body);
    }

    const res = await this.fetchWithRetry(url, init);

    if (!res.ok) {
      const errBody = await res.json() as ApiErrorBody;
      throw classifyError(res.status, errBody, res.headers);
    }

    return res.json() as Promise<T>;
  }

  private async fetchWithRetry(url: string, init: RequestInit): Promise<Response> {
    let lastError: Error | null = null;

    for (let attempt = 0; attempt <= this.maxRetries; attempt++) {
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), this.timeout);

        // Combine user signal with timeout
        const signal = init.signal
          ? anySignal(init.signal, controller.signal)
          : controller.signal;

        const res = await fetch(url, { ...init, signal });
        clearTimeout(timeoutId);

        // Retry on 429 (rate limited) and 5xx (server error)
        if (res.status === 429 && attempt < this.maxRetries) {
          const retryAfter = parseInt(res.headers.get('Retry-After') ?? '60', 10);
          await sleep(retryAfter * 1000);
          continue;
        }

        if (res.status >= 500 && attempt < this.maxRetries) {
          await sleep(Math.min(1000 * Math.pow(2, attempt), 30000));
          continue;
        }

        return res;
      } catch (err) {
        lastError = err as Error;
        if ((err as Error).name === 'AbortError' && attempt < this.maxRetries) {
          await sleep(1000 * Math.pow(2, attempt));
          continue;
        }
        throw err;
      }
    }

    throw lastError ?? new Error('Request failed after retries');
  }
}

function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

function anySignal(...signals: AbortSignal[]): AbortSignal {
  const controller = new AbortController();
  for (const signal of signals) {
    if (signal.aborted) {
      controller.abort(signal.reason);
      return controller.signal;
    }
    signal.addEventListener('abort', () => controller.abort(signal.reason), { once: true });
  }
  return controller.signal;
}
