import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { CallToolRequestSchema, ListToolsRequestSchema, } from '@modelcontextprotocol/sdk/types.js';
import * as tmdb from './tmdb.js';
import { tvdb } from './tvdb.js';
// Build image URL helper
function buildImageUrl(path, size = 'w500') {
    if (!path)
        return null;
    return `https://image.tmdb.org/t/p/${size}${path}`;
}
// TMDB Search Tools
const MEDIA_SEARCH_TOOL = {
    name: 'media_search',
    description: 'Search movies, TV shows, and people via TMDB multi-search.',
    inputSchema: {
        type: 'object',
        properties: {
            query: { type: 'string', description: 'Search text' },
            include_adult: { type: 'boolean', description: 'Include adult content', default: false },
            language: { type: 'string', description: 'ISO-639-1 + ISO-3166-1 code', default: 'en-US' },
            page: { type: 'number', description: 'Page number', default: 1 },
        },
        required: ['query'],
    },
};
const MEDIA_SEARCH_MOVIES_TOOL = {
    name: 'media_search_movies',
    description: 'Search movies only via TMDB. Searches original, translated, and alternative titles.',
    inputSchema: {
        type: 'object',
        properties: {
            query: { type: 'string', description: 'Search text' },
            year: { type: 'number', description: 'Filter by release year' },
            primary_release_year: { type: 'number', description: 'Filter by primary release year' },
            region: { type: 'string', description: 'ISO-3166-1 region code' },
            language: { type: 'string', description: 'ISO-639-1 + ISO-3166-1 code', default: 'en-US' },
            page: { type: 'number', description: 'Page number', default: 1 },
            include_adult: { type: 'boolean', description: 'Include adult content', default: false },
        },
        required: ['query'],
    },
};
const MEDIA_SEARCH_TV_TOOL = {
    name: 'media_search_tv',
    description: 'Search TV shows only via TMDB. Searches original, translated, and "also known as" names.',
    inputSchema: {
        type: 'object',
        properties: {
            query: { type: 'string', description: 'Search text' },
            first_air_date_year: { type: 'number', description: 'Filter by first air date year' },
            year: { type: 'number', description: 'Filter by year' },
            language: { type: 'string', description: 'ISO-639-1 + ISO-3166-1 code', default: 'en-US' },
            page: { type: 'number', description: 'Page number', default: 1 },
            include_adult: { type: 'boolean', description: 'Include adult content', default: false },
        },
        required: ['query'],
    },
};
const MEDIA_SEARCH_TVDB_TOOL = {
    name: 'media_search_tvdb',
    description: 'Search TheTVDB for series, movies, people, or companies (deeper TV data).',
    inputSchema: {
        type: 'object',
        properties: {
            query: { type: 'string', description: 'Search text' },
            type: {
                type: 'string',
                enum: ['movie', 'series', 'person', 'company'],
                description: 'Entity type filter',
            },
            year: { type: 'string', description: 'Filter by year' },
            country: { type: 'string', description: 'Filter by country code' },
            language: { type: 'string', description: 'Filter by language' },
            offset: { type: 'number', description: 'Pagination offset', default: 0 },
            limit: { type: 'number', description: 'Results per page', default: 10 },
        },
        required: ['query'],
    },
};
// Detail Tools
const MEDIA_MOVIE_DETAILS_TOOL = {
    name: 'media_movie_details',
    description: 'Get full movie details, cast, videos, and more from TMDB.',
    inputSchema: {
        type: 'object',
        properties: {
            movie_id: { type: 'number', description: 'TMDB movie ID' },
            language: { type: 'string', description: 'ISO-639-1 code', default: 'en-US' },
            append: {
                type: 'string',
                description: 'Comma-separated sub-resources: credits,videos,recommendations,similar,images,external_ids,reviews,keywords,release_dates,watch/providers',
            },
        },
        required: ['movie_id'],
    },
};
const MEDIA_TV_DETAILS_TOOL = {
    name: 'media_tv_details',
    description: 'Get full TV series details including seasons and episodes from TMDB.',
    inputSchema: {
        type: 'object',
        properties: {
            series_id: { type: 'number', description: 'TMDB TV series ID' },
            language: { type: 'string', description: 'ISO-639-1 code', default: 'en-US' },
            append: {
                type: 'string',
                description: 'Comma-separated sub-resources: credits,videos,recommendations,similar,images,external_ids,reviews,keywords',
            },
        },
        required: ['series_id'],
    },
};
const MEDIA_TV_SEASON_TOOL = {
    name: 'media_tv_season',
    description: 'Get TMDB TV season details with episode list.',
    inputSchema: {
        type: 'object',
        properties: {
            series_id: { type: 'number', description: 'TMDB TV series ID' },
            season_number: { type: 'number', description: 'Season number' },
            language: { type: 'string', description: 'ISO-639-1 code', default: 'en-US' },
            append: { type: 'string', description: 'Comma-separated sub-resources' },
        },
        required: ['series_id', 'season_number'],
    },
};
const MEDIA_TV_EPISODE_TOOL = {
    name: 'media_tv_episode',
    description: 'Get TMDB single episode details.',
    inputSchema: {
        type: 'object',
        properties: {
            series_id: { type: 'number', description: 'TMDB TV series ID' },
            season_number: { type: 'number', description: 'Season number' },
            episode_number: { type: 'number', description: 'Episode number' },
            language: { type: 'string', description: 'ISO-639-1 code', default: 'en-US' },
            append: { type: 'string', description: 'Comma-separated sub-resources' },
        },
        required: ['series_id', 'season_number', 'episode_number'],
    },
};
const MEDIA_TVDB_SERIES_TOOL = {
    name: 'media_tvdb_series',
    description: 'Get extended TheTVDB series with episodes, artworks, characters (deeper TV data).',
    inputSchema: {
        type: 'object',
        properties: {
            id: { type: 'string', description: 'TheTVDB series ID' },
            meta: {
                type: 'string',
                description: 'Comma-separated: episodes, translations',
                default: 'episodes,translations',
            },
            short: { type: 'boolean', description: 'false=full record, true=abbreviated', default: false },
        },
        required: ['id'],
    },
};
const MEDIA_TVDB_SERIES_EPISODES_TOOL = {
    name: 'media_tvdb_series_episodes',
    description: 'Get TheTVDB episodes grouped by season type.',
    inputSchema: {
        type: 'object',
        properties: {
            id: { type: 'string', description: 'TheTVDB series ID' },
            season_type: {
                type: 'number',
                description: '1=Official, 2=DVD, 3=Absolute, 4=Alternate, 5=Regional',
                default: 1,
            },
            page: { type: 'number', description: 'Page number', default: 0 },
        },
        required: ['id'],
    },
};
// Discovery Tools
const MEDIA_TRENDING_TOOL = {
    name: 'media_trending',
    description: 'Get trending movies, TV shows, or all from TMDB.',
    inputSchema: {
        type: 'object',
        properties: {
            media_type: {
                type: 'string',
                enum: ['all', 'movie', 'tv'],
                description: 'Media type',
                default: 'all',
            },
            time_window: {
                type: 'string',
                enum: ['day', 'week'],
                description: 'Trending time window',
                default: 'day',
            },
            language: { type: 'string', description: 'ISO-639-1 code', default: 'en-US' },
        },
        required: ['media_type', 'time_window'],
    },
};
const MEDIA_GENRES_TOOL = {
    name: 'media_genres',
    description: 'Get TMDB genre list for movies or TV.',
    inputSchema: {
        type: 'object',
        properties: {
            type: {
                type: 'string',
                enum: ['movie', 'tv'],
                description: 'Media type',
            },
            language: { type: 'string', description: 'ISO-639-1 + ISO-3166-1 code', default: 'en' },
        },
        required: ['type'],
    },
};
const MEDIA_LOOKUP_IMDB_TOOL = {
    name: 'media_lookup_imdb',
    description: 'Look up a series by IMDb ID via TheTVDB.',
    inputSchema: {
        type: 'object',
        properties: {
            imdb_id: { type: 'string', description: 'IMDb ID (e.g. tt0903747)' },
        },
        required: ['imdb_id'],
    },
};
// Config/Lookup Tools
const MEDIA_SEARCH_REMOTE_ID_TOOL = {
    name: 'media_search_remote_id',
    description: 'Search TheTVDB by external ID (IMDb, EIDR, etc.).',
    inputSchema: {
        type: 'object',
        properties: {
            remote_id: { type: 'string', description: 'External ID' },
        },
        required: ['remote_id'],
    },
};
const MEDIA_LANGUAGES_TOOL = {
    name: 'media_languages',
    description: 'Get available TMDB languages list.',
    inputSchema: {
        type: 'object',
        properties: {},
    },
};
const ALL_TOOLS = [
    MEDIA_SEARCH_TOOL,
    MEDIA_SEARCH_MOVIES_TOOL,
    MEDIA_SEARCH_TV_TOOL,
    MEDIA_SEARCH_TVDB_TOOL,
    MEDIA_MOVIE_DETAILS_TOOL,
    MEDIA_TV_DETAILS_TOOL,
    MEDIA_TV_SEASON_TOOL,
    MEDIA_TV_EPISODE_TOOL,
    MEDIA_TVDB_SERIES_TOOL,
    MEDIA_TVDB_SERIES_EPISODES_TOOL,
    MEDIA_TRENDING_TOOL,
    MEDIA_GENRES_TOOL,
    MEDIA_LOOKUP_IMDB_TOOL,
    MEDIA_SEARCH_REMOTE_ID_TOOL,
    MEDIA_LANGUAGES_TOOL,
];
// ─── Server Setup ────────────────────────────────────────────────────────────
const server = new Server({
    name: 'media-search-mcp',
    version: '1.0.0',
}, {
    capabilities: { tools: {} },
});
server.setRequestHandler(ListToolsRequestSchema, async () => {
    return { tools: ALL_TOOLS };
});
server.setRequestHandler(CallToolRequestSchema, async (request) => {
    const { name, arguments: args } = request.params;
    try {
        let result;
        switch (name) {
            // ── TMDB Search ──────────────────────────────────────────
            case 'media_search': {
                const msa = args;
                const data = await tmdb.searchMulti(msa.query, msa);
                result = { ...data, results: data.results.map((r) => ({ ...r, poster_url: buildImageUrl(r.poster_path), backdrop_url: buildImageUrl(r.backdrop_path, 'w780') })) };
                break;
            }
            case 'media_search_movies': {
                const mma = args;
                const data = await tmdb.searchMovies(mma.query, mma);
                result = { ...data, results: data.results.map((r) => ({ ...r, poster_url: buildImageUrl(r.poster_path), backdrop_url: buildImageUrl(r.backdrop_path, 'w780') })) };
                break;
            }
            case 'media_search_tv': {
                const mta = args;
                const data = await tmdb.searchTv(mta.query, mta);
                result = { ...data, results: data.results.map((r) => ({ ...r, poster_url: buildImageUrl(r.poster_path), backdrop_url: buildImageUrl(r.backdrop_path, 'w780') })) };
                break;
            }
            case 'media_search_tvdb': {
                const tsa = args;
                result = await tvdb.search(tsa.query, tsa);
                break;
            }
            // ── TMDB Details ──────────────────────────────────────────
            case 'media_movie_details': {
                const mda = args;
                const data = await tmdb.getMovieDetails(mda.movie_id, mda);
                result = {
                    ...data,
                    poster_url: buildImageUrl(data.poster_path),
                    backdrop_url: buildImageUrl(data.backdrop_path, 'w780'),
                };
                break;
            }
            case 'media_tv_details': {
                const tda = args;
                const data = await tmdb.getTvDetails(tda.series_id, tda);
                result = {
                    ...data,
                    poster_url: buildImageUrl(data.poster_path),
                    backdrop_url: buildImageUrl(data.backdrop_path, 'w780'),
                    seasons: data.seasons?.map((s) => ({
                        ...s,
                        poster_url: buildImageUrl(s.poster_path),
                    })),
                };
                break;
            }
            case 'media_tv_season': {
                const ssa = args;
                const data = await tmdb.getTvSeason(ssa.series_id, ssa.season_number, ssa);
                result = {
                    ...data,
                    poster_url: buildImageUrl(data.poster_path),
                    episodes: data.episodes?.map((ep) => ({
                        ...ep,
                        still_url: buildImageUrl(ep.still_path),
                    })),
                };
                break;
            }
            case 'media_tv_episode': {
                const sea = args;
                const data = await tmdb.getTvEpisode(sea.series_id, sea.season_number, sea.episode_number, sea);
                result = {
                    ...data,
                    still_url: buildImageUrl(data.still_path),
                };
                break;
            }
            case 'media_tvdb_series': {
                const tvs = args;
                result = await tvdb.getSeriesExtended(tvs.id, { meta: tvs.meta, short: tvs.short });
                break;
            }
            case 'media_tvdb_series_episodes': {
                const tve = args;
                result = await tvdb.getSeriesEpisodes(tve.id, tve.season_type ?? 1, tve.page);
                break;
            }
            // ── Discovery ─────────────────────────────────────────────
            case 'media_trending': {
                const ta = args;
                const data = await tmdb.getTrending(ta.media_type, ta.time_window, ta);
                result = { ...data, results: data.results.map((r) => ({ ...r, poster_url: buildImageUrl(r.poster_path), backdrop_url: buildImageUrl(r.backdrop_path, 'w780') })) };
                break;
            }
            case 'media_genres': {
                const ga = args;
                result = await tmdb.getGenres(ga.type, ga);
                break;
            }
            case 'media_lookup_imdb': {
                const lia = args;
                result = await tvdb.searchByRemoteId(lia.imdb_id);
                break;
            }
            // ── Config/Lookup ────────────────────────────────────────
            case 'media_search_remote_id': {
                const sra = args;
                result = await tvdb.searchByRemoteId(sra.remote_id);
                break;
            }
            case 'media_languages': {
                result = await tmdb.getLanguages();
                break;
            }
            default:
                throw new Error(`Unknown tool: ${name}`);
        }
        // Pretty-print JSON for MCP readability
        return {
            content: [
                {
                    type: 'text',
                    text: JSON.stringify(result, null, 2),
                },
            ],
        };
    }
    catch (err) {
        const message = err instanceof Error ? err.message : String(err);
        return {
            content: [
                {
                    type: 'text',
                    text: JSON.stringify({ error: message }, null, 2),
                },
            ],
            isError: true,
        };
    }
});
// ─── Main ────────────────────────────────────────────────────────────────────
async function main() {
    const transport = new StdioServerTransport();
    await server.connect(transport);
    // eslint-disable-next-line no-console
    console.error('Media Search MCP server running on stdio');
}
main().catch((err) => {
    // eslint-disable-next-line no-console
    console.error('Fatal error:', err);
    process.exit(1);
});
//# sourceMappingURL=index.js.map