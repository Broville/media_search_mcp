#!/usr/bin/env node
import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from '@modelcontextprotocol/sdk/types.js';

import { discoverRadarr, type RadarrMovieLookupResult } from './radarr.js';
import { discoverSonarr, type SonarrLookupResult } from './sonarr.js';
import { TvMazeClient } from './tvmaze.js';

let radarr = await discoverRadarr();
let sonarr = await discoverSonarr();
const tvmaze = new TvMazeClient();

console.error([
  'Media Search MCP v2.0.0',
  `  Radarr: ${radarr ? 'connected' : 'not found (set RADARR_URL + RADARR_API_KEY or run on localhost:7878)' }`,
  `  Sonarr: ${sonarr ? 'connected' : 'not found (set SONARR_URL + SONARR_API_KEY or run on localhost:8989)' }`,
  `  TVmaze: always available (keyless fallback)`,
].join('\n'));

// ─── Helpers ───

function pickPoster(images?: Array<{ coverType: string; url?: string; remoteUrl?: string }>): string | undefined {
  return images?.find(i => i.coverType === 'poster')?.url
    ?? images?.find(i => i.coverType === 'poster')?.remoteUrl;
}
function pickFanart(images?: Array<{ coverType: string; url?: string; remoteUrl?: string }>): string | undefined {
  return images?.find(i => i.coverType === 'fanart')?.url
    ?? images?.find(i => i.coverType === 'fanart')?.remoteUrl;
}

function fromRadarr(r: RadarrMovieLookupResult[]) {
  return r.map(x => ({
    id: x.tmdbId,
    title: x.title,
    year: x.year,
    overview: x.overview,
    poster_url: pickPoster(x.images),
    backdrop_url: pickFanart(x.images),
    rating: x.ratings?.value,
    certification: x.certification,
    imdb_id: x.imdbId,
    studio: x.studio,
    runtime: x.runtime,
    genres: x.genres,
    in_cinemas: x.inCinemas,
    trailer_id: x.youTubeTrailerId,
    website: x.website,
    source: 'radarr',
  }));
}

function fromSonarr(r: SonarrLookupResult[]) {
  return r.map(x => ({
    id: x.tvdbId,
    title: x.title,
    sort_title: x.sortTitle,
    year: x.year,
    overview: x.overview,
    poster_url: pickPoster(x.images),
    backdrop_url: pickFanart(x.images),
    rating: x.ratings?.value,
    certification: x.certification,
    status: x.status,
    imdb_id: x.imdbId,
    network: x.network,
    runtime: x.runtime,
    genres: x.genres,
    season_count: x.seasonCount,
    episode_count: x.totalEpisodeCount ?? x.episodeCount,
    first_aired: x.firstAired,
    last_aired: x.lastAired,
    source: 'sonarr',
  }));
}

function fromTvMaze(r: Awaited<ReturnType<typeof tvmaze.search>>) {
  return r.map(x => ({
    id: x.show.id,
    title: x.show.name,
    year: x.show.premiered ? Number(x.show.premiered.split('-')[0]) : undefined,
    overview: x.show.summary,
    poster_url: x.show.image?.medium,
    backdrop_url: x.show.image?.original,
    rating: x.show.rating?.average,
    status: x.show.status,
    network: x.show.network?.name ?? x.show.webChannel?.name,
    genres: x.show.genres,
    runtime: x.show.runtime,
    premiered: x.show.premiered,
    ended: x.show.ended,
    imdb_id: x.show.externals?.imdb,
    tvmaze_id: x.show.id,
    source: 'tvmaze',
  }));
}

// ─── Tools ───

const MEDIA_SEARCH_TOOL = {
  name: 'media_search',
  description: 'Search movies and TV shows. Uses Radarr/Sonarr when connected, otherwise falls back to keyless TVmaze.',
  inputSchema: {
    type: 'object' as const,
    properties: {
      query: { type: 'string', description: 'Search text' },
      limit: { type: 'number', description: 'Max results per source', default: 10 },
    },
    required: ['query'],
  },
};

const MEDIA_SEARCH_MOVIES_TOOL = {
  name: 'media_search_movies',
  description: 'Search movies via Radarr. Falls back to error if Radarr is not connected.',
  inputSchema: {
    type: 'object' as const,
    properties: {
      query: { type: 'string', description: 'Search text' },
    },
    required: ['query'],
  },
};

const MEDIA_SEARCH_TV_TOOL = {
  name: 'media_search_tv',
  description: 'Search TV shows via Sonarr (preferred) or TVmaze (keyless fallback).',
  inputSchema: {
    type: 'object' as const,
    properties: {
      query: { type: 'string', description: 'Search text' },
    },
    required: ['query'],
  },
};

const MEDIA_MOVIE_DETAILS_TOOL = {
  name: 'media_movie_details',
  description: 'Get full movie details from Radarr by TMDB or IMDb ID.',
  inputSchema: {
    type: 'object' as const,
    properties: {
      tmdb_id: { type: 'number', description: 'TMDB movie ID' },
      imdb_id: { type: 'string', description: 'IMDb ID (e.g. tt1375666)' },
    },
  },
};

const MEDIA_TV_DETAILS_TOOL = {
  name: 'media_tv_details',
  description: 'Get full TV series details from Sonarr by TVDB ID.',
  inputSchema: {
    type: 'object' as const,
    properties: {
      tvdb_id: { type: 'number', description: 'TVDB series ID' },
    },
    required: ['tvdb_id'],
  },
};

const MEDIA_TV_EPISODES_TOOL = {
  name: 'media_tv_episodes',
  description: 'Get episodes for a TV show via Sonarr or TVmaze.',
  inputSchema: {
    type: 'object' as const,
    properties: {
      tvdb_id: { type: 'number', description: 'TVDB series ID (Sonarr)' },
      tvmaze_id: { type: 'number', description: 'TVmaze show ID (fallback)' },
    },
  },
};

const ALL_TOOLS = [
  MEDIA_SEARCH_TOOL,
  MEDIA_SEARCH_MOVIES_TOOL,
  MEDIA_SEARCH_TV_TOOL,
  MEDIA_MOVIE_DETAILS_TOOL,
  MEDIA_TV_DETAILS_TOOL,
  MEDIA_TV_EPISODES_TOOL,
];

// ─── Server ───

const server = new Server(
  { name: 'media-search-mcp', version: '2.0.0' },
  { capabilities: { tools: {} } }
);

server.setRequestHandler(ListToolsRequestSchema, async () => ({
  tools: ALL_TOOLS,
}));

server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;

  try {
    let result: unknown;

    switch (name) {
      case 'media_search': {
        const a = args as { query: string };
        const results: unknown[] = [];
        if (radarr) {
          results.push(...fromRadarr(await radarr.lookup(a.query)).map(x => ({ ...x, media_type: 'movie' })));
        }
        if (sonarr) {
          results.push(...fromSonarr(await sonarr.lookup(a.query)).map(x => ({ ...x, media_type: 'tv' })));
        }
        if (results.length === 0) {
          results.push(...fromTvMaze(await tvmaze.search(a.query)).map(x => ({ ...x, media_type: 'tv' })));
        }
        result = results;
        break;
      }

      case 'media_search_movies': {
        const a = args as { query: string };
        if (radarr) {
          result = fromRadarr(await radarr.lookup(a.query));
        } else {
          result = { error: 'Radarr not connected. Set RADARR_URL + RADARR_API_KEY, or run Radarr on localhost:7878.' };
        }
        break;
      }

      case 'media_search_tv': {
        const a = args as { query: string };
        if (sonarr) {
          result = fromSonarr(await sonarr.lookup(a.query));
        } else {
          result = fromTvMaze(await tvmaze.search(a.query));
        }
        break;
      }

      case 'media_movie_details': {
        const a = args as { tmdb_id?: number; imdb_id?: string };
        if (!radarr) {
          result = { error: 'Radarr not connected. Set RADARR_URL + RADARR_API_KEY.' };
        } else if (a.tmdb_id) {
          result = fromRadarr([await radarr.lookupByTmdbId(a.tmdb_id)])[0];
        } else if (a.imdb_id) {
          result = fromRadarr([await radarr.lookupByImdbId(a.imdb_id)])[0];
        } else {
          result = { error: 'Provide tmdb_id or imdb_id.' };
        }
        break;
      }

      case 'media_tv_details': {
        const a = args as { tvdb_id: number };
        if (!sonarr) {
          result = { error: 'Sonarr not connected. Set SONARR_URL + SONARR_API_KEY.' };
        } else {
          const sr = await sonarr.getSeries(a.tvdb_id);
          result = sr ? fromSonarr([sr])[0] : { error: `Series with TVDB ID ${a.tvdb_id} not found in Sonarr.`, tvdb_id: a.tvdb_id };
        }
        break;
      }

      case 'media_tv_episodes': {
        const a = args as { tvdb_id?: number; tvmaze_id?: number };
        if (sonarr && a.tvdb_id) {
          result = await sonarr.getSeries(a.tvdb_id);
        } else if (a.tvmaze_id) {
          result = await tvmaze.getEpisodes(a.tvmaze_id);
        } else {
          result = { error: 'Provide tvdb_id (with Sonarr) or tvmaze_id (fallback).' };
        }
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
  console.error('Media Search MCP v2.0.0 ready on stdio');
}

main().catch((err: unknown) => {
  console.error('Fatal error:', err);
  process.exit(1);
});
