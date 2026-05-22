const TVDB_BASE = 'https://api4.thetvdb.com/v4';
class TvdbClient {
    token = null;
    expiry = 0;
    get apiKey() {
        const key = process.env.TVDB_API_KEY;
        if (!key) {
            throw new Error('TVDB_API_KEY environment variable is required');
        }
        return key;
    }
    async ensureAuth() {
        const now = Date.now();
        if (this.token && this.expiry > now) {
            return this.token;
        }
        const res = await fetch(`${TVDB_BASE}/login`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                Accept: 'application/json',
            },
            body: JSON.stringify({ apikey: this.apiKey }),
        });
        if (!res.ok) {
            const text = await res.text().catch(() => 'Unknown error');
            throw new Error(`TVDB login ${res.status}: ${text}`);
        }
        const data = (await res.json());
        this.token = data.data.token;
        // Tokens valid for ~1 month; refresh after 25 days to be safe
        this.expiry = now + 25 * 24 * 60 * 60 * 1000;
        return this.token;
    }
    getHeaders(token) {
        return {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
            Accept: 'application/json',
        };
    }
    buildUrl(path, params = {}) {
        const url = new URL(TVDB_BASE + path);
        for (const [key, value] of Object.entries(params)) {
            if (value !== undefined && value !== null && value !== '') {
                url.searchParams.set(key, String(value));
            }
        }
        return url.toString();
    }
    async fetch(path, params) {
        const token = await this.ensureAuth();
        const url = this.buildUrl(path, params);
        const res = await fetch(url, { headers: this.getHeaders(token) });
        if (!res.ok) {
            const text = await res.text().catch(() => 'Unknown error');
            throw new Error(`TVDB ${res.status}: ${text}`);
        }
        return res.json();
    }
    // Search
    async search(query, opts) {
        return this.fetch('/search', {
            query,
            type: opts?.type,
            year: opts?.year,
            country: opts?.country,
            language: opts?.language,
            offset: opts?.offset ?? 0,
            limit: opts?.limit ?? 10,
        });
    }
    async searchByRemoteId(remoteId) {
        return this.fetch(`/search/remoteid/${remoteId}`);
    }
    // Series
    async getSeries(id) {
        return this.fetch(`/series/${id}`);
    }
    async getSeriesExtended(id, opts) {
        const params = {};
        if (opts?.meta)
            params.meta = opts.meta;
        if (opts?.short !== undefined)
            params.short = opts.short;
        return this.fetch(`/series/${id}/extended`, params);
    }
    async getSeriesEpisodes(id, seasonType, page) {
        return this.fetch(`/series/${id}/episodes/${seasonType}`, {
            page: page ?? 0,
        });
    }
    async getSeriesArtworks(id, opts) {
        const params = {};
        if (opts?.lang)
            params.lang = opts.lang;
        if (opts?.type)
            params.type = opts.type;
        return this.fetch(`/series/${id}/artworks`, params);
    }
    async getSeriesBySlug(slug) {
        return this.fetch(`/series/slug/${slug}`);
    }
    // Episodes
    async getEpisode(id) {
        return this.fetch(`/episodes/${id}`);
    }
    async getEpisodeExtended(id, opts) {
        const params = {};
        if (opts?.meta)
            params.meta = opts.meta;
        return this.fetch(`/episodes/${id}/extended`, params);
    }
    // Seasons
    async getSeasonExtended(id) {
        return this.fetch(`/seasons/${id}/extended`);
    }
    async getSeasonTypes() {
        return this.fetch('/seasons/types');
    }
    // Artworks
    async getArtwork(id) {
        return this.fetch(`/artwork/${id}`);
    }
    async getArtworkExtended(id) {
        return this.fetch(`/artwork/${id}/extended`);
    }
    async getArtworkTypes() {
        return this.fetch('/artwork/types');
    }
    // Updates
    async getUpdates(since) {
        return this.fetch('/updates', { since });
    }
}
export const tvdb = new TvdbClient();
//# sourceMappingURL=tvdb.js.map