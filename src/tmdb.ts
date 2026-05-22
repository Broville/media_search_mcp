import type {
  TmdbSearchResult,
  TmdbMovieDetails,
  TmdbTvDetails,
  TmdbSeasonDetails,
  TmdbEpisode,
  TmdbTrendingResult,
  TmdbGenreList,
  TmdbConfigLanguage,
} from './types.js';

const TMDB_BASE = 'https://api.themoviedb.org/3';

function getHeaders(): Record<string, string> {
  const token = process.env.TMDB_READ_ACCESS_TOKEN;
  const apiKey = process.env.TMDB_API_KEY;

  const headers: Record<string, string> = {
    Accept: 'application/json',
    'Content-Type': 'application/json',
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  return headers;
}

function buildUrl(path: string, params: Record<string, unknown>): string {
  const url = new URL(TMDB_BASE + path);

  const apiKey = process.env.TMDB_API_KEY;
  const token = process.env.TMDB_READ_ACCESS_TOKEN;

  if (apiKey && !token) {
    url.searchParams.set('api_key', apiKey);
  }

  for (const [key, value] of Object.entries(params)) {
    if (value !== undefined && value !== null && value !== '') {
      url.searchParams.set(key, String(value));
    }
  }

  return url.toString();
}

async function fetchTmdb<T>(path: string, params: Record<string, unknown> = {}): Promise<T> {
  const url = buildUrl(path, params);
  const res = await fetch(url, { headers: getHeaders() });

  if (!res.ok) {
    const text = await res.text().catch(() => 'Unknown error');
    throw new Error(`TMDB ${res.status}: ${text}`);
  }

  return res.json() as Promise<T>;
}

// Search
export function searchMulti(query: string, opts?: { include_adult?: boolean; language?: string; page?: number }) {
  return fetchTmdb<TmdbSearchResult>('/search/multi', {
    query,
    include_adult: opts?.include_adult ?? false,
    language: opts?.language ?? 'en-US',
    page: opts?.page ?? 1,
  });
}

export function searchMovies(query: string, opts?: { year?: number; primary_release_year?: number; region?: string; language?: string; page?: number; include_adult?: boolean }) {
  return fetchTmdb<TmdbSearchResult>('/search/movie', {
    query,
    year: opts?.year,
    primary_release_year: opts?.primary_release_year,
    region: opts?.region,
    language: opts?.language ?? 'en-US',
    page: opts?.page ?? 1,
    include_adult: opts?.include_adult ?? false,
  });
}

export function searchTv(query: string, opts?: { first_air_date_year?: number; year?: number; language?: string; page?: number; include_adult?: boolean }) {
  return fetchTmdb<TmdbSearchResult>('/search/tv', {
    query,
    first_air_date_year: opts?.first_air_date_year,
    year: opts?.year,
    language: opts?.language ?? 'en-US',
    page: opts?.page ?? 1,
    include_adult: opts?.include_adult ?? false,
  });
}

// Details
export function getMovieDetails(movieId: number, opts?: { language?: string; append?: string }) {
  const params: Record<string, unknown> = {
    language: opts?.language ?? 'en-US',
  };
  if (opts?.append) {
    params.append_to_response = opts.append;
  }
  return fetchTmdb<TmdbMovieDetails>(`/movie/${movieId}`, params);
}

export function getTvDetails(seriesId: number, opts?: { language?: string; append?: string }) {
  const params: Record<string, unknown> = {
    language: opts?.language ?? 'en-US',
  };
  if (opts?.append) {
    params.append_to_response = opts.append;
  }
  return fetchTmdb<TmdbTvDetails>(`/tv/${seriesId}`, params);
}

export function getTvSeason(seriesId: number, seasonNumber: number, opts?: { language?: string; append?: string }) {
  const params: Record<string, unknown> = {
    language: opts?.language ?? 'en-US',
  };
  if (opts?.append) {
    params.append_to_response = opts.append;
  }
  return fetchTmdb<TmdbSeasonDetails>(`/tv/${seriesId}/season/${seasonNumber}`, params);
}

export function getTvEpisode(seriesId: number, seasonNumber: number, episodeNumber: number, opts?: { language?: string; append?: string }) {
  const params: Record<string, unknown> = {
    language: opts?.language ?? 'en-US',
  };
  if (opts?.append) {
    params.append_to_response = opts.append;
  }
  return fetchTmdb<TmdbEpisode>(`/tv/${seriesId}/season/${seasonNumber}/episode/${episodeNumber}`, params);
}

// Trending
export function getTrending(mediaType: 'all' | 'movie' | 'tv', timeWindow: 'day' | 'week', opts?: { language?: string }) {
  return fetchTmdb<TmdbTrendingResult>(`/trending/${mediaType}/${timeWindow}`, {
    language: opts?.language ?? 'en-US',
  });
}

// Genres
export function getGenres(type: 'movie' | 'tv', opts?: { language?: string }) {
  return fetchTmdb<TmdbGenreList>(`/genre/${type}/list`, {
    language: opts?.language ?? 'en',
  });
}

// Languages
export function getLanguages(): Promise<TmdbConfigLanguage[]> {
  return fetchTmdb<TmdbConfigLanguage[]>('/configuration/languages');
}
