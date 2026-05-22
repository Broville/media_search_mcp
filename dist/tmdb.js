const TMDB_BASE = 'https://api.themoviedb.org/3';
function getHeaders() {
    const token = process.env.TMDB_READ_ACCESS_TOKEN;
    const apiKey = process.env.TMDB_API_KEY;
    const headers = {
        Accept: 'application/json',
        'Content-Type': 'application/json',
    };
    if (token) {
        headers['Authorization'] = `Bearer ${token}`;
    }
    return headers;
}
function buildUrl(path, params) {
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
async function fetchTmdb(path, params = {}) {
    const url = buildUrl(path, params);
    const res = await fetch(url, { headers: getHeaders() });
    if (!res.ok) {
        const text = await res.text().catch(() => 'Unknown error');
        throw new Error(`TMDB ${res.status}: ${text}`);
    }
    return res.json();
}
// Search
export function searchMulti(query, opts) {
    return fetchTmdb('/search/multi', {
        query,
        include_adult: opts?.include_adult ?? false,
        language: opts?.language ?? 'en-US',
        page: opts?.page ?? 1,
    });
}
export function searchMovies(query, opts) {
    return fetchTmdb('/search/movie', {
        query,
        year: opts?.year,
        primary_release_year: opts?.primary_release_year,
        region: opts?.region,
        language: opts?.language ?? 'en-US',
        page: opts?.page ?? 1,
        include_adult: opts?.include_adult ?? false,
    });
}
export function searchTv(query, opts) {
    return fetchTmdb('/search/tv', {
        query,
        first_air_date_year: opts?.first_air_date_year,
        year: opts?.year,
        language: opts?.language ?? 'en-US',
        page: opts?.page ?? 1,
        include_adult: opts?.include_adult ?? false,
    });
}
// Details
export function getMovieDetails(movieId, opts) {
    const params = {
        language: opts?.language ?? 'en-US',
    };
    if (opts?.append) {
        params.append_to_response = opts.append;
    }
    return fetchTmdb(`/movie/${movieId}`, params);
}
export function getTvDetails(seriesId, opts) {
    const params = {
        language: opts?.language ?? 'en-US',
    };
    if (opts?.append) {
        params.append_to_response = opts.append;
    }
    return fetchTmdb(`/tv/${seriesId}`, params);
}
export function getTvSeason(seriesId, seasonNumber, opts) {
    const params = {
        language: opts?.language ?? 'en-US',
    };
    if (opts?.append) {
        params.append_to_response = opts.append;
    }
    return fetchTmdb(`/tv/${seriesId}/season/${seasonNumber}`, params);
}
export function getTvEpisode(seriesId, seasonNumber, episodeNumber, opts) {
    const params = {
        language: opts?.language ?? 'en-US',
    };
    if (opts?.append) {
        params.append_to_response = opts.append;
    }
    return fetchTmdb(`/tv/${seriesId}/season/${seasonNumber}/episode/${episodeNumber}`, params);
}
// Trending
export function getTrending(mediaType, timeWindow, opts) {
    return fetchTmdb(`/trending/${mediaType}/${timeWindow}`, {
        language: opts?.language ?? 'en-US',
    });
}
// Genres
export function getGenres(type, opts) {
    return fetchTmdb(`/genre/${type}/list`, {
        language: opts?.language ?? 'en',
    });
}
// Languages
export function getLanguages() {
    return fetchTmdb('/configuration/languages');
}
//# sourceMappingURL=tmdb.js.map