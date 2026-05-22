import type { TvdbSearchResult, TvdbSeriesResponse, TvdbSeriesExtendedResponse, TvdbEpisodesResponse, TvdbRemoteIdResponse, TvdbSeasonTypesResponse, TvdbUpdatesResponse, TvdbArtworkListResponse } from './types.js';
declare class TvdbClient {
    private token;
    private expiry;
    private get apiKey();
    private ensureAuth;
    private getHeaders;
    private buildUrl;
    private fetch;
    search(query: string, opts?: {
        type?: string;
        year?: string;
        country?: string;
        language?: string;
        offset?: number;
        limit?: number;
    }): Promise<TvdbSearchResult>;
    searchByRemoteId(remoteId: string): Promise<TvdbRemoteIdResponse>;
    getSeries(id: string | number): Promise<TvdbSeriesResponse>;
    getSeriesExtended(id: string | number, opts?: {
        meta?: string;
        short?: boolean;
    }): Promise<TvdbSeriesExtendedResponse>;
    getSeriesEpisodes(id: string | number, seasonType: number, page?: number): Promise<TvdbEpisodesResponse>;
    getSeriesArtworks(id: string | number, opts?: {
        lang?: string;
        type?: string;
    }): Promise<TvdbArtworkListResponse>;
    getSeriesBySlug(slug: string): Promise<TvdbSeriesResponse>;
    getEpisode(id: string | number): Promise<TvdbEpisodesResponse>;
    getEpisodeExtended(id: string | number, opts?: {
        meta?: string;
    }): Promise<TvdbEpisodesResponse>;
    getSeasonExtended(id: string | number): Promise<unknown>;
    getSeasonTypes(): Promise<TvdbSeasonTypesResponse>;
    getArtwork(id: string | number): Promise<unknown>;
    getArtworkExtended(id: string | number): Promise<unknown>;
    getArtworkTypes(): Promise<unknown>;
    getUpdates(since: number): Promise<TvdbUpdatesResponse>;
}
export declare const tvdb: TvdbClient;
export {};
//# sourceMappingURL=tvdb.d.ts.map