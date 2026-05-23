## Contributing

Thanks for your interest in contributing!

### Setup

1. Fork and clone the repository
2. Make sure you have **Node.js >= 18**
3. Install dependencies: `npm install`
4. Get a free TMDB API key: https://www.themoviedb.org/settings/api

### Development workflow

- Branch from `main`
- Make your changes in `src/`
- Run `npm run build` before committing (verifies TypeScript compiles)
- Keep commits atomic and messages descriptive

### What to contribute

- Bug fixes
- Additional TMDB endpoints (keep scope focused on search/discovery)
- Better error messages
- Performance improvements
- Documentation improvements

### Scope

This MCP server is intentionally scoped to **search, discovery, and basic details**. Full write operations (ratings, lists, watchlist) are out of scope.

### Code style

- TypeScript strict mode is enabled — no `any` without justification
- Prefer explicit types over inference for function signatures
- Keep tool schemas minimal — agents work best with focused inputs

### Opening a PR

1. Push your branch
2. Open a PR against `main`
3. Describe what changed and why
4. Ensure `npm run build` passes

### Code of Conduct

Be respectful. Assume good intent. Help others learn.
