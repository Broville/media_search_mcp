/**
 * Radarr proxy client — searches TMDB via local Radarr instance.
 * No TMDB key needed; Radarr handles the upstream authorization.
 */

export interface RadarrMovie {
  tmdbId: number;
  title: string;
  year: number;
  overview?: string;
  runtime?: number;
  posterUrl?: string;
  fanartUrl?: string;
  genres?: string[];
  rating?: number;
  certification?: string;
  imdbId?: string;
  studio?: string;
  inCinemas?: string;
  youTubeTrailerId?: string;
  website?: string;
}

export interface RadarrMovieLookupResult {
  tmdbId: number;
  title: string;
  year: number;
  overview: string;
  runtime: number;
  images: Array<{ coverType: string; url: string }>;
  genres: string[];
  ratings?: { value: number; votes?: number };
  certification?: string;
  imdbId?: string;
  studio?: string;
  inCinemas?: string;
  youTubeTrailerId?: string;
  website?: string;
}

class RadarrClient {
  private base: string;
  private key: string;

  constructor(base: string = 'http://localhost:7878', key: string = '') {
    this.base = base.replace(/\/$/, '');
    this.key = key;
  }

  private headers(): Record<string, string> {
    return { 'X-Api-Key': this.key };
  }

  async lookup(term: string): Promise<RadarrMovieLookupResult[]> {
    const url = new URL(`${this.base}/api/v3/movie/lookup`);
    url.searchParams.set('term', term);
    const res = await fetch(url.toString(), {
      headers: this.headers(),
    });
    if (!res.ok) {
      const txt = await res.text().catch(() => 'Radarr lookup error');
      throw new Error(`Radarr ${res.status}: ${txt}`);
    }
    return res.json();
  }

  async lookupByTmdbId(tmdbId: number): Promise<RadarrMovieLookupResult> {
    const url = new URL(`${this.base}/api/v3/movie/lookup/tmdb`);
    url.searchParams.set('tmdbId', String(tmdbId));
    const res = await fetch(url.toString(), {
      headers: this.headers(),
    });
    if (!res.ok) {
      const txt = await res.text().catch(() => 'Radarr lookup error');
      throw new Error(`Radarr ${res.status}: ${txt}`);
    }
    return res.json();
  }

  async lookupByImdbId(imdbId: string): Promise<RadarrMovieLookupResult> {
    const url = new URL(`${this.base}/api/v3/movie/lookup/imdb`);
    url.searchParams.set('imdbId', imdbId);
    const res = await fetch(url.toString(), {
      headers: this.headers(),
    });
    if (!res.ok) {
      const txt = await res.text().catch(() => 'Radarr lookup error');
      throw new Error(`Radarr ${res.status}: ${txt}`);
    }
    return res.json();
  }

  async list(): Promise<RadarrMovie[]> {
    const url = new URL(`${this.base}/api/v3/movie`);
    const res = await fetch(url.toString(), {
      headers: this.headers(),
    });
    if (!res.ok) {
      const txt = await res.text().catch(() => 'Radarr list error');
      throw new Error(`Radarr ${res.status}: ${txt}`);
    }
    return res.json();
  }
}

// ─── Discovery ───

export async function discoverRadarr(): Promise<RadarrClient | null> {
  const url = process.env.RADARR_URL;
  const key = process.env.RADARR_API_KEY;

  if (url && key) {
    return new RadarrClient(url, key);
  }

  // Try localhost default port
  try {
    const test = await fetch('http://localhost:7878/api/v3/health', {
      headers: key ? { 'X-Api-Key': key } : {},
      signal: AbortSignal.timeout(2000),
    });
    if (test.ok) {
      return new RadarrClient('http://localhost:7878', key ?? '');
    }
  } catch {
    // not running locally
  }

  return null;
}

export { RadarrClient };
