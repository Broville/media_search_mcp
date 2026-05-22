/**
 * Sonarr proxy client — searches TVDB via local Sonarr instance.
 * No TVDB key needed; Sonarr handles the upstream authorization.
 */

export interface SonarrLookupResult {
  tvdbId: number;
  title: string;
  titleSlug?: string;
  sortTitle?: string;
  year?: number;
  overview?: string;
  seasonCount?: number;
  totalEpisodeCount?: number;
  episodeCount?: number;
  episodeFileCount?: number;
  status?: string;
  runtime?: number;
  network?: string;
  certification?: string;
  firstAired?: string;
  lastAired?: string;
  genres?: string[];
  ratings?: { value: number; votes?: number };
  images?: Array<{ coverType: string; remoteUrl: string }>;
  imdbId?: string;
  tvRageId?: number;
  tvMazeId?: number;
  aniListId?: number;
  cleanTitle?: string;
}

class SonarrClient {
  private base: string;
  private key: string;

  constructor(base: string = 'http://localhost:8989', key: string = '') {
    this.base = base.replace(/\/$/, '');
    this.key = key;
  }

  private headers(): Record<string, string> {
    return { 'X-Api-Key': this.key };
  }

  async lookup(term: string): Promise<SonarrLookupResult[]> {
    const url = new URL(`${this.base}/api/v3/series/lookup`);
    url.searchParams.set('term', term);
    const res = await fetch(url.toString(), {
      headers: this.headers(),
    });
    if (!res.ok) {
      const txt = await res.text().catch(() => 'Sonarr lookup error');
      throw new Error(`Sonarr ${res.status}: ${txt}`);
    }
    return res.json();
  }

  async getSeries(tvdbId: number): Promise<SonarrLookupResult | null> {
    const url = new URL(`${this.base}/api/v3/series`);
    url.searchParams.set('tvdbId', String(tvdbId));
    const res = await fetch(url.toString(), {
      headers: this.headers(),
    });
    if (!res.ok) {
      const txt = await res.text().catch(() => 'Sonarr get error');
      throw new Error(`Sonarr ${res.status}: ${txt}`);
    }
    const data: SonarrLookupResult[] = await res.json();
    return data[0] ?? null;
  }
}

// ─── Discovery ───

export async function discoverSonarr(): Promise<SonarrClient | null> {
  const url = process.env.SONARR_URL;
  const key = process.env.SONARR_API_KEY;

  if (url && key) {
    return new SonarrClient(url, key);
  }

  // Try localhost default port
  try {
    const test = await fetch('http://localhost:8989/api/v3/health', {
      headers: key ? { 'X-Api-Key': key } : {},
      signal: AbortSignal.timeout(2000),
    });
    if (test.ok) {
      return new SonarrClient('http://localhost:8989', key ?? '');
    }
  } catch {
    // not running locally
  }

  return null;
}

export { SonarrClient };
