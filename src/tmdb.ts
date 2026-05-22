/**
 * TMDB v3 API client
 */

const TMDB_BASE = 'https://api.themoviedb.org/3';
const IMG_BASE  = 'https://image.tmdb.org/t/p';

export interface TmdbSearchResult <T = unknown> {
  page: number;
  results: T[];
  total_results: number;
  total_pages: number;
}

export interface TmdbMultiResult {
  id: number;
  media_type: 'movie' | 'tv' | 'person';
  title?: string;                // movie only
  name?: string;                 // tv / person
  original_title?: string;
  original_name?: string;
  overview?: string;
  poster_path?: string | null;
  backdrop_path?: string | null;
  profile_path?: string | null;
  genre_ids?: number[];
  popularity: number;
  adult: boolean;
  release_date?: string;         // movie
  first_air_date?: string;       // tv
  origin_country?: string[];     // tv
  original_language?: string;
  known_for_department?: string; // person
  vote_average?: number;
  vote_count?: number;
  video?: boolean;               // movie
}

export interface TmdbMovieDetails {
  id: number;
  title: string;
  original_title: string;
  overview: string;
  tagline?: string;
  status?: string;
  release_date?: string;
  runtime?: number;
  budget?: number;
  revenue?: number;
  adult: boolean;
  imdb_id?: string | null;
  homepage?: string | null;
  poster_path?: string | null;
  backdrop_path?: string | null;
  vote_average: number;
  vote_count: number;
  popularity: number;
  genres?: Array<{ id: number; name: string }>;
  production_companies?: Array<{ id: number; name: string; logo_path?: string | null; origin_country?: string }>;
  production_countries?: Array<{ iso_3166_1: string; name: string }>;
  spoken_languages?: Array<{ iso_639_1: string; name: string; english_name?: string }>;
  belongs_to_collection?: { id: number; name: string; poster_path?: string | null; backdrop_path?: string | null } | null;
}

export interface TmdbTvDetails {
  id: number;
  name: string;
  original_name: string;
  overview: string;
  tagline?: string;
  status?: string;
  type?: string;
  first_air_date?: string;
  last_air_date?: string | null;
  in_production?: boolean;
  number_of_episodes?: number;
  number_of_seasons?: number;
  episode_run_time?: number[];
  poster_path?: string | null;
  backdrop_path?: string | null;
  vote_average: number;
  vote_count: number;
  popularity: number;
  genres?: Array<{ id: number; name: string }>;
  networks?: Array<{ id: number; name: string; logo_path?: string | null; origin_country?: string }>;
  origin_country?: string[];
  original_language?: string;
  created_by?: Array<{ id: number; name: string; profile_path?: string | null }>;
  seasons?: Array<{
    id: number; name: string; overview?: string; season_number: number;
    episode_count?: number; air_date?: string | null; poster_path?: string | null;
  }>;
}

export interface TmdbSeasonDetails {
  _id?: string;
  id: number;
  name: string;
  overview?: string;
  season_number: number;
  air_date?: string | null;
  poster_path?: string | null;
  episodes?: Array<{
    id: number; name: string; overview?: string; episode_number: number;
    season_number: number; air_date?: string | null; still_path?: string | null;
    runtime?: number; vote_average?: number; vote_count?: number;
  }>;
}

export interface TmdbEpisodeDetails {
  id: number;
  name: string;
  overview?: string;
  air_date?: string | null;
  episode_number: number;
  season_number: number;
  still_path?: string | null;
  runtime?: number;
  vote_average?: number;
  vote_count?: number;
}

export interface TmdbGenreList {
  genres: Array<{ id: number; name: string }>;
}

export interface TmdbLanguage {
  iso_639_1: string; english_name: string; name: string;
}

export type TmdbTrendingMedia = 'all' | 'movie' | 'tv';
export type TmdbTimeWindow   = 'day' | 'week';

function buildImgUrl(path: string | null | undefined, size = 'w500'): string | undefined {
  return path ? `${IMG_BASE}/${size}${path}` : undefined;
}

export class TmdbClient {
  private apiKey: string;

  constructor(apiKey: string) {
    if (!apiKey) throw new Error('TMDB API key is required. Set TMDB_API_KEY env var.');
    this.apiKey = apiKey;
  }

  private async fetchJson<T>(path: string): Promise<T> {
    const url = new URL(TMDB_BASE + path);
    url.searchParams.set('api_key', this.apiKey);
    const res = await fetch(url.toString());
    if (!res.ok) {
      const txt = await res.text().catch(() => 'TMDB error');
      throw new Error(`TMDB ${res.status}: ${txt}`);
    }
    return res.json();
  }

  searchMulti(q: string, adult = false, lang = 'en-US', page = 1): Promise<TmdbSearchResult<TmdbMultiResult>> {
    return this.fetchJson(`/search/multi?query=${enc(q)}&include_adult=${adult}&language=${enc(lang)}&page=${page}`);
  }
  searchMovies(q: string, year?: number, primary_release_year?: number, lang = 'en-US', page = 1): Promise<TmdbSearchResult<TmdbMultiResult>> {
    let p = `/search/movie?query=${enc(q)}&language=${enc(lang)}&page=${page}`;
    if (year !== undefined) p += `&year=${year}`;
    if (primary_release_year !== undefined) p += `&primary_release_year=${primary_release_year}`;
    return this.fetchJson(p);
  }
  searchTv(q: string, first_air_date_year?: number, lang = 'en-US', page = 1): Promise<TmdbSearchResult<TmdbMultiResult>> {
    let p = `/search/tv?query=${enc(q)}&language=${enc(lang)}&page=${page}`;
    if (first_air_date_year !== undefined) p += `&first_air_date_year=${first_air_date_year}`;
    return this.fetchJson(p);
  }

  movieDetails(id: number, append?: string, lang = 'en-US'): Promise<TmdbMovieDetails> {
    let p = `/movie/${id}?language=${enc(lang)}`;
    if (append) p += `&append_to_response=${enc(append)}`;
    return this.fetchJson(p);
  }
  tvDetails(id: number, append?: string, lang = 'en-US'): Promise<TmdbTvDetails> {
    let p = `/tv/${id}?language=${enc(lang)}`;
    if (append) p += `&append_to_response=${enc(append)}`;
    return this.fetchJson(p);
  }
  tvSeason(seriesId: number, seasonNumber: number, lang = 'en-US'): Promise<TmdbSeasonDetails> {
    return this.fetchJson(`/tv/${seriesId}/season/${seasonNumber}?language=${enc(lang)}`);
  }
  tvEpisode(seriesId: number, seasonNumber: number, episodeNumber: number, lang = 'en-US'): Promise<TmdbEpisodeDetails> {
    return this.fetchJson(`/tv/${seriesId}/season/${seasonNumber}/episode/${episodeNumber}?language=${enc(lang)}`);
  }

  trending(media: TmdbTrendingMedia, timeWindow: TmdbTimeWindow, lang = 'en-US'): Promise<TmdbSearchResult<TmdbMultiResult>> {
    return this.fetchJson(`/trending/${media}/${timeWindow}?language=${enc(lang)}`);
  }
  genres(type: 'movie' | 'tv', lang = 'en'): Promise<TmdbGenreList> {
    return this.fetchJson(`/genre/${type}/list?language=${enc(lang)}`);
  }
  languages(): Promise<TmdbLanguage[]> {
    return this.fetchJson('/configuration/languages');
  }

  static img(path: string | null | undefined, size = 'w500'): string | undefined {
    return buildImgUrl(path, size);
  }
}

function enc(v: string) { return encodeURIComponent(v); }
