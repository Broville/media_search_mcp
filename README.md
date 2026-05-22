# @broville/media-search-mcp

MCP server for movie and TV show search — no TMDB/TVDB API keys required.

## How it works

| Data source | Auth needed | Quality | When used |
|-------------|-------------|---------|-----------|
| **Radarr** (local) | `RADARR_API_KEY` | Deep — full TMDB mirror | When installed on LAN |
| **Sonarr** (local) | `SONARR_API_KEY` | Deep — full TVDB mirror | When installed on LAN |
| **TVmaze** | None | Medium — cast, seasons, episodes, images | Keyless fallback |

Radarr and Sonarr hold their own TMDB/TVDB keys internally (just like Doplarr uses). This MCP proxies search through them. If neither is available, TVmaze provides zero-config TV search.

## Install

```bash
npx @broville/media-search-mcp
# or
npm install -g @broville/media-search-mcp
media-search-mcp
```

## Env vars

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `RADARR_URL` | optional | `http://localhost:7878` | Radarr base URL |
| `RADARR_API_KEY` | optional | — | From Radarr → Settings → General |
| `SONARR_URL` | optional | `http://localhost:8989` | Sonarr base URL |
| `SONARR_API_KEY` | optional | — | From Sonarr → Settings → General |

If Radarr/Sonarr are not found, the server still functions with TVmaze.

## Tools

| Tool | Source | Description |
|------|--------|-------------|
| `media_search` | Radarr + Sonarr + TVmaze | Search movies and TV |
| `media_search_movies` | Radarr | Movies only (requires Radarr) |
| `media_search_tv` | Sonarr / TVmaze | TV shows (Sonarr preferred) |
| `media_movie_details` | Radarr | Full movie by TMDB/IMDb ID |
| `media_tv_details` | Sonarr | Full series by TVDB ID |
| `media_tv_episodes` | Sonarr / TVmaze | Episodes by TVDB or TVmaze ID |

## Example

```bash
# Zero config — just run it
media-search-mcp

# Or with explicit *arr URLs
RADARR_URL=http://radarr:7878 RADARR_API_KEY=xxx \
SONARR_URL=http://sonarr:8989 SONARR_API_KEY=yyy \
media-search-mcp
```

## License

MIT
