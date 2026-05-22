# @broville/media-search-mcp

A Model Context Protocol (MCP) server for searching movies and TV shows via **TMDB** and **TheTVDB**.

## Installation

### Via npx (no install)

```bash
npx -y @broville/media-search-mcp
```

### Via npm install

```bash
npm install -g @broville/media-search-mcp
media-search-mcp
```

## Configuration

Set these environment variables:

| Variable | Required | Description |
|----------|----------|-------------|
| `TMDB_READ_ACCESS_TOKEN` | **Recommended** | TMDB Bearer token (preferred auth method) |
| `TMDB_API_KEY` | Alternative | TMDB API key (v3 query param auth) |
| `TVDB_API_KEY` | Yes (for TVDB tools) | TheTVDB v4 API key |

### Getting API Keys

- **TMDB:** https://www.themoviedb.org/settings/api → request API key, then create a read access token.
- **TheTVDB:** https://thetvdb.com/api-information → create account, subscribe (free tier), copy API key.

### Hermes Agent / Claude Desktop

Add to your `~/.hermes/config.yaml` (Hermes) or `claude_desktop_config.json` (Claude Desktop):

```yaml
mcp_servers:
  media_search:
    command: "npx"
    args: ["-y", "@broville/media-search-mcp"]
    env:
      TMDB_READ_ACCESS_TOKEN: "eyJhbGciOiJIUzI1NiIs..."
      TVDB_API_KEY: "your-tvdb-key"
```

## Tools

### Search

| Tool | Source | Description |
|------|--------|-------------|
| `media_search` | TMDB | Multi-search movies, TV, and people |
| `media_search_movies` | TMDB | Search movies only |
| `media_search_tv` | TMDB | Search TV shows only |
| `media_search_tvdb` | TVDB | Search TVDB for series, movies, people |

### Details

| Tool | Source | Description |
|------|--------|-------------|
| `media_movie_details` | TMDB | Full movie details with cast, videos, etc. |
| `media_tv_details` | TMDB | Full TV series details with seasons |
| `media_tv_season` | TMDB | Season details with episode list |
| `media_tv_episode` | TMDB | Single episode details |
| `media_tvdb_series` | TVDB | Extended series with episodes, artworks, characters |
| `media_tvdb_series_episodes` | TVDB | Episodes grouped by season type |

### Discovery

| Tool | Source | Description |
|------|--------|-------------|
| `media_trending` | TMDB | Trending movies/TV (day or week) |
| `media_genres` | TMDB | Genre list for movies or TV |
| `media_lookup_imdb` | TVDB | Look up by IMDb ID |

### Lookup

| Tool | Description |
|------|-------------|
| `media_search_remote_id` | Search TVDB by external ID (IMDb, EIDR, etc.) |
| `media_languages` | Available TMDB languages |

## Development

```bash
npm install
npm run dev    # watch mode
npm run build  # compile once
npm start      # run compiled server
```

## License

MIT
