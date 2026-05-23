# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/), and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.1.0] — 2026-05-23

### Added
- Comprehensive human-facing documentation (`README.md`, `CONTRIBUTING.md`, `CHANGELOG.md`)
- AI agent-facing documentation (`AI_AGENTS.md`) with tool schemas, usage patterns, and integration guides
- Improved installation instructions for Claude Desktop, Cline, Cursor, Roo Code, and Hermes Agent
- README expanded with response format examples, troubleshooting table, and per-agent configuration snippets

## [1.0.4] — 2026-05-20

### Added
- README: 1Password auto-fetch instructions (no env var required if `op` CLI is signed in)
- Hermes Agent config examples (npx and local install)

## [1.0.1] – [1.0.3]

### Fixed
- Publishing fixes and metadata alignment.

## [1.0.0] — 2026-05-20

### Added
- Initial release with 10 MCP tools
- Multi-search (`media_search`), movie-only (`media_search_movies`), TV-only (`media_search_tv`)
- Full details for movies (`media_movie_details`) and TV series (`media_tv_details`)
- Season (`media_tv_season`) and episode (`media_tv_episode`) lookups
- Trending (`media_trending`), genres (`media_genres`), and languages (`media_languages`)
- Automatic image URL construction for posters, backdrops, stills, and profiles
- 1Password CLI fallback for TMDB API key retrieval
- TypeScript build with declaration maps and source maps

### Notes
- Built on `@modelcontextprotocol/sdk` ^1.0.0
- Requires Node.js >= 18
- Published to npm as `@broville/media-search-mcp`
