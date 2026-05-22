/**
 * TVmaze keyless API client — used when Sonarr is not available.
 * Provides TV show search, episodes, and cast data with zero authentication.
 */

export interface TvMazeShow {
  id: number;
  name: string;
  type?: string;
  language?: string;
  genres?: string[];
  status?: string;
  runtime?: number;
  averageRuntime?: number;
  premiered?: string;
  ended?: string;
  officialSite?: string;
  schedule?: { time: string; days: string[] };
  rating?: { average?: number };
  weight?: number;
  network?: { id: number; name: string; country?: { name: string; code: string } };
  webChannel?: { id: number; name: string; country?: { name: string; code: string } };
  externals?: { imdb?: string; thetvdb?: number; tvrage?: number };
  image?: { medium?: string; original?: string };
  summary?: string;
  updated?: number;
  links?: { self: { href: string } };
}

export interface TvMazeEpisode {
  id: number;
  name: string;
  season: number;
  number: number;
  type: string;
  airdate: string;
  airtime: string;
  airstamp: string;
  runtime: number;
  rating?: { average?: number };
  image?: { medium?: string; original?: string };
  summary?: string;
}

export interface TvMazeSearchResult {
  score: number;
  show: TvMazeShow;
}

class TvMazeClient {
  private readonly base = 'https://api.tvmaze.com';

  async search(query: string): Promise<TvMazeSearchResult[]> {
    const url = new URL(`${this.base}/search/shows`);
    url.searchParams.set('q', query);
    const res = await fetch(url.toString());
    if (!res.ok) {
      const txt = await res.text().catch(() => 'TVmaze error');
      throw new Error(`TVmaze ${res.status}: ${txt}`);
    }
    return res.json();
  }

  async getShow(id: number): Promise<TvMazeShow> {
    const res = await fetch(`${this.base}/shows/${id}`);
    if (!res.ok) {
      const txt = await res.text().catch(() => 'TVmaze error');
      throw new Error(`TVmaze ${res.status}: ${txt}`);
    }
    return res.json();
  }

  async getEpisodes(showId: number): Promise<TvMazeEpisode[]> {
    const res = await fetch(`${this.base}/shows/${showId}/episodes`);
    if (!res.ok) {
      const txt = await res.text().catch(() => 'TVmaze error');
      throw new Error(`TVmaze ${res.status}: ${txt}`);
    }
    return res.json();
  }

  async getSeasons(showId: number): Promise<Array<{ id: number; number: number; name: string; episodeOrder: number; premiereDate: string; endDate: string }>> {
    const res = await fetch(`${this.base}/shows/${showId}/seasons`);
    if (!res.ok) {
      const txt = await res.text().catch(() => 'TVmaze error');
      throw new Error(`TVmaze ${res.status}: ${txt}`);
    }
    return res.json();
  }

  async getCast(showId: number): Promise<Array<{ person: { name: string; birthday: string; gender: string; country: { name: string } }; character: { name: string } }>> {
    const res = await fetch(`${this.base}/shows/${showId}/cast`);
    if (!res.ok) {
      const txt = await res.text().catch(() => 'TVmaze error');
      throw new Error(`TVmaze ${res.status}: ${txt}`);
    }
    return res.json();
  }
}

export { TvMazeClient };
