# Gitbar

![Gitbar Demo](.github/assets/demo.gif)

A personal GitHub dashboard that lives in your menubar. One glance, everything you need.

## Why

I got tired of context-switching between GitHub tabs. PRs here, issues there, notifications somewhere else. Every time I wanted to check "what needs my attention?" I'd open 4 tabs and lose 5 minutes.

So I built this. A single window that shows:
- **PRs** - yours, assigned, review requested, mentioned
- **Issues** - yours, assigned, mentioned
- **Repos** - owned + contributed, sorted by activity
- **Activity** - contribution graph, stars, forks, recent events

## What

2-panel layout with resizable sections:
1. **Left** - Stats, contribution calendar, activity feed (mine/others), repositories (mine/contributed) — split into two resizable panes
2. **Right** - PR list and issue list in resizable panes, click into detail view with full markdown body, comments, reviews

All lists use progressive rendering (IntersectionObserver) — only visible items are rendered, more load on scroll.

PRs show diff stats, reviewers, approval status, branch info. Issues show reactions, linked branches, task progress. Repos show stars, forks, language, topics, visibility.

Privacy toggle (lock icon) hides private repos, PRs, and issues across all panels — useful for screenshots and livestreams.

Light/dark theme. Persists to localStorage.

## Performance

3 parallel GraphQL queries + REST events, not one blocking call:
1. **Viewer** — repos, stats, calendar
2. **PR searches** — created, review requested, assigned, mentioned
3. **Issue searches** — created, assigned, mentioned

Progressive rendering: viewer data (left panel) renders as soon as it arrives. PR/issue data fills in when searches complete. Activity loads last in the background.

- **Stale-while-revalidate** — cached data renders instantly, fresh data loads behind the scenes
- **localStorage persistence** — survives app restarts, instant cold start
- **30-minute cache TTL** — subsequent opens within window are instant (no network)
- **Username persisted** — events query fires in parallel on first load instead of waiting for viewer response

## Stack

- **Tauri v2** — native wrapper, ~5MB binary
- **React 19** — UI
- **Vite 7** — build
- **Tailwind v4** — styling
- **shadcn/ui** — scroll area, avatar, badge, button
- **react-resizable-panels** — draggable panel layout

## Setup

```bash
# install deps
bun install

# dev mode
bun run tauri dev

# build
bun run tauri build
```

Requires `gh` CLI authenticated (`gh auth login`). Uses `gh auth token` to get a token at runtime — no env vars needed.

## License

MIT
