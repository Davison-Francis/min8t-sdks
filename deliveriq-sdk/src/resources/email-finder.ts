import type { HttpClient } from '../http';
import type {
  EmailFinderRequest,
  EmailFinderResponse,
  BulkEmailFinderResponse,
  RequestOptions,
} from '../types';

export class EmailFinder {
  constructor(private readonly http: HttpClient) {}

  /** Find a business email by person name and company domain. Costs 2 credits. */
  async find(params: EmailFinderRequest, opts?: RequestOptions): Promise<EmailFinderResponse> {
    return this.http.post<EmailFinderResponse>('/tools/email-finder', params, opts);
  }

  /** Find emails for up to 50 contacts in bulk. Costs 2 credits per contact. */
  async bulkFind(contacts: EmailFinderRequest[], opts?: RequestOptions): Promise<BulkEmailFinderResponse> {
    return this.http.post<BulkEmailFinderResponse>('/tools/email-finder/bulk', { contacts }, opts);
  }
}
