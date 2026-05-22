# @broville/media-search-mcp

MCP server for movie and TV show search via **TMDB API v3**.

## Features

| Tool | What it does |
|------|--------------|
| `media_search` | Search **movies + TV + people** together |
| `media_search_movies` | Search movies only |
| `media_search_tv` | Search TV shows only |
| `media_movie_details` | Full movie details (cast, crew, budget, runtime, etc.) |
| `media_tv_details` | Full TV series details (seasons, networks, status) |
| `media_tv_season` | Season details + episode list |
| `media_tv_episode` | Single episode details |
| `media_trending` | Trending movies/TV (day / week) |
| `media_genres` | Genre list (movie or TV) |
| `media_languages` | TMDB supported languages |

## Install

```bash
npm install -g @broville/media-search-mcp
```

Or via npx (no install):
```bash
npx @broville/media-search-mcp
```

## Usage

Requires a **TMDB API key**:

1. Get a free key: https://www.themoviedb.org/settings/api
2. Export as env var:

```bash
export TMDB_API_KEY=your_tmdb_key
export TMDB_API_KEY=$(op item get "TMDB API Key" --vault Server --field api-key)
npx @broville/media-search-mcp
```

## Hermes Agent config

Add to `~/.hermes/profiles/neo/config.yaml`:

```yaml
mcp:
  media-search:
    command: node
    args: ["/home/echo/.npm-global/lib/node_modules/@broville/media-search-mcp/dist/index.js"]
    env:
      TMDB_API_KEY: "${TMDB_API_KEY}"
```

## Response format

All results include `poster_url`, `backdrop_url`, and `still_url` (images are constructed with optimal TMDB sizes).

## License
MIT
