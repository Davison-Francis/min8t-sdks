import type { HttpClient } from '../http';
import type {
  VerifyRequest,
  VerifyResponse,
  RequestOptions,
} from '../types';

export class Verification {
  constructor(private readonly http: HttpClient) {}

  /** Verify a single email address through the full 20-check pipeline. Costs 1 credit (0 if syntax invalid). */
  async verify(params: VerifyRequest, opts?: RequestOptions): Promise<VerifyResponse> {
    return this.http.post<VerifyResponse>('/verify', params, opts);
  }
}
