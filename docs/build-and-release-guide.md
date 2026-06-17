# Build and Release Guide

This guide is for developers maintaining this repository.

## Overview

The project supports three build targets from one codebase:

1. SPA for standalone hosting
2. Library package for app integration
3. CMS standalone bundle for script-tag embedding

## Commands

Install dependencies:

```bash
bun install
```

Run development server:

```bash
bun run dev
```

Build targets:

```bash
bun run build
bun run build:lib
bun run build:cms
bun run build:all
```

Lint:

```bash
bun run lint
```

Preview SPA build:

```bash
bun run preview
```

## Output Mapping

### `bun run build` (SPA)

- `dist/index.html`
- `dist/assets/*`

### `bun run build:lib` (Library)

- `dist/index.js`
- `dist/index.umd.cjs`
- `dist/story-player.css.css`

### `bun run build:cms` (CMS)

- `dist/cms/story-player.min.js`
- `dist/cms/story-player.css`

## Source of Truth

Core implementation lives in:

- `src/features/story-player/story-player.tsx`
- `src/features/story-player/use-story-player.ts`
- `src/features/story-player/story-slide.tsx`
- `src/features/story-player/types.ts`

Build-specific entry files:

- `src/lib/index.ts` for library output
- `src/lib/cms-bundle.tsx` for CMS output

## Release Checklist

1. Run `bun run lint`.
2. Run `bun run build:all`.
3. Smoke test SPA output locally.
4. Validate CMS embed with one sample page.
5. Commit changes and tag release.

Optional docs generation for CMS exports:

```bash
bun run build:exports
```

## Common Changes

### Add a new story type

1. Update union types in `src/features/story-player/types.ts`.
2. Add rendering support in slide/player components.
3. Update docs in `docs/cms-embed-guide.md`.
4. Rebuild all targets.

### Change player behavior

1. Update logic in `src/features/story-player/use-story-player.ts`.
2. Test in dev mode.
3. Rebuild all targets.

## Notes

- Package manager and scripts use Bun.
- Keep file names in kebab-case.
- Keep changes centralized in core feature files so all outputs stay in sync.
