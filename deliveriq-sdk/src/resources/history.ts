import type { HttpClient } from '../http';
import type {
  ToolType,
  HistoryEntry,
  SaveHistoryRequest,
  RequestOptions,
} from '../types';

export class History {
  constructor(private readonly http: HttpClient) {}

  /** Get saved tool lookup history (max 25 entries per tool type). */
  async get(toolType: ToolType, opts?: RequestOptions): Promise<{ success: true; entries: HistoryEntry[] }> {
    return this.http.get(`/tools/history/${encodeURIComponent(toolType)}`, opts);
  }

  /** Save a tool lookup result. Deduplicates by input — replaces existing entry for same input. */
  async save(params: SaveHistoryRequest, opts?: RequestOptions): Promise<{ success: true; entry: HistoryEntry }> {
    return this.http.post('/tools/history', params, opts);
  }

  /** Clear all history entries for a tool type. */
  async clear(toolType: ToolType, opts?: RequestOptions): Promise<{ success: true }> {
    return this.http.delete(`/tools/history/${encodeURIComponent(toolType)}`, opts);
  }
}
