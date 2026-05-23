#!/usr/bin/env node
import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from '@modelcontextprotocol/sdk/types.js';
import { execSync } from 'child_process';

import { TmdbClient } from './tmdb.js';

/* ─── Config ─── */

function getApiKey(): string {
  if (process.env.TMDB_API_KEY) return process.env.TMDB_API_KEY;
  try {
    const out = execSync('op item get "TMDB API Key" --vault Server --field api-key 2>/dev/null');
    return out.toString().trim();
  } catch {
    throw new Error('TMDB_API_KEY not set and 1Password TMDB API Key not found.');
  }
}

const client = new TmdbClient(getApiKey());

/* ─── Helpers ─── */

function clean(obj: Record<string, unknown>): Record<string, unknown> {
  return Object.fromEntries(Object.entries(obj).filter(([, v]) => v !== undefined && v !== null));
}

/* ─── Tool definitions ─── */

const TOOLS = [
  {
    name: 'media_search',
    description: 'Search movies, TV shows, and people on TMDB (multi-search).',
    inputSchema: {
      type: 'object' as const,
      properties: {
        query: { type: 'string' },
        include_adult: { type: 'boolean', default: false },
        language: { type: 'string', default: 'en-US' },
        page: { type: 'number', default: 1 },
      },
      required: ['query'],
    },
  },
  {
    name: 'media_search_movies',
    description: 'Search movies on TMDB.',
    inputSchema: {
      type: 'object' as const,
      properties: {
        query: { type: 'string' },
        year: { type: 'number' },
        primary_release_year: { type: 'number' },
        language: { type: 'string', default: 'en-US' },
        page: { type: 'number', default: 1 },
      },
      required: ['query'],
    },
  },
  {
    name: 'media_search_tv',
    description: 'Search TV shows on TMDB.',
    inputSchema: {
      type: 'object' as const,
      properties: {
        query: { type: 'string' },
        first_air_date_year: { type: 'number' },
        language: { type: 'string', default: 'en-US' },
        page: { type: 'number', default: 1 },
      },
      required: ['query'],
    },
  },
  {
    name: 'media_movie_details',
    description: 'Get full TMDB movie details by ID. Use append_to_response for credits, videos, recommendations, similar, images, external_ids, keywords, release_dates.',
    inputSchema: {
      type: 'object' as const,
      properties: {
        movie_id: { type: 'number' },
        append: { type: 'string', description: 'e.g. credits,videos,recommendations' },
        language: { type: 'string', default: 'en-US' },
      },
      required: ['movie_id'],
    },
  },
  {
    name: 'media_tv_details',
    description: 'Get full TMDB TV series details by ID. Use append_to_response for credits, videos, recommendations, similar, images, external_ids, keywords.',
    inputSchema: {
      type: 'object' as const,
      properties: {
        series_id: { type: 'number' },
        append: { type: 'string', description: 'e.g. credits,videos' },
        language: { type: 'string', default: 'en-US' },
      },
      required: ['series_id'],
    },
  },
  {
    name: 'media_tv_season',
    description: 'Get TMDB season details with episodes.',
    inputSchema: {
      type: 'object' as const,
      properties: {
        series_id: { type: 'number' },
        season_number: { type: 'number' },
        language: { type: 'string', default: 'en-US' },
      },
      required: ['series_id', 'season_number'],
    },
  },
  {
    name: 'media_tv_episode',
    description: 'Get TMDB single episode details.',
    inputSchema: {
      type: 'object' as const,
      properties: {
        series_id: { type: 'number' },
        season_number: { type: 'number' },
        episode_number: { type: 'number' },
        language: { type: 'string', default: 'en-US' },
      },
      required: ['series_id', 'season_number', 'episode_number'],
    },
  },
  {
    name: 'media_trending',
    description: 'Get trending movies or TV.',
    inputSchema: {
      type: 'object' as const,
      properties: {
        media_type: { type: 'string', enum: ['all', 'movie', 'tv'], default: 'all' },
        time_window: { type: 'string', enum: ['day', 'week'], default: 'week' },
        language: { type: 'string', default: 'en-US' },
      },
      required: ['media_type', 'time_window'],
    },
  },
  {
    name: 'media_genres',
    description: 'Get TMDB genre list.',
    inputSchema: {
      type: 'object' as const,
      properties: {
        type: { type: 'string', enum: ['movie', 'tv'] },
        language: { type: 'string', default: 'en' },
      },
      required: ['type'],
    },
  },
  {
    name: 'media_languages',
    description: 'Get TMDB supported languages.',
    inputSchema: {
      type: 'object' as const,
      properties: {},
    },
  },
];

/* ─── Server ─── */

const server = new Server(
  { name: 'media-search-mcp', version: '1.1.0' },
  { capabilities: { tools: {} } }
);

function pickTitle(r: { title?: string; name?: string }): string | undefined {
  return r.title ?? r.name;
}

function flattenMulti(raw: unknown): Record<string, unknown> {
  const r = raw as Record<string, unknown>;
  return clean({
    id: r.id,
    media_type: r.media_type,
    title: pickTitle(r),
    year: (r.release_date as string | undefined)?.slice(0, 4)
       ?? (r.first_air_date as string | undefined)?.slice(0, 4),
    overview: r.overview,
    poster_url: TmdbClient.img(r.poster_path as string | null | undefined, 'w500'),
    backdrop_url: TmdbClient.img(r.backdrop_path as string | null | undefined, 'w780'),
    profile_url: TmdbClient.img(r.profile_path as string | null | undefined, 'w500'),
    genre_ids: r.genre_ids,
    popularity: r.popularity,
    vote_average: r.vote_average,
    vote_count: r.vote_count,
    original_language: r.original_language,
    release_date: r.release_date,
    first_air_date: r.first_air_date,
    origin_country: r.origin_country,
    known_for_department: r.known_for_department,
  });
}

server.setRequestHandler(ListToolsRequestSchema, async () => ({ tools: TOOLS }));

server.setRequestHandler(CallToolRequestSchema, async (req) => {
  const { name, arguments: args } = req.params;

  try {
    let result: unknown;

    switch (name) {
      case 'media_search': {
        const a = args as { query: string; include_adult?: boolean; language?: string; page?: number };
        const raw = await client.searchMulti(a.query, a.include_adult, a.language, a.page ?? 1);
        result = { page: raw.page, total_pages: raw.total_pages, total_results: raw.total_results, results: raw.results.map(flattenMulti) };
        break;
      }
      case 'media_search_movies': {
        const a = args as { query: string; year?: number; primary_release_year?: number; language?: string; page?: number };
        const raw = await client.searchMovies(a.query, a.year, a.primary_release_year, a.language, a.page ?? 1);
        result = { page: raw.page, total_pages: raw.total_pages, total_results: raw.total_results, results: raw.results.map(flattenMulti) };
        break;
      }
      case 'media_search_tv': {
        const a = args as { query: string; first_air_date_year?: number; language?: string; page?: number };
        const raw = await client.searchTv(a.query, a.first_air_date_year, a.language, a.page ?? 1);
        result = { page: raw.page, total_pages: raw.total_pages, total_results: raw.total_results, results: raw.results.map(flattenMulti) };
        break;
      }
      case 'media_movie_details': {
        const a = args as { movie_id: number; append?: string; language?: string };
        const detail = await client.movieDetails(a.movie_id, a.append, a.language);
        result = clean({
          ...detail,
          poster_url: TmdbClient.img(detail.poster_path, 'w500'),
          backdrop_url: TmdbClient.img(detail.backdrop_path, 'w780'),
        });
        break;
      }
      case 'media_tv_details': {
        const a = args as { series_id: number; append?: string; language?: string };
        const detail = await client.tvDetails(a.series_id, a.append, a.language);
        result = clean({
          ...detail,
          poster_url: TmdbClient.img(detail.poster_path, 'w500'),
          backdrop_url: TmdbClient.img(detail.backdrop_path, 'w780'),
          seasons: detail.seasons?.map(s => ({
            ...s,
            poster_url: TmdbClient.img(s.poster_path, 'w342'),
          })),
        });
        break;
      }
      case 'media_tv_season': {
        const a = args as { series_id: number; season_number: number; language?: string };
        const detail = await client.tvSeason(a.series_id, a.season_number, a.language);
        result = clean({
          ...detail,
          poster_url: TmdbClient.img(detail.poster_path, 'w342'),
          episodes: detail.episodes?.map(e => ({
            ...e,
            still_url: TmdbClient.img(e.still_path, 'w300'),
          })),
        });
        break;
      }
      case 'media_tv_episode': {
        const a = args as { series_id: number; season_number: number; episode_number: number; language?: string };
        const detail = await client.tvEpisode(a.series_id, a.season_number, a.episode_number, a.language);
        result = clean({
          ...detail,
          still_url: TmdbClient.img(detail.still_path, 'w300'),
        });
        break;
      }
      case 'media_trending': {
        const a = args as { media_type: string; time_window: string; language?: string };
        const raw = await client.trending(a.media_type as 'all' | 'movie' | 'tv', a.time_window as 'day' | 'week', a.language ?? 'en-US');
        result = { page: raw.page, total_pages: raw.total_pages, total_results: raw.total_results, results: raw.results.map(flattenMulti) };
        break;
      }
      case 'media_genres': {
        const a = args as { type: 'movie' | 'tv'; language?: string };
        result = await client.genres(a.type, a.language ?? 'en');
        break;
      }
      case 'media_languages': {
        result = await client.languages();
        break;
      }
      default:
        throw new Error(`Unknown tool: ${name}`);
    }

    return {
      content: [{ type: 'text' as const, text: JSON.stringify(result, null, 2) }],
    };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    return {
      content: [{ type: 'text' as const, text: JSON.stringify({ error: msg }, null, 2) }],
      isError: true,
    };
  }
});

async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
    console.error('Media Search MCP v1.1.0 (TMDB) ready');
}

main().catch((err: unknown) => {
  console.error('Fatal error:', err);
  process.exit(1);
});
