# Contributing

Thanks for your interest in contributing to Gitbar.

## Development

```bash
bun install
bun run tauri dev
```

Requires the `gh` CLI authenticated (`gh auth login`).

## Pull Requests

1. Fork and create a branch from `main`
2. Make your changes
3. Run `bun run test` and `bunx tsc --noEmit` to verify
4. Open a PR against `main`

Keep PRs focused on a single change. If you're fixing a bug and want to refactor nearby code, split them into separate PRs.

## Issues

Use GitHub Issues for bugs and feature requests. Include steps to reproduce for bugs.

## Code Style

- TypeScript, no `any`
- Files: kebab-case, components: PascalCase, functions: camelCase
- Lint with `bunx oxlint .`
- No comments unless the logic is non-obvious

## License

By contributing, you agree that your contributions will be licensed under the MIT License.
