# AI Agent Integration Guide

This document is designed to be consumed by AI agents and AI coding assistants. It provides precise, structured information about the `@broville/media-search-mcp` server so that another agent can understand, configure, and use it without human intervention.

---

## Overview

| Field | Value |
|-------|-------|
| **Package** | `@broville/media-search-mcp` |
| **Protocol** | MCP (Model Context Protocol) via stdio |
| **Transport** | `StdioServerTransport` |
| **API backend** | TMDB v3 REST API (`https://api.themoviedb.org/3`) |
| **Auth** | `TMDB_API_KEY` env var (or 1Password CLI fallback) |
| **Node requirement** | `>= 18` |
| **Entry point** | `dist/index.js` (shebang: `#!/usr/bin/env node`) |

---

## Installation Methods

### Method A: Global npm install (recommended for persistent use)

```bash
npm install -g @broville/media-search-mcp
```

Resolve the absolute path to `dist/index.js` for MCP config:

```bash
node -e "console.log(require('path').join(require('child_process').execSync('npm root -g').toString().trim(), '@broville/media-search-mcp/dist/index.js'))"
```

### Method B: npx (no install)

```bash
npx -y @broville/media-search-mcp
```

**Caution:** Some MCP clients do not handle `npx` reliably in `command` fields. Prefer Method A or wrap in a small shell script if you hit timeout issues.

### Method C: From source

```bash
git clone https://github.com/Broville/media_search_mcp.git
cd media_search_mcp
npm install
npm run build
```

---

## MCP Client Configurations

Use these snippets exactly. Replace `YOUR_TMDB_KEY` with the actual key.

### Claude Desktop

File: `~/Library/Application Support/Claude/claude_desktop_config.json` (macOS) or equivalent.

```json
{
  "mcpServers": {
    "media-search": {
      "command": "node",
      "args": ["/ABSOLUTE/PATH/TO/@broville/media-search-mcp/dist/index.js"],
      "env": {
        "TMDB_API_KEY": "YOUR_TMDB_KEY"
      }
    }
  }
}
```

### Cursor

Cursor reads MCP config from its settings. Add to Cursor MCP settings JSON:

```json
{
  "mcpServers": {
    "media-search": {
      "command": "node",
      "args": ["/ABSOLUTE/PATH/TO/@broville/media-search-mcp/dist/index.js"],
      "env": {
        "TMDB_API_KEY": "YOUR_TMDB_KEY"
      }
    }
  }
}
```

### Cline / Roo Code

Same JSON shape as Cursor. Ensure the `command` is an absolute path to `node` and the args point to the built `dist/index.js`.

### Hermes Agent

Add to `~/.hermes/profiles/<profile>/config.yaml`:

```yaml
mcp:
  media-search:
    command: node
    args:
      - "/ABSOLUTE/PATH/TO/@broville/media-search-mcp/dist/index.js"
    env:
      TMDB_API_KEY: "YOUR_TMDB_KEY"
```

Then reload: `hermes mcp reload`

### Generic stdio MCP client

Any MCP client using stdio transport should use:
- **command**: `node`
- **args**: `["/ABSOLUTE/PATH/TO/dist/index.js"]`
- **env**: `{ "TMDB_API_KEY": "..." }`

---

## Tool Reference

All tools return **text content** with a JSON string payload. Parse the response text as JSON.

Error responses have the shape:
```json
{ "error": "TMDB 404: ..." }
```
and set `isError: true` in the MCP response.

### Tool: `media_search`
Multi-search across movies, TV shows, and people.

**Input schema:**
```json
{
  "query": "string (required)",
  "include_adult": "boolean (default: false)",
  "language": "string (default: 'en-US')",
  "page": "number (default: 1)"
}
```

**Output:** `TmdbSearchResult` flattened per item with `poster_url`, `backdrop_url`, `profile_url`.

**Recipe:** "Find The Matrix"
```json
{"query": "The Matrix"}
```

---

### Tool: `media_search_movies`
Movie-only search with optional year filtering.

**Input schema:**
```json
{
  "query": "string (required)",
  "year": "number (optional)",
  "primary_release_year": "number (optional)",
  "language": "string (default: 'en-US')",
  "page": "number (default: 1)"
}
```

**Recipe:** "Find movies named 'Avatar' from 2009"
```json
{"query": "Avatar", "year": 2009}
```

---

### Tool: `media_search_tv`
TV show-only search.

**Input schema:**
```json
{
  "query": "string (required)",
  "first_air_date_year": "number (optional)",
  "language": "string (default: 'en-US')",
  "page": "number (default: 1)"
}
```

**Recipe:** "Find Breaking Bad"
```json
{"query": "Breaking Bad"}
```

---

### Tool: `media_movie_details`
Full movie details by TMDB ID. Use `append` for extra data.

**Input schema:**
```json
{
  "movie_id": "number (required)",
  "append": "string (optional) — comma-separated extras. Valid: credits, videos, recommendations, similar, images, external_ids, keywords, release_dates",
  "language": "string (default: 'en-US')"
}
```

**Recipe:** "Get full cast and recommendations for Fight Club (id 550)"
```json
{"movie_id": 550, "append": "credits,recommendations"}
```

**Recipe:** "Get just the basics"
```json
{"movie_id": 550}
```

---

### Tool: `media_tv_details`
Full TV series details by TMDB ID.

**Input schema:**
```json
{
  "series_id": "number (required)",
  "append": "string (optional) — comma-separated extras. Valid: credits, videos, recommendations, similar, images, external_ids, keywords",
  "language": "string (default: 'en-US')"
}
```

**Recipe:** "Get all seasons of Game of Thrones (id 1399)"
```json
{"series_id": 1399}
```

---

### Tool: `media_tv_season`
Season details + episode list.

**Input schema:**
```json
{
  "series_id": "number (required)",
  "season_number": "number (required)",
  "language": "string (default: 'en-US')"
}
```

**Recipe:** "Get Season 1 of Breaking Bad"
```json
{"series_id": 1396, "season_number": 1}
```

---

### Tool: `media_tv_episode`
Single episode details.

**Input schema:**
```json
{
  "series_id": "number (required)",
  "season_number": "number (required)",
  "episode_number": "number (required)",
  "language": "string (default: 'en-US')"
}
```

**Recipe:** "Get details for Breaking Bad S01E01"
```json
{"series_id": 1396, "season_number": 1, "episode_number": 1}
```

---

### Tool: `media_trending`
Trending movies or TV by day or week.

**Input schema:**
```json
{
  "media_type": "string (enum: 'all' | 'movie' | 'tv', default: 'all')",
  "time_window": "string (enum: 'day' | 'week', default: 'week')",
  "language": "string (default: 'en-US')"
}
```

**Recipe:** "Trending movies this week"
```json
{"media_type": "movie", "time_window": "week"}
```

**Recipe:** "Everything trending today"
```json
{"media_type": "all", "time_window": "day"}
```

---

### Tool: `media_genres`
Get the official TMDB genre list.

**Input schema:**
```json
{
  "type": "string (enum: 'movie' | 'tv', required)",
  "language": "string (default: 'en')"
}
```

**Recipe:** "List movie genres"
```json
{"type": "movie"}
```

---

### Tool: `media_languages`
Get all languages supported by TMDB.

**Input schema:** `{}` (no parameters)

---

## Response Shape Reference

### Multi/Movie/TV search response

```json
{
  "page": 1,
  "total_pages": 10,
  "total_results": 200,
  "results": [
    {
      "id": 550,
      "media_type": "movie",
      "title": "Fight Club",
      "year": "1999",
      "overview": "A ticking-time-bomb insomniac...",
      "poster_url": "https://image.tmdb.org/t/p/w500/...jpg",
      "backdrop_url": "https://image.tmdb.org/t/p/w780/...jpg",
      "profile_url": null,
      "genre_ids": [18],
      "popularity": 45.2,
      "vote_average": 8.4,
      "vote_count": 28000,
      "original_language": "en",
      "release_date": "1999-10-15",
      "first_air_date": null,
      "origin_country": null,
      "known_for_department": null
    }
  ]
}
```

### Movie details response

```json
{
  "id": 550,
  "title": "Fight Club",
  "original_title": "Fight Club",
  "overview": "...",
  "tagline": "Mischief. Mayhem. Soap.",
  "status": "Released",
  "release_date": "1999-10-15",
  "runtime": 139,
  "budget": 63000000,
  "revenue": 100853753,
  "adult": false,
  "imdb_id": "tt0137523",
  "homepage": "http://www.foxmovies.com/movies/fight-club",
  "poster_url": "https://image.tmdb.org/t/p/w500/...jpg",
  "backdrop_url": "https://image.tmdb.org/t/p/w780/...jpg",
  "vote_average": 8.4,
  "vote_count": 28000,
  "popularity": 45.2,
  "genres": [{"id": 18, "name": "Drama"}],
  "production_companies": [...],
  "production_countries": [...],
  "spoken_languages": [...],
  "belongs_to_collection": null
}
```

### TV details response

```json
{
  "id": 1399,
  "name": "Game of Thrones",
  "original_name": "Game of Thrones",
  "overview": "...",
  "status": "Ended",
  "type": "Scripted",
  "first_air_date": "2011-04-17",
  "last_air_date": "2019-05-19",
  "in_production": false,
  "number_of_episodes": 73,
  "number_of_seasons": 8,
  "episode_run_time": [60],
  "poster_url": "https://image.tmdb.org/t/p/w500/...jpg",
  "backdrop_url": "https://image.tmdb.org/t/p/w780/...jpg",
  "vote_average": 8.4,
  "vote_count": 22000,
  "popularity": 120.5,
  "genres": [{"id": 18, "name": "Drama"}, {"id": 10765, "name": "Sci-Fi & Fantasy"}],
  "networks": [{"id": 49, "name": "HBO", ...}],
  "origin_country": ["US"],
  "original_language": "en",
  "created_by": [{"id": 123, "name": "David Benioff", ...}],
  "seasons": [
    {
      "id": 3627,
      "name": "Season 1",
      "overview": "...",
      "season_number": 1,
      "episode_count": 10,
      "air_date": "2011-04-17",
      "poster_url": "https://image.tmdb.org/t/p/w342/...jpg"
    }
  ]
}
```

---

## Agent Usage Patterns

### Pattern 1: Search → Details
When a user asks about a movie/show by name, **always search first** to get the TMDB ID, then call the details tool.

```
1. media_search_movies({"query": "Inception"})
2. media_movie_details({"movie_id": <id_from_step_1>, "append": "credits"})
```

### Pattern 2: Season → Episodes
When asked about a specific season, call `media_tv_season`. For a specific episode, call `media_tv_episode`.

```
1. media_search_tv({"query": "The Office"})
2. media_tv_season({"series_id": 2316, "season_number": 2})
```

### Pattern 3: Trending discovery
Use `media_trending` with `media_type: "all"` and `time_window: "week"` for general discovery questions.

### Pattern 4: Genre filtering
Use `media_genres` to get genre IDs, then search or display results grouped by genre.

---

## Common Pitfalls for Agents

| Pitfall | Why it happens | How to avoid |
|---------|----------------|--------------|
| Calling details without an ID | Agents sometimes hallucinate IDs | Always search first. Never guess IDs. |
| Forgetting `append` | Cast/recommendations missing | Add `append: "credits,recommendations"` when relevant |
| Wrong `media_type` in trending | Using `"movies"` instead of `"movie"` | Valid values: `"all"`, `"movie"`, `"tv"` |
| TMDB rate limits | Free keys are rate-limited | Space requests out; cache if possible |
| No images for some items | `poster_path` is `null` | Check truthiness before constructing image tags |
| Language confusion | `language` defaults to `"en-US"` | Pass `"en-US"` explicitly if unsure |
| Confusing year filters | `year` vs `primary_release_year` | `year` = any release year; `primary_release_year` = first theatrical release |

---

## Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `TMDB_API_KEY` | **Yes** (unless 1Password CLI is configured) | TMDB v3 API read access token |

**Optional:** The server will attempt 1Password CLI fallback if `TMDB_API_KEY` is missing:
```bash
op item get "TMDB API Key" --vault Server --field api-key
```

If neither env var nor 1Password works, the server exits with:
```
Error: TMDB_API_KEY not set and 1Password TMDB API Key not found.
```

---

## File Layout (for source builds)

```
media_search_mcp/
├── src/
│   ├── index.ts          # MCP server + tool handlers
│   └── tmdb.ts           # TMDB API client + interfaces
├── dist/                 # Compiled JS (published)
│   ├── index.js
│   └── tmdb.js
├── scripts/
│   └── inject-shebang.js # Build script to ensure executable shebang
├── package.json
├── tsconfig.json
├── README.md
├── CONTRIBUTING.md
├── CHANGELOG.md
├── AI_AGENTS.md          # ← This file
└── LICENSE
```

---

## Version

Current published version: **1.1.0**

Bump `version` in `src/index.ts` and `package.json` simultaneously when releasing.

---

## License

MIT © Broville
