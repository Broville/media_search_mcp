# @broville/media-search-mcp

An [MCP (Model Context Protocol)](https://modelcontextprotocol.io) server that lets AI agents search movies, TV shows, and people via the **TMDB API v3**.

[![npm version](https://img.shields.io/npm/v/@broville/media-search-mcp.svg)](https://www.npmjs.com/package/@broville/media-search-mcp)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

---

## What is this?

This package exposes a set of **MCP tools** that any MCP-compatible client (Claude Desktop, Cline, Cursor, Roo Code, Hermes Agent, etc.) can use to look up movie and TV show information from [The Movie Database (TMDB)](https://www.themoviedb.org).

Your agent can:
- Search for movies, TV shows, and people
- Get full details (cast, crew, budget, runtime, seasons, episodes)
- Browse trending content
- List genres and supported languages

---

## Installation

### Global install (recommended)

```bash
npm install -g @broville/media-search-mcp
```

### No-install (`npx`)

```bash
npx @broville/media-search-mcp
```

### From source

```bash
git clone https://github.com/Broville/media_search_mcp.git
cd media_search_mcp
npm install
npm run build
```

---

## Prerequisites

You need a **free TMDB API key**.

1. Create an account at [themoviedb.org](https://www.themoviedb.org)
2. Go to **Settings → API** and request an API key
3. Copy your **API Read Access Token** (or v3 API key)

Set it as an environment variable:

```bash
export TMDB_API_KEY=your_tmdb_key_here
```

> 💡 If you use [1Password CLI](https://developer.1password.com/docs/cli/), the server will automatically fall back to `op item get "TMDB API Key" --vault Server --field api-key` if the env var is not set.

---

## Agent Configuration

Below are setup snippets for popular MCP clients.

### Claude Desktop

Add to `claude_desktop_config.json`:

```json
{
  "mcpServers": {
    "media-search": {
      "command": "npx",
      "args": ["-y", "@broville/media-search-mcp"],
      "env": {
        "TMDB_API_KEY": "your_tmdb_key_here"
      }
    }
  }
}
```

> Restart Claude Desktop after editing. The tools will appear in the 🔧 menu.

### Cline / Roo Code / Cursor

Add to their MCP settings (usually JSON):

```json
{
  "mcpServers": {
    "media-search": {
      "command": "npx",
      "args": ["-y", "@broville/media-search-mcp"],
      "env": {
        "TMDB_API_KEY": "your_tmdb_key_here"
      }
    }
  }
}
```

### Hermes Agent

Add to `~/.hermes/profiles/<profile>/config.yaml`:

```yaml
mcp:
  media-search:
    command: npx
    args: ["-y", "@broville/media-search-mcp"]
    env:
      TMDB_API_KEY: "your_tmdb_key_here"
```

Or with a local install:

```yaml
mcp:
  media-search:
    command: node
    args: ["/home/echo/.npm-global/lib/node_modules/@broville/media-search-mcp/dist/index.js"]
    env:
      TMDB_API_KEY: "your_tmdb_key_here"
```

Find the global install path with:

```bash
npm root -g
```

---

## Available Tools

| Tool | Description |
|------|-------------|
| `media_search` | Multi-search across **movies + TV + people** |
| `media_search_movies` | Search movies only (with optional year filter) |
| `media_search_tv` | Search TV shows only (with optional first-air-year) |
| `media_movie_details` | Full movie details by TMDB ID — cast, crew, budget, runtime, revenue, etc. |
| `media_tv_details` | Full TV series details by TMDB ID — seasons, networks, status, creators |
| `media_tv_season` | Season details including episode list |
| `media_tv_episode` | Single episode details |
| `media_trending` | Trending movies/TV by day or week |
| `media_genres` | Genre list for movies or TV |
| `media_languages` | All supported TMDB languages |

All search results include:
- `poster_url` (optimal `w500` size)
- `backdrop_url` (optimal `w780` size)
- `still_url` / `profile_url` where applicable

---

## Response Format

All tool responses are **JSON strings** with a consistent shape:

**Search results (multi, movies, TV):**
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
      "overview": "...",
      "poster_url": "https://image.tmdb.org/t/p/w500/...jpg",
      "backdrop_url": "https://image.tmdb.org/t/p/w780/...jpg",
      "vote_average": 8.4,
      "vote_count": 28000,
      "popularity": 45.2
    }
  ]
}
```

**Details (movie/TV):**
```json
{
  "id": 550,
  "title": "Fight Club",
  "poster_url": "https://image.tmdb.org/t/p/w500/...jpg",
  "backdrop_url": "https://image.tmdb.org/t/p/w780/...jpg",
  "genres": [{"id": 18, "name": "Drama"}],
  "runtime": 139,
  "budget": 63000000,
  "revenue": 100853753,
  ...
}
```

---

## Example Conversations

> **User:** What movies has Christopher Nolan directed?  
> **Agent:** (uses `media_search` → `media_movie_details` with `append=credits`)

> **User:** Show me the first season of Breaking Bad.  
> **Agent:** (uses `media_search_tv` → `media_tv_season`)

> **User:** What's trending this week?  
> **Agent:** (uses `media_trending` with `time_window=week`)

---

## Troubleshooting

| Symptom | Fix |
|---------|-----|
| `TMDB_API_KEY not set` | Export `TMDB_API_KEY` or configure it in your agent's MCP settings |
| `404` on details | Double-check the TMDB ID (use search first) |
| Images not loading | TMDB images require a valid `poster_path`/`backdrop_path`; some items don't have artwork |
| Tools not showing in Claude | Restart Claude Desktop after editing config |

---

## Development

```bash
# Install dependencies
npm install

# Build
npm run build

# Watch mode
npm run dev

# Type check only
npm run typecheck
```

---

## Documentation

- **[AI_AGENTS.md](AI_AGENTS.md)** — Structured integration guide for AI agents (tool schemas, usage patterns, pitfalls, response shapes).
- **[CONTRIBUTING.md](CONTRIBUTING.md)** — How to set up, build, and contribute.
- **[CHANGELOG.md](CHANGELOG.md)** — Version history.

---

## License

MIT © [Broville](https://github.com/Broville)

See [LICENSE](LICENSE) for full text.
