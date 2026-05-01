import type { HttpClient } from '../http';
import type {
  BatchCreateRequest,
  BatchCreateResponse,
  BatchStatusResponse,
  JobListResponse,
  JobListParams,
  RequestOptions,
} from '../types';

export class Batch {
  constructor(private readonly http: HttpClient) {}

  /** Submit a batch of emails for verification. Always returns 202 with a jobId. Costs 1 credit per email. */
  async create(params: BatchCreateRequest, opts?: RequestOptions): Promise<BatchCreateResponse> {
    return this.http.post<BatchCreateResponse>('/verify/batch', params, opts);
  }

  /** Upload a CSV or TXT file for batch verification. Max 10MB, up to 100,000 emails. */
  async upload(
    file: Buffer | Uint8Array,
    filename: string,
    options?: {
      skipSmtp?: boolean;
      checkGravatar?: boolean;
      checkHibp?: boolean;
      skipIntelligence?: boolean;
      callbackUrl?: string;
    },
    opts?: RequestOptions,
  ): Promise<BatchCreateResponse> {
    return this.http.upload<BatchCreateResponse>('/verify/upload', file, filename, options, opts);
  }

  /** Poll the status of a batch job. */
  async status(jobId: string, opts?: RequestOptions): Promise<BatchStatusResponse> {
    return this.http.get<BatchStatusResponse>(`/verify/batch/${enc(jobId)}`, opts);
  }

  /** Download results as CSV text. Optionally filter by category. */
  async download(jobId: string, category?: 'safe' | 'risky' | 'invalid' | 'unknown', opts?: RequestOptions): Promise<string> {
    const qs = category ? `?category=${category}` : '';
    return this.http.getText(`/verify/batch/${enc(jobId)}/download${qs}`, opts);
  }

  /** Cancel a pending or processing batch job. */
  async cancel(jobId: string, opts?: RequestOptions): Promise<{ success: true; jobId: string; status: 'cancelled' }> {
    return this.http.delete(`/verify/batch/${enc(jobId)}`, opts);
  }

  /** List verification jobs with pagination. */
  async list(params?: JobListParams, opts?: RequestOptions): Promise<JobListResponse> {
    const qs = new URLSearchParams();
    if (params?.page) qs.set('page', String(params.page));
    if (params?.limit) qs.set('limit', String(params.limit));
    if (params?.status) qs.set('status', params.status);
    const query = qs.toString();
    return this.http.get<JobListResponse>(`/verify/jobs${query ? `?${query}` : ''}`, opts);
  }

  /**
   * Poll a job until it reaches a terminal state (completed, failed, cancelled).
   * @param jobId - The job ID to poll
   * @param intervalMs - Polling interval in ms (default: 5000)
   * @param onProgress - Optional callback fired on each poll
   * @returns The final job status
   */
  async waitForCompletion(
    jobId: string,
    intervalMs = 5000,
    onProgress?: (status: BatchStatusResponse) => void,
  ): Promise<BatchStatusResponse> {
    const terminal = new Set(['completed', 'failed', 'cancelled']);
    while (true) {
      const res = await this.status(jobId);
      onProgress?.(res);
      if (terminal.has(res.status)) return res;
      await sleep(intervalMs);
    }
  }
}

function enc(s: string): string {
  return encodeURIComponent(s);
}

function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}
