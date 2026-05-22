import type { TmdbSearchResult, TmdbMovieDetails, TmdbTvDetails, TmdbSeasonDetails, TmdbEpisode, TmdbTrendingResult, TmdbGenreList, TmdbConfigLanguage } from './types.js';
export declare function searchMulti(query: string, opts?: {
    include_adult?: boolean;
    language?: string;
    page?: number;
}): Promise<TmdbSearchResult>;
export declare function searchMovies(query: string, opts?: {
    year?: number;
    primary_release_year?: number;
    region?: string;
    language?: string;
    page?: number;
    include_adult?: boolean;
}): Promise<TmdbSearchResult>;
export declare function searchTv(query: string, opts?: {
    first_air_date_year?: number;
    year?: number;
    language?: string;
    page?: number;
    include_adult?: boolean;
}): Promise<TmdbSearchResult>;
export declare function getMovieDetails(movieId: number, opts?: {
    language?: string;
    append?: string;
}): Promise<TmdbMovieDetails>;
export declare function getTvDetails(seriesId: number, opts?: {
    language?: string;
    append?: string;
}): Promise<TmdbTvDetails>;
export declare function getTvSeason(seriesId: number, seasonNumber: number, opts?: {
    language?: string;
    append?: string;
}): Promise<TmdbSeasonDetails>;
export declare function getTvEpisode(seriesId: number, seasonNumber: number, episodeNumber: number, opts?: {
    language?: string;
    append?: string;
}): Promise<TmdbEpisode>;
export declare function getTrending(mediaType: 'all' | 'movie' | 'tv', timeWindow: 'day' | 'week', opts?: {
    language?: string;
}): Promise<TmdbTrendingResult>;
export declare function getGenres(type: 'movie' | 'tv', opts?: {
    language?: string;
}): Promise<TmdbGenreList>;
export declare function getLanguages(): Promise<TmdbConfigLanguage[]>;
//# sourceMappingURL=tmdb.d.ts.map