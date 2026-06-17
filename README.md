# Story Player Microsite

Single project that supports three production outputs:

1. Standalone microsite (SPA)
2. Reusable library package (ESM + UMD)
3. Standalone CMS embed bundle (IIFE)

This setup allows one shared codebase while supporting different teams and integration paths.

## Tech Stack

- React 19
- TypeScript
- Vite 8
- Bun for package scripts

## Quick Start

```bash
bun install
bun run dev
```

## Build Modes

### 1. SPA Build (Microsite)

```bash
bun run build
```

Output:

- `dist/index.html`
- `dist/assets/*`

Use this for static hosting (Vercel/Netlify/CDN).

### 2. Library Build (Reusable Package)

```bash
bun run build:lib
```

Output:

- `dist/index.js` (ESM)
- `dist/index.umd.cjs` (UMD/CJS)
- `dist/story-player.css.css`

Use this when another app imports the story player as a dependency.

### 3. CMS Bundle Build (Embed Script)

```bash
bun run build:cms
```

Output:

- `dist/cms/story-player.min.js`
- `dist/cms/story-player.css`

Use this for CMS integration with script/link tags.

### Build Everything

```bash
bun run build:all
```

## Scripts

- `bun run dev` - start local dev server
- `bun run build` - build SPA
- `bun run build:lib` - build library output
- `bun run build:cms` - build standalone CMS bundle
- `bun run build:all` - build all targets
- `bun run build:exports` - generate extra CMS export docs/assets
- `bun run lint` - run ESLint
- `bun run preview` - preview SPA production build

## Project Structure

```text
src/
  app.tsx
  main.tsx
  data/
  features/
    story-player/
      story-player.tsx
      story-slide.tsx
      use-story-player.ts
      types.ts
      slides/
  lib/
    index.ts          # Library entry (ESM/UMD)
    cms-bundle.tsx    # CMS standalone entry
```

## Integration Guides

- CMS embedding guide: `docs/cms-embed-guide.md`
- Developer build and release guide: `docs/build-and-release-guide.md`
- Architecture notes: `docs/ARCHITECTURE.md`
- Extended technical details: `docs/MULTI_BUILD_GUIDE.md`

## Notes

- This repository standard uses Bun for dependency management and scripts.
- Source of truth for story-player logic remains in `src/features/story-player/*`.
- Build mode switching is controlled by `VITE_BUILD_MODE` in `vite.config.ts`.
