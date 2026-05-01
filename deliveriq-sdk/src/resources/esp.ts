import type { HttpClient } from '../http';
import type {
  EspProvider,
  EspList,
  EspSyncRequest,
  EspSyncResponse,
  EspPushResultsRequest,
  RequestOptions,
} from '../types';

export class Esp {
  constructor(private readonly http: HttpClient) {}

  /** List all available ESP providers. */
  async providers(opts?: RequestOptions): Promise<{ success: true; providers: EspProvider[] }> {
    return this.http.get('/esp/providers', opts);
  }

  /** Fetch contact lists from a connected ESP provider. */
  async lists(providerId: string, opts?: RequestOptions): Promise<{ success: true; lists: EspList[] }> {
    return this.http.get(`/esp/${encodeURIComponent(providerId)}/lists`, opts);
  }

  /** Import and verify contacts from an ESP list. Costs 1 credit per email. */
  async sync(params: EspSyncRequest, opts?: RequestOptions): Promise<EspSyncResponse> {
    return this.http.post<EspSyncResponse>('/esp/sync', params, opts);
  }

  /** Push categorized verification results back to the ESP. */
  async pushResults(params: EspPushResultsRequest, opts?: RequestOptions): Promise<{ success: true }> {
    return this.http.post('/esp/push-results', params, opts);
  }
}
