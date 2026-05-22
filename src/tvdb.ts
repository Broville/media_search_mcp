import type {
  TvdbLoginResponse,
  TvdbSearchResult,
  TvdbSeriesResponse,
  TvdbSeriesExtendedResponse,
  TvdbEpisodesResponse,
  TvdbRemoteIdResponse,
  TvdbSeasonTypesResponse,
  TvdbUpdatesResponse,
  TvdbArtworkListResponse,
} from './types.js';

const TVDB_BASE = 'https://api4.thetvdb.com/v4';

class TvdbClient {
  private token: string | null = null;
  private expiry: number = 0;

  private get apiKey(): string {
    const key = process.env.TVDB_API_KEY;
    if (!key) {
      throw new Error('TVDB_API_KEY environment variable is required');
    }
    return key;
  }

  private async ensureAuth(): Promise<string> {
    const now = Date.now();
    if (this.token && this.expiry > now) {
      return this.token;
    }

    const res = await fetch(`${TVDB_BASE}/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
      body: JSON.stringify({ apikey: this.apiKey }),
    });

    if (!res.ok) {
      const text = await res.text().catch(() => 'Unknown error');
      throw new Error(`TVDB login ${res.status}: ${text}`);
    }

    const data = (await res.json()) as TvdbLoginResponse;
    this.token = data.data.token;
    // Tokens valid for ~1 month; refresh after 25 days to be safe
    this.expiry = now + 25 * 24 * 60 * 60 * 1000;
    return this.token;
  }

  private getHeaders(token: string): Record<string, string> {
    return {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
      Accept: 'application/json',
    };
  }

  private buildUrl(path: string, params: Record<string, unknown> = {}): string {
    const url = new URL(TVDB_BASE + path);
    for (const [key, value] of Object.entries(params)) {
      if (value !== undefined && value !== null && value !== '') {
        url.searchParams.set(key, String(value));
      }
    }
    return url.toString();
  }

  private async fetch<T>(path: string, params?: Record<string, unknown>): Promise<T> {
    const token = await this.ensureAuth();
    const url = this.buildUrl(path, params);

    const res = await fetch(url, { headers: this.getHeaders(token) });

    if (!res.ok) {
      const text = await res.text().catch(() => 'Unknown error');
      throw new Error(`TVDB ${res.status}: ${text}`);
    }

    return res.json() as Promise<T>;
  }

  // Search
  async search(query: string, opts?: { type?: string; year?: string; country?: string; language?: string; offset?: number; limit?: number }) {
    return this.fetch<TvdbSearchResult>('/search', {
      query,
      type: opts?.type,
      year: opts?.year,
      country: opts?.country,
      language: opts?.language,
      offset: opts?.offset ?? 0,
      limit: opts?.limit ?? 10,
    });
  }

  async searchByRemoteId(remoteId: string) {
    return this.fetch<TvdbRemoteIdResponse>(`/search/remoteid/${remoteId}`);
  }

  // Series
  async getSeries(id: string | number) {
    return this.fetch<TvdbSeriesResponse>(`/series/${id}`);
  }

  async getSeriesExtended(id: string | number, opts?: { meta?: string; short?: boolean }) {
    const params: Record<string, unknown> = {};
    if (opts?.meta) params.meta = opts.meta;
    if (opts?.short !== undefined) params.short = opts.short;
    return this.fetch<TvdbSeriesExtendedResponse>(`/series/${id}/extended`, params);
  }

  async getSeriesEpisodes(id: string | number, seasonType: number, page?: number) {
    return this.fetch<TvdbEpisodesResponse>(`/series/${id}/episodes/${seasonType}`, {
      page: page ?? 0,
    });
  }

  async getSeriesArtworks(id: string | number, opts?: { lang?: string; type?: string }) {
    const params: Record<string, unknown> = {};
    if (opts?.lang) params.lang = opts.lang;
    if (opts?.type) params.type = opts.type;
    return this.fetch<TvdbArtworkListResponse>(`/series/${id}/artworks`, params);
  }

  async getSeriesBySlug(slug: string) {
    return this.fetch<TvdbSeriesResponse>(`/series/slug/${slug}`);
  }

  // Episodes
  async getEpisode(id: string | number) {
    return this.fetch<TvdbEpisodesResponse>(`/episodes/${id}`);
  }

  async getEpisodeExtended(id: string | number, opts?: { meta?: string }) {
    const params: Record<string, unknown> = {};
    if (opts?.meta) params.meta = opts.meta;
    return this.fetch<TvdbEpisodesResponse>(`/episodes/${id}/extended`, params);
  }

  // Seasons
  async getSeasonExtended(id: string | number) {
    return this.fetch<unknown>(`/seasons/${id}/extended`);
  }

  async getSeasonTypes() {
    return this.fetch<TvdbSeasonTypesResponse>('/seasons/types');
  }

  // Artworks
  async getArtwork(id: string | number) {
    return this.fetch<unknown>(`/artwork/${id}`);
  }

  async getArtworkExtended(id: string | number) {
    return this.fetch<unknown>(`/artwork/${id}/extended`);
  }

  async getArtworkTypes() {
    return this.fetch<unknown>('/artwork/types');
  }

  // Updates
  async getUpdates(since: number) {
    return this.fetch<TvdbUpdatesResponse>('/updates', { since });
  }
}

export const tvdb = new TvdbClient();
